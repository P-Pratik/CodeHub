from flask import render_template, jsonify, request
from app.contest import contest_bp
import app.utils.geeksforgeeks as gfg
import app.utils.leetcode as lc
import app.utils.contest as ct

@contest_bp.route("/contest", methods=["GET"])
def contest():
    return render_template("contest/contest.html")

@contest_bp.route("/api/contest/upcoming", methods=["GET"])
def get_contest():
    gfg_contest = gfg.getUpcomingContest()
    lc_contest = lc.getUpcomingContest()
    return jsonify({"gfgcontest": gfg_contest, "lccontest": lc_contest})

# remove GET after testing ?
@contest_bp.route("/api/contest/past/<page>", methods=["GET", "POST"])
def get_past_contest(page=1):
    contest = ct.getPastContests(int(page))
    return jsonify(contest)