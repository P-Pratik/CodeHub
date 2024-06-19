from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_bcrypt import Bcrypt
import os

db = SQLAlchemy()
login_manager = LoginManager()
bcrypt = Bcrypt()
migrate = Migrate()

def create_app():
    app = Flask(__name__, template_folder='templates')
    IMAGE_FOLDER = os.path.join(app.root_path, 'static', 'images')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///codehub.db'
    app.config['SECRET_KEY'] = 'key123'
    app.config['IMAGE_UPLOAD_FOLDER'] = IMAGE_FOLDER

    db.init_app(app)
    login_manager.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db, render_as_batch=True)

    from app.models import User
    @login_manager.user_loader
    def load_user(uid):
        return User.query.get(uid)

    # blueprints
    from app.home import home_bp
    from app.auth import auth
    from app.problem import problem_bp
    from app.profile import profile_bp
    from app.contest import contest_bp
    from app.errors import error_bp
    

    app.register_blueprint(home_bp)
    app.register_blueprint(auth, url_prefix='/auth')
    app.register_blueprint(problem_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(contest_bp)
    app.register_blueprint(error_bp)

    return app