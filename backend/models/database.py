from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = "users"
    id         = db.Column(db.Integer, primary_key=True)
    google_id  = db.Column(db.String(128), unique=True, nullable=False, index=True)
    email      = db.Column(db.String(256), unique=True, nullable=False)
    name       = db.Column(db.String(256), nullable=True)
    avatar_url = db.Column(db.String(512), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    last_login = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    scans      = db.relationship("ScanHistory", back_populates="user", lazy="dynamic", cascade="all, delete-orphan")

    def to_dict(self):
        return {"id": self.id, "email": self.email, "name": self.name, "avatar_url": self.avatar_url}

class ScanHistory(db.Model):
    __tablename__ = "scan_history"
    id            = db.Column(db.Integer, primary_key=True)
    user_id       = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)
    file_name     = db.Column(db.String(256), nullable=True)
    file_size_kb  = db.Column(db.Float, nullable=True)
    image_width   = db.Column(db.Integer, nullable=True)
    image_height  = db.Column(db.Integer, nullable=True)
    label         = db.Column(db.String(16), nullable=False)
    confidence    = db.Column(db.Float, nullable=False)
    raw_score     = db.Column(db.Float, nullable=True)
    description   = db.Column(db.Text, nullable=True)
    signals       = db.Column(db.JSON, nullable=True)
    thumbnail_b64 = db.Column(db.Text, nullable=True)
    scanned_at    = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    user          = db.relationship("User", back_populates="scans")

    def to_dict(self):
        return {
            "id": self.id, "file_name": self.file_name,
            "file_size_kb": self.file_size_kb,
            "image_width": self.image_width, "image_height": self.image_height,
            "label": self.label, "confidence": round(self.confidence, 1),
            "description": self.description, "signals": self.signals or [],
            "thumbnail": self.thumbnail_b64,
            "scanned_at": self.scanned_at.isoformat() if self.scanned_at else None,
        }
