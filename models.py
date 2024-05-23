from app import db
from flask_login import UserMixin

# flask --app run.py db init for the first time ONLY
# flask --app run.py db migrate and flask --app run.py db upgrade after u update stuff here
class Person(db.Model):
    __tablename__ = 'people'
    pid = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text)
    age = db.Column(db.Integer)

    def __repr__(self):
        return f'Person {self.name} and age {self.age}'
    
class User(db.Model, UserMixin):
    __tablename__ = 'users'
    uid = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text, unique=True)
    password = db.Column(db.Text, nullable=False)
    role = db.Column(db.Text)
    description = db.Column(db.Text)

    def __repr__(self):
        return f'User {self.username} , Role: {self.role}'
    
    def get_id(self):
        return self.uid
