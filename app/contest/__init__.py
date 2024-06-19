from flask import Blueprint

contest_bp = Blueprint('contest', __name__)

from . import routes
