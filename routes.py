from flask import Flask, render_template, request, redirect, url_for, jsonify, session
from flask_login import login_user, login_required, logout_user, current_user
from models import User, UserQuestions, UserPlatforms
from config import dbconnect
import geeksforgeeks as gfg
import leetcode as lc


def update_geeksforgeeks(uid, db):
    user = UserPlatforms.query.filter(UserPlatforms.uid == uid).first()
    gfghandle = user.geeksforgeeks
    gfgdata = gfg.getProfile(username=gfghandle)
    solved = gfgdata["result"]
    for difficulty, questions in solved.items():
        for qid in questions.keys():
            question = UserQuestions(uid=uid, qid=qid, platform="geeksforgeeks")
            try:
                db.session.add(question)
                db.session.commit()
                return jsonify(success=True)
            except Exception as e:
                db.session.rollback()
                print(e)
                return jsonify(success=False, error="Some error occured")






def register_routes(app, db, bcrypt):
    @app.route('/', methods=['GET'])
    def index():
        logged_in = current_user.is_authenticated
        return render_template('index.html', logged_in=logged_in)
    
    @app.route('/u/<uid>', methods=['GET'])
    def u(uid):
        user = User.query.filter(User.uid == uid).first()
        return render_template('user.html', user=user)

    @app.route('/profile', methods=['GET', 'POST'])
    @login_required
    def profile():
        if request.method == 'GET':
            user = User.query.filter(User.uid == current_user.uid).first()
            userplatform = UserPlatforms.query.filter(UserPlatforms.uid == current_user.uid).first()
            return render_template('profile.html', user=user, userplatform=userplatform)


        elif request.method == 'POST':
            user = User.query.filter(User.uid == current_user.uid).first()
            return redirect(url_for('index'))

    @app.route('/update-profile', methods=['PUT'])
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


    @app.route('/update-user-questions', methods=['PUT'])
    @login_required
    def update_user_questions():
        uid = current_user.uid
        result = update_geeksforgeeks(uid ,db)
        return result
    
    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if request.method == 'GET':
            return render_template('login.html')
        elif request.method == 'POST':
            username = request.form['username']
            password = request.form['password']
            user = User.query.filter(User.username == username).first()

            if user and bcrypt.check_password_hash(user.password, password):
                login_user(user)
                return redirect(url_for('index'))
            else:
                return 'Invalid credentials'

    @app.route('/logout', methods=['GET'])
    @login_required
    def logout():
        logout_user()
        return redirect(url_for('index'))


    @app.route('/register', methods=['GET', 'POST'])
    def register():
        if request.method == 'POST':
            username = request.form['username']
            email = request.form['email']
            password = request.form['password']
            hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
            user = User(username=username, email=email, password=hashed_password)

            db.session.add(user)
            db.session.commit()

            usr = User.query.filter(User.username == username).first()
            userplatforms = UserPlatforms(uid=usr.uid, leetcode=None, geeksforgeeks=None, hackerrank=None)
            db.session.add(userplatforms)
            db.session.commit()

            print(f'User {username} has been created!')
            return redirect(url_for('login'))
                
        elif request.method == 'GET':
            return render_template('register.html')


    @app.route('/delete/<uid>', methods=['DELETE'])
    @login_required
    def delete(uid):
        User.query.filter(User.uid == uid).delete()
        db.session.commit()

        people = User.query.all()
        return render_template('index.html', people=people)


    @app.route('/problem/<page>', methods=['POST'])
    def problem(page):
        problems = gfg.fetchProblems(int(page))
        return jsonify(problems) 

    @app.route('/getDaily', methods=['GET'])
    def daily():
        geeksdaily = gfg.getDaily()
        leetdaily = lc.getDailyMin()
        return jsonify({'geeksdaily': geeksdaily, 'leetdaily': leetdaily})