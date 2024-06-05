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
import geeksforgeeks as gfg
import leetcode as lc
import os


def register_routes(app, db, bcrypt):
    @app.route("/", methods=["GET"])
    def index():
        logged_in = current_user.is_authenticated
        return render_template("index.html", logged_in=logged_in)

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

    @app.route("/update/profile", methods=["PUT"])
    @login_required
    def update_profile():
        if not request.json:
            return jsonify(success=False, error="No data provided")

        uid = request.json["uid"]
        geeksforgeeks = request.json["geeksforgeeks"]
        leetcode = request.json["leetcode"]

        user = UserPlatforms.query.filter(UserPlatforms.uid == uid).first()

        if user:
            try:
                user.geeksforgeeks = geeksforgeeks
                user.leetcode = leetcode
                db.session.commit()
                return jsonify(success=True)
            except Exception as e:
                db.session.rollback()
                return jsonify(success=False, error=str(e))
        else:
            return jsonify(success=False, error="User not found")

    # under dev
    app.route("/update-user-questions", methods=["PUT"])

    @login_required
    def update_user_questions():
        uid = current_user.uid
        return

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
            return jsonify(success=False, error=str(e))

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

            usr = User.query.filter(User.username == username).first()
            userplatforms = UserPlatforms(
                uid=usr.uid, leetcode=None, geeksforgeeks=None, hackerrank=None
            )
            db.session.add(userplatforms)
            db.session.commit()

            print(f"User {username} has been created!")
            return redirect(url_for("login"))

        elif request.method == "GET":
            return render_template("register.html")

    @app.route("/delete/<uid>", methods=["DELETE"])
    @login_required
    def delete(uid):
        User.query.filter(User.uid == uid).delete()
        db.session.commit()

        people = User.query.all()
        return render_template("index.html", people=people)

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

    @app.route("/images/<path:filename>")
    def images(filename):
        return send_from_directory("images", filename)
