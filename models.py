from app import db
from flask_login import UserMixin

# flask --app run.py db init for the first time ONLY
# flask --app run.py db migrate and flask --app run.py db upgrade after u update stuff here
# flask --app run.py db downgrade to go back to previous version
class User(db.Model, UserMixin):
    __tablename__ = 'users'
    uid = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text, unique=True, nullable=False)
    email = db.Column(db.Text, unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)
    profile_pic = db.Column(db.Text, nullable=False, default='default.jpg')
    role = db.Column(db.Text)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def __repr__(self):
        return f'User {self.username} , Role: {self.role}'
    
    def get_id(self):
        return self.uid

class UserQuestions(db.Model):
    __tablename__ = 'user_questions'
    qid = db.Column(db.Integer, primary_key=True)
    platform = db.Column(db.Text, primary_key=True)
    uid = db.Column(db.Integer, db.ForeignKey('users.uid'), primary_key=True)
    solved_at = db.Column(db.DateTime)

    def __repr__(self):
        return f'Question {self.question} and Answer {self.answer}'
    
class UserPlatforms(db.Model):
    __tablename__ = 'user_platforms'
    uid = db.Column(db.Integer, db.ForeignKey('users.uid'), primary_key=True)
    leetcode = db.Column(db.Text)
    geeksforgeeks = db.Column(db.Text)
    hackerrank = db.Column(db.Text)

    def __repr__(self):
        return f'Platform {self.platform} and Username {self.username}'