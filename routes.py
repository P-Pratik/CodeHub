from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    jsonify,
    session,
    send_from_directory,
)
from werkzeug.utils import secure_filename
from flask_login import login_user, login_required, logout_user, current_user
from models import User, UserQuestions, UserPlatforms
import os

import geeksforgeeks as gfg
import leetcode as lc
from handleUser import handleUser, fetchUserData


def register_routes(app, db, bcrypt):

    @app.route("/", methods=["GET"])
    @app.route("/index", methods=["GET"])
    def index():
        logged_in = current_user.is_authenticated
        return render_template("index.html", logged_in=logged_in)

    @app.route("/login", methods=["GET", "POST"])
    def login():
        if request.method == "GET":
            return render_template("login.html")
        elif request.method == "POST":
            username = request.form["username"]
            password = request.form["password"]
            user = User.query.filter(User.username == username).first()

            if user and bcrypt.check_password_hash(user.password, password):
                login_user(user)
                return redirect(url_for("index"))
            else:
                return "Invalid credentials"

    @app.route("/logout", methods=["GET"])
    @login_required
    def logout():
        logout_user()
        return redirect(url_for("index"))

    @app.route("/register", methods=["GET", "POST"])
    def register():
        if request.method == "POST":
            username = request.form["username"]
            email = request.form["email"]
            password = request.form["password"]
            hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

            user = User(username=username, email=email, password=hashed_password)
            db.session.add(user)
            db.session.commit()

            user = User.query.filter(User.username == username).first()
            userplatforms = UserPlatforms(
                uid=user.uid, leetcode=None, geeksforgeeks=None, hackerrank=None
            )
            db.session.add(userplatforms)
            db.session.commit()

            handleUser(uid=user.uid, users=[])
            print(f"User {username} has been created!")
            return redirect(url_for("login"))

        elif request.method == "GET":
            return render_template("register.html")

    @app.route("/user/<username>")
    def user(username):
        user = User.query.filter(User.username == username).first()
        return render_template("user.html", user=user)

    @app.route("/profile", methods=["GET", "POST"])
    @login_required
    def profile():
        if request.method == "GET":
            user = User.query.filter(User.uid == current_user.uid).first()
            userplatform = UserPlatforms.query.filter(
                UserPlatforms.uid == current_user.uid
            ).first()
            return render_template("profile.html", user=user, userplatform=userplatform)

        elif request.method == "POST":
            return

    @app.route("/contest", methods=["GET"])
    def contest():
        return render_template("contest.html")

    @app.route("/api/profile/<username>", methods=["GET"])
    def stats(username):
        user = User.query.filter(User.username == username).first()
        try:
            data = fetchUserData(uid=user.uid)
        except Exception as e:
            print(e)
            data = {"error": "Some error occurred"}
        return jsonify(data)

    @app.route("/api/contest/upcoming", methods=["GET"])
    def getcontest():
        gfgContest = gfg.getUpcomingContest()
        lcContest = lc.getUpcomingContest()
        return jsonify({"gfgcontest": gfgContest, "lccontest": lcContest})

    @app.route("/api/contest/past/<page>", methods=["POST"])
    def getPastContest(page=1):
        if request.json:
            platform = request.json["platform"]

        gfgContest = gfg.getPastContest(int(page))
        lcContest = lc.getPastContest(int(page))
        return jsonify({"gfgcontest": gfgContest, "lccontest": lcContest})

    @app.route("/update/profile", methods=["PUT"])
    @login_required
    def update_profile():
        if not request.json:
            return jsonify(success=False, error="No data provided")

        uid = current_user.uid

        if request.json["geeksforgeeks"] == None:
            geeksforgeeks = None
        else:
            geeksforgeeks = request.json["geeksforgeeks"].strip()

        if request.json["leetcode"] == None:
            leetcode = None
        else:
            leetcode = request.json["leetcode"].strip()

        user = UserPlatforms.query.filter(UserPlatforms.uid == uid).first()

        if user:
            try:
                user.geeksforgeeks = geeksforgeeks
                user.leetcode = leetcode
                db.session.commit()
                return jsonify(success=True)
            except Exception as e:
                db.session.rollback()
                print(e)
                return jsonify(success=False, error="Some error occurred")
        else:
            return jsonify(success=False, error="User not found")

    @app.route("/update/stats", methods=["PUT"])
    @login_required
    def update_stats():
        userplatform = UserPlatforms.query.filter(
            UserPlatforms.uid == current_user.uid
        ).first()
        data = [
            {"platform": "lc", "username": userplatform.leetcode},
            {"platform": "gfg", "username": userplatform.geeksforgeeks},
        ]
        try:
            handleUser(uid=current_user.uid, users=data)
            return jsonify(success=True)
        except Exception as e:
            print(e)
            return jsonify(success=False)

    @app.route("/update/profile-pic", methods=["POST"])
    @login_required
    def update_profile_pic():
        user = User.query.filter(User.uid == current_user.uid).first()

        if not user:
            return jsonify(success=False, error="User not found")

        if not request.files or "profile_pic" not in request.files:
            return jsonify(success=False, error="No file selected")

        profile_pic = request.files["profile_pic"]

        if profile_pic.filename == "":
            return jsonify(success=False, error="No file selected")

        allowed_file = lambda filename: "." in filename and filename.rsplit(".", 1)[
            1
        ].lower() in ["png", "jpg", "jpeg"]

        if not allowed_file(profile_pic.filename):
            return jsonify(success=False, error="Invalid file type")

        original_filename = secure_filename(profile_pic.filename)
        file_ext = os.path.splitext(original_filename)[1]
        new_filename = f"{current_user.username}_{current_user.uid}{file_ext}"
        profile_pic.filename = new_filename

        old_file_path = os.path.join(
            app.config["IMAGE_UPLOAD_FOLDER"], user.profile_pic
        )
        new_file_path = os.path.join(app.config["IMAGE_UPLOAD_FOLDER"], new_filename)

        try:
            if os.path.exists(old_file_path) and user.profile_pic != "default.jpg":
                os.remove(old_file_path)

            profile_pic.save(new_file_path)

            user.profile_pic = new_filename
            db.session.commit()

            return jsonify(success=True)
        except Exception as e:
            db.session.rollback()
            return jsonify(success=False, error="Some error occurred")

    @app.route("/check/username-exists", methods=["POST"])
    @login_required
    def check_username_exists():
        if not request.json:
            return jsonify(success=False, error="No data provided")

        platform = request.json["platform"]
        username = request.json["username"]

        if platform == "geeksforgeeks":
            data = gfg.usernameExists(username)
            if "error" in data:
                return jsonify(exists=False, error=data["error"])

        elif platform == "leetcode":
            data = lc.usernameExists(username)
            if "error" in data:
                return jsonify(exists=False, error=data["error"])

        return jsonify(exists=data["exists"])

    @app.route("/problem/<page>", methods=["POST"])
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

    @app.route("/getDaily", methods=["GET"])
    def daily():
        geeksdaily = gfg.getDaily()
        leetdaily = lc.getDailyMin()
        return jsonify({"geeksdaily": geeksdaily, "leetdaily": leetdaily})

    @app.route("/delete/<uid>", methods=["DELETE"])
    @login_required
    def delete(uid):
        User.query.filter(User.uid == uid).delete()
        db.session.commit()
        people = User.query.all()
        return render_template("index.html", people=people)
