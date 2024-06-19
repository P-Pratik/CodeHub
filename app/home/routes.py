from flask import render_template
from flask_login import current_user
from app.home import home_bp
from app.models import User

@home_bp.route("/", methods=["GET"])
@home_bp.route("/index", methods=["GET"])
def index():
    logged_in = current_user.is_authenticated
    return render_template("home/index.html", logged_in=logged_in)