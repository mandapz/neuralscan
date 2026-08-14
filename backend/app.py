import os
import logging

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_login import LoginManager
from flask_migrate import Migrate
from dotenv import load_dotenv

from models.database import db, User
from routes.auth import auth_bp, init_oauth
from routes.detect import detect_bp
from routes.history import history_bp


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s  %(name)s  %(message)s"
)

logger = logging.getLogger(__name__)


# ============================================================
# CREATE APP
# ============================================================

def create_app():

    # --------------------------------------------------------
    # Detect Vercel environment
    # --------------------------------------------------------

    is_vercel = bool(os.environ.get("VERCEL"))

    # --------------------------------------------------------
    # Flask application
    #
    # Vercel filesystem (/var/task) is read-only.
    # Therefore Flask instance directory must be /tmp.
    # --------------------------------------------------------

    if is_vercel:
        app = Flask(
            __name__,
            instance_path="/tmp/neuralscan-instance"
        )
    else:
        app = Flask(__name__)

    # --------------------------------------------------------
    # SECRET KEY
    # --------------------------------------------------------

    app.config["SECRET_KEY"] = os.environ.get(
        "FLASK_SECRET_KEY",
        "dev-secret"
    )

    # --------------------------------------------------------
    # DATABASE
    # --------------------------------------------------------

    database_url = os.environ.get("DATABASE_URL")

    if database_url:
        # Some PostgreSQL providers still return postgres://
        # which SQLAlchemy expects as postgresql://
        if database_url.startswith("postgres://"):
            database_url = database_url.replace(
                "postgres://",
                "postgresql://",
                1
            )

    else:
        # Local development
        if not is_vercel:
            database_url = "sqlite:///neuralscan.db"

        # Temporary database for Vercel.
        # NOTE: /tmp is not persistent.
        else:
            database_url = "sqlite:////tmp/neuralscan.db"

    app.config["SQLALCHEMY_DATABASE_URI"] = database_url

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # --------------------------------------------------------
    # UPLOAD LIMIT
    # --------------------------------------------------------

    max_content_length_mb = int(
        os.environ.get(
            "MAX_CONTENT_LENGTH_MB",
            10
        )
    )

    app.config["MAX_CONTENT_LENGTH"] = (
        max_content_length_mb * 1024 * 1024
    )

    # --------------------------------------------------------
    # SESSION CONFIGURATION
    # --------------------------------------------------------

    app.config["SECRET_KEY"] = os.environ.get("FLASK_SECRET_KEY")

    app.config["SESSION_COOKIE_NAME"] = "neuralscan_session"
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SECURE"] = is_vercel
    app.config["SESSION_COOKIE_SAMESITE"] = "None"
    app.config["SESSION_COOKIE_PATH"] = "/"

    # --------------------------------------------------------
    # CORS
    # --------------------------------------------------------

    frontend_url = os.environ.get(
        "FRONTEND_URL",
        "http://localhost:3000"
    )

    CORS(
        app,
        origins=[frontend_url],
        supports_credentials=True
    )

    @app.after_request
    def log_response(response):
        if request.path == "/api/auth/callback":
            logger.info(
                "=== CALLBACK RESPONSE ==="
            )

            logger.info(
                "Status: %s",
                response.status
            )

            logger.info(
                "Set-Cookie: %s",
                response.headers.getlist("Set-Cookie")
            )

            logger.info(
                "Location: %s",
                response.headers.get("Location")
            )
        return response

    # --------------------------------------------------------
    # DATABASE INITIALIZATION
    # --------------------------------------------------------

    db.init_app(app)

    migrate = Migrate(
        app,
        db
    )

    # Prevent unused-variable warning
    _ = migrate

    # --------------------------------------------------------
    # LOGIN MANAGER
    # --------------------------------------------------------

    login_manager = LoginManager(app)

    login_manager.session_protection = "basic"

    @login_manager.user_loader
    def load_user(user_id):
        try:
            return db.session.get(
                User,
                int(user_id)
            )
        except (TypeError, ValueError):
            return None

    @login_manager.unauthorized_handler
    def unauthorized():
        return jsonify({
            "error": "Authentication required"
        }), 401

    # --------------------------------------------------------
    # OAUTH
    # --------------------------------------------------------

    init_oauth(app)

    # --------------------------------------------------------
    # BLUEPRINTS
    # --------------------------------------------------------

    app.register_blueprint(
        auth_bp,
        url_prefix="/api/auth"
    )

    app.register_blueprint(
        detect_bp,
        url_prefix="/api"
    )

    app.register_blueprint(
        history_bp,
        url_prefix="/api/history"
    )

    # ========================================================
    # HEALTH CHECK
    # ========================================================

    @app.route("/api/health", methods=["GET"])
    def health():

        try:
            from utils.model import _load_model

            model = _load_model()

            return jsonify({
                "status": "ok",
                "version": "1.0.0",
                "model": "live" if model else "mock"
            })

        except Exception as e:

            logger.exception(
                "Health check failed"
            )

            return jsonify({
                "status": "error",
                "version": "1.0.0",
                "model": "error",
                "error": str(e)
            }), 500

    # ========================================================
    # ROOT
    # ========================================================

    @app.route("/", methods=["GET"])
    def index():

        return jsonify({
            "name": "NeuralScan Backend",
            "status": "ok",
            "version": "1.0.0"
        })

    # ========================================================
    # 404
    # ========================================================

    @app.errorhandler(404)
    def not_found(error):

        return jsonify({
            "error": "Not found"
        }), 404

    # ========================================================
    # 413
    # ========================================================

    @app.errorhandler(413)
    def too_large(error):

        return jsonify({
            "error": "File too large"
        }), 413

    # ========================================================
    # GENERAL ERROR
    # ========================================================

    @app.errorhandler(500)
    def internal_error(error):

        logger.exception(
            "Internal server error"
        )

        return jsonify({
            "error": "Internal server error"
        }), 500

    # ========================================================
    # LOG CONFIGURATION
    # ========================================================

    logger.info(
        "NeuralScan application initialized"
    )

    logger.info(
        "Environment: %s",
        "Vercel" if is_vercel else "Local"
    )

    logger.info(
        "Database: %s",
        (
            "configured"
            if os.environ.get("DATABASE_URL")
            else "SQLite fallback"
        )
    )

    return app


# ============================================================
# LOCAL DEVELOPMENT
# ============================================================

if __name__ == "__main__":

    app = create_app()

    port = int(
        os.environ.get(
            "PORT",
            5001
        )
    )

    app.run(
        host="0.0.0.0",
        port=port,
        debug=True
    )