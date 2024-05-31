import requests
import json
import pprint as pp
from config.dbconnect import connect_db

baseUrl = "https://practiceapi.geeksforgeeks.org"
db = connect_db()

def fetchProblems(page, filters={}):
    collection = db['GeeksForGeeks']
    quantity = 20
    offset = (page - 1) * quantity
    query = {
        'problem_name': 1,
        'difficulty': 1,
        'accuracy': 1,
        'slug': 1,
        'tags': 1,
        '_id': 0
    }
    sort = {
        'id' : 1
    }
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

    reqData = {"handle": username , "requestType":"", "year":"", "month":"" }
    requestUrl = f"{baseUrl}/api/v1/user/problems/submissions/"
    try:
        response = requests.post(requestUrl, data=reqData)
        response = response.json()
    except:
        response = {"error": "User not found"}

    return response

# pp.pprint(fetchProblems(1)) 