import requests
import json
import time
import pprint as pp
from datetime import datetime
from config.dbconnect import DatabaseConnection

baseUrl = "https://practiceapi.geeksforgeeks.org"
db = DatabaseConnection().connection

def getUpcomingContest():
    data = getContest(page = 1)
    if "error" in data:
        return data
    data = data["upcoming"]
    return data

def getPastContest(page):
    data = getContest(page)
    if "error" in data:
        return data
    data = data["past"]
    if len(data) == 0:
        data = {"end": "No more contests"}
    return data

def getContest(page = 1):
    requestUrl = f"{baseUrl}/api/vr/events/?page_number={page}&sub_type=all&type=contest"
    try:
        response = requests.get(requestUrl)
        data = response.json()
        data = data["results"]
    except:
        data = {"error": "Some error occurred"}
    return data

def populateContestCol():
    collection = db["Contest"]
    page = 1
    while True:
        data = getPastContest(page)
        if "error" in data or "end" in data:
            print(data)
            break

        for contest in data:
            contest_url = f"https://practice.geeksforgeeks.org/contest/{contest["slug"]}"

            adjust = 19800 # using to adjust time from IST to UTC
            start_time = datetime.fromisoformat(contest["start_time"])
            start_time = int(start_time.timestamp()) - adjust

            end_time = datetime.fromisoformat(contest["end_time"])
            end_time = int(end_time.timestamp()) - adjust
            
            # no id so setting it to 0
            modifiedSchema = {
                "platform": "geeksforgeeks",
                "banner": contest["banner"],
                "id" : 0,
                "title": contest["name"],
                "slug": contest["slug"],
                "url": contest_url, 
                "start_time": start_time,
                "duration": end_time - start_time,
                "end_time": end_time,
                "status": "archived"
            }

            pp.pprint(modifiedSchema)

            try:
                query = collection.insert_one(modifiedSchema)
                print(f"Inserted: {query.inserted_id}")
            except Exception as e:
                print(f"Error: {e}")
                continue

        page += 1
        time.sleep(2)