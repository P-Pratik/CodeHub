import requests
import json
import pprint as pp
from datetime import datetime
from config.db_singleton import DatabaseConnection

baseUrl = "https://practiceapi.geeksforgeeks.org"
db = DatabaseConnection().connection

def fetchProblems(page, filters={}):
    collection = db["GeeksForGeeks"]
    quantity = 20
    offset = (page - 1) * quantity
    query = {
        "problem_name": 1,
        "difficulty": 1,
        "accuracy": 1,
        "slug": 1,
        "tags": 1,
        "_id": 0,
    }
    sort = {"id": 1}
    problems = collection.find(filters, query).skip(offset).limit(quantity).sort(sort)
    return list(problems)


def getDaily():
    requestUrl = f"{baseUrl}/api/vr/problems-of-day/problem/today/"
    try:
        response = requests.get(requestUrl)
        data = response.json()
    except:
        data = {"error": "Error fetching data"}
    return data


def getProfile(username="pratikp2lgv"):

    reqData = {"handle": username, "requestType": "", "year": "", "month": ""}
    requestUrl = f"{baseUrl}/api/v1/user/problems/submissions/"
    try:
        response = requests.post(requestUrl, data=reqData)
        response = response.json()
    except:
        response = {"error": "User not found"}

    return response


def getSubmissionCalender(username="pratikp2lgv", year=datetime.now().year, month=""):
    if not username or username == "":
        return {"error": "Username not provided"}

    if month == "":
        requestType = "getYearwiseUserSubmissions"
    else:
        requestType = "getMonthwiseUserSubmissions"

    requestUrl = f"{baseUrl}/api/v1/user/problems/submissions/"
    try:
        reqData = {
            "handle": username,
            "requestType": requestType,
            "year": year,
            "month": month,
        }
        response = requests.post(requestUrl, data=reqData)
        response = response.json()
        response = response["result"]
    except:
        response = {"error": "User not found"}
    return response

# pp.pprint(fetchProblems(1))
# pp.pprint(getSubmissionCalender(year="2023"))

