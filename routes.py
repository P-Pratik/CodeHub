from flask import Flask, render_template, request, redirect, url_for, jsonify, session
from flask_login import login_user, login_required, logout_user, current_user
from models import Person, User
from config import dbconnect
import geeksforgeeks as gfg
import leetcode as lc


def register_routes(app, db, bcrypt):
    @app.route('/', methods=['GET'])
    def index():
        logged_in = current_user.is_authenticated
        return render_template('index.html', logged_in=logged_in)

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
    def logout():
        logout_user()
        return redirect(url_for('index'))


    @app.route('/register', methods=['GET', 'POST'])
    def register():
        if request.method == 'POST':
            username = request.form['username']
            password = request.form['password']
            hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
            user = User(username=username, password=hashed_password)
            db.session.add(user)
            db.session.commit()

            print(f'User {username} has been created!')
            return redirect(url_for('login'))
                
        elif request.method == 'GET':
            return render_template('register.html')
    
    @app.route('/delete/<pid>', methods=['DELETE'])
    def delete(pid):
        Person.query.filter(Person.pid == pid).delete()
        db.session.commit()

        people = Person.query.all()
        return render_template('index.html', people=people)

    @app.route('/problem', methods=['POST'])
    def problem():
        db = dbconnect.connect_db()
        collection = db['Leetcode']
        per_page = 50
        offset = (page - 1) * per_page
        
        additional_params = request.json
        page = request.args.get('page', 1, type=int)

        questions_cursor = collection.find({}, {'questionFrontendId': 1,'title': 1, 'difficulty': 1, 'acRate': 1, 'titleSlug': 1, '_id': 0}).skip(offset).limit(per_page)
        questions = list(questions_cursor)
        print(questions)
        
        return render_template('index.html', questions=questions, page=page, per_page=per_page)

    @app.route('/getDaily', methods=['GET'])
    def daily():
        geeksdaily = gfg.getDaily()
        leetdaily = lc.getDailyMin()
        return jsonify({'geeksdaily': geeksdaily, 'leetdaily': leetdaily})