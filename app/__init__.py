from flask import Flask
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Import the routes
    from app.routes import main

    # Register the blueprint
    app.register_blueprint(main)

    return app