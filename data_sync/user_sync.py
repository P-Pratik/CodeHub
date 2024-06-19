import requests
import json
import pprint as pp
import datetime
from collections import defaultdict
from config.dbconnect import DatabaseConnection

# platforms
import app.utils.geeksforgeeks as gfg
import app.utils.leetcode as lc

db = DatabaseConnection().connection
col = db["Users"]


def addUserCalendar(users, years):
    finalMerge = defaultdict(int)
    for year in years:
        for user in users:
            platform = user["platform"]
            if user["username"] == None or user["username"] == "":
                continue
            username = user["username"]

            if platform == "gfg":
                calendar = gfg.getSubmissionCalendar(username=username, year=year)
            elif platform == "lc":
                calendar = json.loads(
                    lc.getSubmissionCalendar(username=username, year=year)
                )
                calendar = convertCalendar(calendar)
            else:
                print(f"Unsupported platform: {platform}")
                return
            if "error" in calendar:
                print(calendar["error"])
                return
            finalMerge = mergeDictionaries(finalMerge, calendar)

    return finalMerge


def convertCalendar(calendar):
    converted = defaultdict(int)
    for key, value in calendar.items():
        if key == "error":
            print(value)
            return converted

        updated_key = datetime.datetime.fromtimestamp(int(key), datetime.UTC).strftime(
            "%Y-%m-%d"
        )
        converted[updated_key] = value

    return converted


def mergeDictionaries(dict1, dict2):
    merged_dict = defaultdict(int, dict1)

    for key, value in dict2.items():
        merged_dict[key] += value

    return merged_dict


def buildUserCalender(users, years=[2023, 2024]):
    data = addUserCalendar(users, years)
    submissionCalender = []
    totalActiveDays = 0

    # if data is not empty  
    if data:
        totalActiveDays = len(data)
        for key, value in data.items():
            submissionCalender.append({"date": key, "count": value})
        
    return submissionCalender, totalActiveDays


def getUserStats(users):
    mergedStats = [
      {
        "difficulty": "All",
        "count": 0
      },
      {
        "difficulty": "School",
        "count": 0
      },
      {
        "difficulty": "Basic",
        "count": 0
      },
      {
        "difficulty": "Easy",
        "count": 0
      },
      {
        "difficulty": "Medium",
        "count": 0
      },
      {
        "difficulty": "Hard",
        "count": 0
      }
    ]

    for user in users:
        platform = user["platform"]
        if user["username"] == None or user["username"] == "":
            continue

        username = user["username"]

        if platform == "gfg":
            data = gfg.getSolved(username=username)
            stats = convertStatsGFG(data)

        elif platform == "lc":
            stats = lc.getSolveStats(username=username)

        else:
            print(f"Unsupported platform: {platform}")
            return

        if "error" in stats:
            print(stats["error"])
            return
        mergedStats = mergeStats(mergedStats, stats)

    return mergedStats


def convertStatsGFG(data):
    stats = []
    totalCount = 0
    for difficulty, pid in data.items():
        curStats = defaultdict(int)
        totalCount += len(pid)
        curStats["difficulty"] = difficulty
        curStats["count"] = len(pid)
        stats.append(curStats)
    stats.append({"difficulty": "All", "count": totalCount})
    return stats


def mergeStats(*args):
    merged_dict = defaultdict(lambda: {"count": 0})

    def add_to_merged_dict(stats_list):
        for entry in stats_list:
            difficulty = entry["difficulty"]
            merged_dict[difficulty]["count"] += entry["count"]

    for arg in args:
        add_to_merged_dict(arg)

    merged_list = [
        {"difficulty": difficulty, "count": values["count"]}
        for difficulty, values in merged_dict.items()
    ]
    return merged_list


# TODO -------------------------------------------------------------------------------------------------------------- #
# leetcode version requires session cookie
# pushed back on developing this function
def getUserQuestions():
    pass


# pushed back on developing this function
def convertFormat(data, platform="geeksforgeeks"):
    questions = []
    for difficulty, problems in data.items():
        for pid, details in problems.items():
            question = {
                "platform": platform,
                "pid": int(pid),
                "difficulty": difficulty,
                "lang": details["lang"],
                "slug": details["slug"],
                "pname": details["pname"],
            }
            questions.append(question)
    return questions


def addUserQuestions():
    pass


# TODO end-------------------------------------------------------------------------------------------------------------- #

# ? -------------------------------------------------------------------------------------------------------------- #
# *: was overoptimizing, maybe not needed saved for future reference


def updateCalender(uid, users):
    lastUpdate = fetchLastUpdated(uid)
    years = [
        i
        for i in range(int(lastUpdate.split("-")[0]), datetime.datetime.now().year + 1)
    ]
    calender, _ = buildUserCalender(users, years)
    filtered = [i for i in calender if i["date"] >= "2024-04-16"]
    # storedLastUpdate = fetchCalenderDate(uid, lastUpdate)
    # if storedLastUpdate:
    #     filtered.insert(0, storedLastUpdate)

    print(filtered)
    # return filtered


def fetchCalenderDate(uid, date):
    pipeline = [
        {"$match": {"uid": uid}},
        {"$unwind": "$userCalender.submissionCalender"},
        {"$match": {"userCalender.submissionCalender.date": date}},
        {"$project": {"specificDate": "$userCalender.submissionCalender", "_id": 0}},
    ]
    data = col.aggregate(pipeline)
    print(list(data)[0].get("specificDate", None))
    # return list(date.get("specificDate", None))


def fetchLastUpdated(uid):
    user_data = col.find_one({"uid": uid}, {"_id": 0, "lastUpdated": 1})
    return user_data.get("lastUpdated", None)


# ? -------------------------------------------------------------------------------------------------------------- #


def buildUserData(uid, users):
    calender, activeDays = buildUserCalender(users)
    solvedStats = getUserStats(users)
    date = datetime.datetime.now().strftime("%Y-%m-%d")
    query = {
        "uid": uid,
        "userCalender": {
            "submissionCalender": calender,
            "totalActiveDays": activeDays
            },
        # "solvedQuestions": {
        #     "questions" : [],
        #     "count" : variable
        # }
        "stats": {
            "solvedStats": solvedStats
            },
        "lastUpdated": date,
    }
    result = col.insert_one(query)
    print(result.inserted_id)


def updateUserdata(uid, users):
    calender, activeDays = buildUserCalender(users)
    solvedStats = getUserStats(users)
    date = datetime.datetime.now().strftime("%Y-%m-%d")
    query = {
        "$set": {
            "userCalender.submissionCalender": calender,
            "userCalender.totalActiveDays": activeDays,
            "stats.solvedStats": solvedStats,
            "lastUpdated": date,
        }
    }

    result = col.update_one({"uid": uid}, query)
    print(result.modified_count)

def fetchUserData(uid):
    user_data = col.find_one({"uid": uid}, {"_id": 0, "uid": 0})
    return user_data

def handleUser(uid, users = []):
    user = col.find_one({"uid": uid}, {"uid": 1})
    if user:
        updateUserdata(uid, users)
    else:
        buildUserData(uid, users)

# users = [
#     {'platform': 'gfg', 'username': ''},
#     {'platform': 'lc', 'username': ''},
# ]