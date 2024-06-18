import schedule
import time
import json
import threading
from models import UserPlatforms
from handleUser import handleUser

def auto_update(app, db):
    with app.app_context():
        try:
            users = UserPlatforms.query.all()
            for user in users:
                data = [
                    {"platform": "lc", "username": user.leetcode},
                    {"platform": "gfg", "username": user.geeksforgeeks},
                ]
                handleUser(uid=user.uid, users=data)
        except Exception as e:
            print(f"Error in auto_update: {e}")

def timely_update(app, db):
    def run_schedule():
        while True:
            schedule.run_pending()
            time.sleep(1)

    with app.app_context():
        schedule.every(1).hours.do(auto_update, app, db)
        thread = threading.Thread(target=run_schedule)
        thread.daemon = True
        thread.start()