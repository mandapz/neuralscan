import os
import logging
from datetime import datetime, timezone

from flask import (
    Blueprint,
    redirect,
    jsonify,
    url_for,
    request,
    session,
    make_response,
)
from flask_login import (
    login_user,
    logout_user,
    login_required,
    current_user,
)
from authlib.integrations.flask_client import OAuth

from models.database import db, User


# ============================================================
# AUTHENTICATION
# ============================================================

auth_bp = Blueprint("auth", __name__)
oauth = OAuth()

logger = logging.getLogger(__name__)


# ============================================================
# GOOGLE OAUTH
# ============================================================

def init_oauth(app):

    oauth.init_app(app)

    oauth.register(
        name="google",

        client_id=os.environ.get(
            "GOOGLE_CLIENT_ID"
        ),

        client_secret=os.environ.get(
            "GOOGLE_CLIENT_SECRET"
        ),

        server_metadata_url=(
            "https://accounts.google.com/.well-known/"
            "openid-configuration"
        ),

        client_kwargs={
            "scope": "openid email profile",
            "prompt": "select_account",
        },
    )


# ============================================================
# GOOGLE LOGIN
# ============================================================

@auth_bp.route("/login")
def login():

    logger.info("=== GOOGLE LOGIN START ===")

    redirect_uri = url_for(
        "auth.callback",
        _external=True
    )

    logger.info(
        "Google OAuth redirect URI: %s",
        redirect_uri
    )

    return oauth.google.authorize_redirect(
        redirect_uri
    )


# ============================================================
# GOOGLE CALLBACK
# ============================================================

@auth_bp.route("/callback")
def callback():

    frontend = os.environ.get(
        "FRONTEND_URL",
        "http://localhost:3000"
    ).rstrip("/")

    logger.info("=== GOOGLE CALLBACK START ===")

    logger.info(
        "Frontend URL: %s",
        frontend
    )

    logger.info(
        "Request args: %s",
        list(request.args.keys())
    )

    # ========================================================
    # GOOGLE TOKEN
    # ========================================================

    try:

        logger.info(
            "Authorizing Google access token..."
        )

        token = oauth.google.authorize_access_token()

        logger.info(
            "Google access token received"
        )

        userinfo = token.get("userinfo")

        logger.info(
            "Userinfo received: %s",
            bool(userinfo)
        )

        if not userinfo:
            logger.error(
                "Google userinfo is empty"
            )

            return redirect(
                f"{frontend}/?auth_error=no_userinfo"
            )

    except Exception as e:

        logger.exception(
            "Google OAuth callback failed"
        )

        return redirect(
            f"{frontend}/?auth_error=oauth_failed"
        )

    # ========================================================
    # GOOGLE USER DATA
    # ========================================================

    try:

        google_id = userinfo.get("sub")
        email = userinfo.get("email")
        name = userinfo.get("name", "")
        avatar_url = userinfo.get("picture", "")

        if not google_id or not email:

            logger.error(
                "Missing Google user information"
            )

            return redirect(
                f"{frontend}/?auth_error=invalid_userinfo"
            )

        logger.info(
            "Google user: %s",
            email
        )

        # ====================================================
        # FIND USER
        # ====================================================

        user = User.query.filter_by(
            google_id=google_id
        ).first()

        # ====================================================
        # CREATE USER
        # ====================================================

        if user is None:

            logger.info(
                "Creating new user: %s",
                email
            )

            user = User(
                google_id=google_id,
                email=email,
                name=name,
                avatar_url=avatar_url,
                last_login=datetime.now(timezone.utc),
            )

            db.session.add(user)

        # ====================================================
        # UPDATE USER
        # ====================================================

        else:

            logger.info(
                "Existing user found: %s",
                user.email
            )

            user.name = name
            user.avatar_url = avatar_url
            user.last_login = datetime.now(timezone.utc)

        # ====================================================
        # DATABASE COMMIT
        # ====================================================

        db.session.commit()

        logger.info(
            "Database commit successful"
        )

        # ====================================================
        # FLASK LOGIN
        # ====================================================

        login_user(
            user,
            remember=True,
            fresh=True
        )

        logger.info(
            "login_user completed"
        )

        logger.info(
            "Current user authenticated: %s",
            current_user.is_authenticated
        )

        logger.info(
            "Current user id: %s",
            current_user.get_id()
        )

        logger.info(
            "Session after login: %s",
            dict(session)
        )

        # ====================================================
        # CREATE RESPONSE
        # ====================================================

        redirect_url = (
            f"{frontend}/history?auth=success"
        )

        response = make_response(
            redirect(
                redirect_url
            )
        )

        # ====================================================
        # DEBUG RESPONSE COOKIE
        # ====================================================

        logger.info(
            "Response status: %s",
            response.status
        )

        logger.info(
            "Response Location: %s",
            response.headers.get("Location")
        )

        logger.info(
            "Response Set-Cookie headers: %s",
            response.headers.getlist("Set-Cookie")
        )

        logger.info(
            "=== GOOGLE CALLBACK SUCCESS ==="
        )

        return response

    except Exception as e:

        logger.exception(
            "Failed after Google authentication"
        )

        db.session.rollback()

        return redirect(
            f"{frontend}/?auth_error=login_failed"
        )


# ============================================================
# CURRENT USER
# ============================================================

@auth_bp.route("/me")
def me():

    logger.info(
        "========== AUTH ME =========="
    )

    logger.info(
        "Cookies received: %s",
        list(request.cookies.keys())
    )

    logger.info(
        "Session: %s",
        dict(session)
    )

    logger.info(
        "Current user authenticated: %s",
        current_user.is_authenticated
    )

    if current_user.is_authenticated:

        logger.info(
            "Authenticated user: %s",
            current_user.email
        )

        return jsonify({
            "authenticated": True,
            "user": current_user.to_dict(),
        })

    logger.info(
        "NO AUTHENTICATED USER"
    )

    return jsonify({
        "authenticated": False,
        "user": None,
    }), 200


# ============================================================
# LOGOUT
# ============================================================

@auth_bp.route(
    "/logout",
    methods=["POST"]
)
@login_required
def logout():

    logger.info(
        "Logging out user: %s",
        current_user.email
    )

    logout_user()

    session.clear()

    return jsonify({
        "ok": True
    })
