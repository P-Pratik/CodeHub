from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_bcrypt import Bcrypt
import os


app = Flask(__name__, template_folder='templates')
db = SQLAlchemy()

def create_app():
    IMAGE_FOLDER = "images/"
    app = Flask(__name__, template_folder='templates')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///codehub.db'
    app.config['SECRET_KEY'] = 'key123'
    app.config['IMAGE_UPLOAD_FOLDER'] = IMAGE_FOLDER

    db.init_app(app)

    login_manager = LoginManager()
    login_manager.init_app(app)


    from models import User
    @login_manager.user_loader
    def load_user(uid):
        return User.query.get(uid)

    bcrypt = Bcrypt(app)

    from routes import register_routes
    register_routes(app, db, bcrypt)

    migrate = Migrate(app, db, render_as_batch=True)

    return app

