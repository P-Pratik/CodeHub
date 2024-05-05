from app import app
from flask import request, render_template
from config import dbconnect



@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/register')
def register():
    return render_template('register.html')


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
