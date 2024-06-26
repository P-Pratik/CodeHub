from flask import jsonify, request, render_template
from flask_login import login_required
from app import db
from app.problem import problem_bp
from app.models import User

from data_sync.user_sync import fetchUserData
import app.utils.geeksforgeeks as gfg
import app.utils.leetcode as lc

@problem_bp.route("/problems")
def problems():
    return render_template("problem/problems.html")

@problem_bp.route("/problem/<page>", methods=["POST"])
def problem(page):
    platform = "geeksforgeeks"
    filters = {}
    if request.json:
        platform = request.json["platform"]
        filters = request.json["filters"]

    if platform == "leetcode":
        problems = lc.fetchProblems(int(page), filters)
    elif platform == "geeksforgeeks":
        problems = gfg.fetchProblems(int(page), filters)

    return jsonify(problems)

@problem_bp.route("/getDaily", methods=["GET"])
def daily():
    geeksdaily = gfg.getDaily()
    leetdaily = lc.getDailyMin()
    return jsonify({"geeksdaily": geeksdaily, "leetdaily": leetdaily})
