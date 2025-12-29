from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object('config')
    
    # Enable CORS for all routes - using a simpler configuration
    CORS(app, origins="*", supports_credentials=True)
    
    db.init_app(app)

    with app.app_context():
        from . import routes
        db.create_all()

        # Lightweight migration: ensure new columns exist when running on an existing SQLite DB
        try:
            from sqlalchemy import text
            conn = db.engine.connect()
            # Check if 'creator_address' and 'created_at' exist on 'activity' table
            res = conn.execute(text("PRAGMA table_info(activity)")).fetchall()
            cols = {row[1] for row in res}
            if 'creator_address' not in cols:
                conn.execute(text("ALTER TABLE activity ADD COLUMN creator_address VARCHAR(64)"))
            if 'created_at' not in cols:
                conn.execute(text("ALTER TABLE activity ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP"))
        except Exception:
            # Best-effort; if migration fails, the app can still run with fresh DBs
            pass

        app.register_blueprint(routes.api, url_prefix='/api')

    return app
