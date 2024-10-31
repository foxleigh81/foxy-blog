from flask import Flask, g, current_app
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Load the Sanity configuration
    @app.before_request
    def load_sanity_config():
        g.project_id = current_app.config['SANITY_PROJECT_ID']
        g.dataset = current_app.config['SANITY_DATASET']

    # Import the routes
    from app.routes import main

    # Register the blueprint
    app.register_blueprint(main)

    return app