from flask import render_template, request, jsonify, current_app
from flask_login import login_required, current_user
from app.profile import profile_bp
from app.models import User, UserPlatforms
from app import db

import os
from werkzeug.utils import secure_filename
import app.utils.geeksforgeeks as gfg
import app.utils.leetcode as lc
from data_sync.user_sync import handleUser, fetchUserData

@profile_bp.route("/user/<username>")
def user(username):
    user = User.query.filter(User.username == username).first()
    return render_template("home/user.html", user=user)

@profile_bp.route("/profile", methods=["GET", "POST"])
@login_required
def profile():
    if request.method == "GET":
        user = User.query.filter(User.uid == current_user.uid).first()
        userplatform = UserPlatforms.query.filter(UserPlatforms.uid == current_user.uid).first()
        return render_template("profile/profile.html", user=user, userplatform=userplatform)
    elif request.method == "POST":
        return

@profile_bp.route("/profile/<username>", methods=["GET"])
def stats(username):
    user = User.query.filter(User.username == username).first()
    try:
        data = fetchUserData(uid=user.uid)
    except Exception as e:
        print(e)
        data = {"error": "Some error occurred"}         
    return jsonify(data)


@profile_bp.route("/update/profile", methods=["PUT"])
@login_required
def update_profile():
    if not request.json:
        return jsonify(success=False, error="No data provided")

    uid = current_user.uid

    geeksforgeeks = request.json["geeksforgeeks"].strip() if request.json["geeksforgeeks"] else None
    leetcode = request.json["leetcode"].strip() if request.json["leetcode"] else None

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

@profile_bp.route("/update/stats", methods=["PUT"])
@login_required
def update_stats():
    userplatform = UserPlatforms.query.filter(UserPlatforms.uid == current_user.uid).first()
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

@profile_bp.route("/update/profile-pic", methods=["POST"])
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

    allowed_file = lambda filename: "." in filename and filename.rsplit(".", 1)[1].lower() in ["png", "jpg", "jpeg"]

    if not allowed_file(profile_pic.filename):
        return jsonify(success=False, error="Invalid file type")

    original_filename = secure_filename(profile_pic.filename)
    file_ext = os.path.splitext(original_filename)[1]
    new_filename = f"{current_user.username}_{current_user.uid}{file_ext}"
    profile_pic.filename = new_filename

    img_folder = os.path.join(current_app.config["IMAGE_UPLOAD_FOLDER"])
    old_file_path = os.path.join(img_folder, user.profile_pic)
    new_file_path = os.path.join(img_folder, new_filename)

    try:
        if os.path.exists(old_file_path) and user.profile_pic != "default.jpg":
            os.remove(old_file_path)

        profile_pic.save(new_file_path)

        user.profile_pic = new_filename
        db.session.commit()

        return jsonify(success=True)
    except Exception as e:
        print(e)
        db.session.rollback()
        return jsonify(success=False, error="Some error occurred")

@profile_bp.route("/check/username-exists", methods=["POST"])
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
