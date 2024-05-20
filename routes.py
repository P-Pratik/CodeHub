# from __main__ import app
# from flask import request, render_template
# from flask_login import UserMixin
# from flask_wtf import FlaskForm
# from wtforms import StringField, PasswordField, SubmitField
# from wtforms.validators import Length, EqualTo, ValidationError, InputRequired
# from config import dbconnect

class RegisterForm(FlaskForm):
    username = StringField(validators=[InputRequired(), Length(min=4, max=20)], render_kw={'placeholder': 'Username'})

    password = PasswordField(validators=[InputRequired(), Length(min=8, max=150)], render_kw={'placeholder': 'Password'})

    submit = SubmitField('Register')

    def validate_username(self, username):
        existing_user_username = User.query.filter_by(
            username=username.data).first()
        if existing_user_username:
            raise ValidationError('That username already exists. Please choose a different one.')

class LoginForm(FlaskForm):
    username = StringField(validators=[InputRequired(), Length(min=4, max=20)], render_kw={'placeholder': 'Username'})

    password = PasswordField(validators=[InputRequired(), Length(min=8, max=20)], render_kw={'placeholder': 'Password'})

    submit = SubmitField('Login')


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    return render_template('login.html', form=form)


@app.route('/register', methods=['GET', 'POST'])
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