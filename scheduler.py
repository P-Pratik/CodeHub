import schedule
import time
import json
import threading
from app.models import UserPlatforms

from data_sync.user_sync import handleUser
from data_sync.contest_sync.gfg_sync import populateContestCol as gfg_populateContestCol
from data_sync.contest_sync.lc_sync import populateContestCol as lc_populateContestCol


def auto_update_profile(app, db):
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

# updates past contests, i dont think it requires app context but whatever
def contest_sync(app):
    with app.app_context():
        try:
            gfg_populateContestCol()
            lc_populateContestCol()
        except Exception as e:
            print(f"Error in auto_update: {e}")

def timely_update(app, db):
    def run_schedule():
        while True:
            schedule.run_pending()
            time.sleep(1)

    with app.app_context():
        schedule.every(1).hours.do(auto_update_profile, app, db)
        schedule.every().day.at("22:44", "Asia/Kolkata").do(contest_sync, app)
        thread = threading.Thread(target=run_schedule)
        thread.daemon = True
        thread.start()