from . import db
from datetime import datetime

class Activity(db.Model):
    id = db.Column(db.String(16), primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    total_items = db.Column(db.Integer, nullable=False)
    key = db.Column(db.String(64))
    merkle_root = db.Column(db.String(128))
    status = db.Column(db.String(16), default='pending')
    creator_address = db.Column(db.String(64))  # EVM address string
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

class Prize(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    activity_id = db.Column(db.String(16), db.ForeignKey('activity.id'), nullable=False)
    prize_config = db.Column(db.Text, nullable=False)

class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    activity_id = db.Column(db.String(16), db.ForeignKey('activity.id'), nullable=False)
    sid = db.Column(db.String(64), unique=True, nullable=False)
    r_i = db.Column(db.String(64), nullable=True)
    win_i = db.Column(db.Integer, nullable=True)
    leaf = db.Column(db.String(128))
    proof = db.Column(db.Text)
    encrypted_data = db.Column(db.Text)
