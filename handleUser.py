import requests
import json
import pprint as pp
import datetime
from collections import defaultdict
from config.db_singleton import DatabaseConnection

# platforms
import geeksforgeeks as gfg
import leetcode as lc

db = DatabaseConnection().connection
col = db["Users"]

def addUserCalendar(users):
    years = [2023, 2024]
    finalMerge = defaultdict(int)

    for year in years:
        for user in users:
            platform = user["platform"]
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


def buildUserCalender(users):
    data = addUserCalendar(users)
    submissionCalender = []
    totalActiveDays = len(data)

    for key, value in data.items():
        submissionCalender.append({"date": key, "count": value})

    return submissionCalender, totalActiveDays


# -------------------------------------------------------------------------------------------------------------- #
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


# -------------------------------------------------------------------------------------------------------------- #


def getUserStats(users):
    mergedStats = []

    for user in users:
        platform = user["platform"]
        username = user["username"]

        if platform == "gfg":
            data = gfg.getSolved(username=username)
            stats = convertStatsGFG(data)

        elif platform == "lc":
            stats = lc.getSolveStats(username=username)

        else:
            print(f"Unsupported platform: {platform}")
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


def buildUserData(uid, users):
    calender, days = buildUserCalender(users)
    solvedStats = getUserStats(users)
    query = {
        "uid": uid,
        "userCalender": {"submissionCalender": calender, "totalActiveDays": days},
        # "solvedQuestions": {
        #     "questions" : [],
        #     "count" : variable
        # }
        "stats": {"solvedStats": solvedStats},
    }
    print(query)


# print(datetime.datetime.fromtimestamp(1704067200, datetime.UTC).strftime('%Y-%m-%d'))
# print(getUserQuestions())
# getUserStats()
# buildUserData(1)
