from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from config import dbconnect
import geeksforgeeks as gfg
import leetcode as lc


app = Flask(__name__, template_folder='templates')

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SECRET_KEY'] = 'key123'
db = SQLAlchemy(app)

# import routes

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)

    def __repr__(self):
        return f"User('{self.username}')"

with app.app_context():
    db.create_all()

@app.route('/', methods=['GET'])
def index():
    value1 = "NOw the damned value is This"
    mylist = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    return render_template('index.html', value1=value1, mylist=mylist)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    elif request.method == 'POST':
        username = request.form['username']
        password = request.form['password']


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User(username=username, password=password)
        db.session.add(user)
        db.session.commit()
        return 'User created!'
    
    else:
        return render_template('register.html')

@app.route('/upload', methods=['POST'])
def fileUpload():
    file = request.files['file']
    if file.content_type == 'text/plain':
        return file.read().decode('utf-8')
    
@app.route('/handlejson' , methods=['POST'])
def handlejson():
    username = request.json['username']
    password = request.json['password']
    message = f'Hello {username} your password is {password}'
    return jsonify({'message': message})

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


if __name__ == "__main__":
    app.run(debug=True) #remove on deployment