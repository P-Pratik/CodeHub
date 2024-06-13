import requests
import json
import pprint as pp
from datetime import datetime
from config.dbconnect import DatabaseConnection

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
    problems = collection.find(filters, query).sort(sort).skip(offset).limit(quantity)
    data = list(problems)
    return data


def getDaily():
    requestUrl = f"{baseUrl}/api/vr/problems-of-day/problem/today/"
    try:
        response = requests.get(requestUrl)
        data = response.json()
    except:
        data = {"error": "Some error occurred"}
    return data

def getUpcomingContest():
    data = getContest(page = 1)
    if "error" in data:
        return data
    data = data["results"]["upcoming"]
    return data

def getPastContest(page):
    data = getContest(page)
    if "error" in data:
        return data
    data = data["results"]["past"]
    return data

def getContest(page = 1):
    requestUrl = f"{baseUrl}/api/vr/events/?page_number={page}&sub_type=all&type=contest"
    try:
        response = requests.get(requestUrl)
        data = response.json()
    except:
        data = {"error": "Some error occurred"}
    return data

def getSolved(username):
    reqData = {"handle": username, "requestType": "", "year": "", "month": ""}
    requestUrl = f"{baseUrl}/api/v1/user/problems/submissions/"
    try:
        response = requests.post(requestUrl, data=reqData)
        response = response.json()
        response = response["result"]
    except:
        response = {"error": "Some error occurred"}

    return response


def getSubmissionCalendar(username, year=datetime.now().year, month=""):
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
        response = {"error": "Some error occurred"}
    return response



# pp.pprint(fetchProblems(1))
# pp.pprint(getProfile())
# pp.pprint(getSubmissionCalender(year="2023"))
# pp.pprint(getContest())