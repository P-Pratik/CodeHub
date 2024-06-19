from flask import Blueprint

problem_bp = Blueprint("problem", __name__)

from app.problem import routes