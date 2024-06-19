from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
)
from app.auth import auth
from flask_login import login_user, login_required, logout_user, current_user
from app.models import User, UserPlatforms
from app import db, bcrypt
from data_sync.user_sync import handleUser

@auth.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("auth/login.html")
    elif request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        user = User.query.filter(User.username == username).first()

        if user and bcrypt.check_password_hash(user.password, password):
            login_user(user)
            return redirect(url_for("home.index"))
        else:
            return "Invalid credentials"
        
@auth.route("/logout", methods=["GET"])
@login_required
def logout():
    logout_user()
    return redirect(url_for("home.index"))

@auth.route("/register", methods=["GET", "POST"])
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
        return redirect(url_for("auth.login"))

    elif request.method == "GET":
        return render_template("auth/register.html")
    
@auth.route("/delete/<uid>", methods=["DELETE"])
@login_required
def delete(uid):
    User.query.filter(User.uid == uid).delete()
    db.session.commit()
    people = User.query.all()
    return render_template("home/index.html", people=people)