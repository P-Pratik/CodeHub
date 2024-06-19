import requests
import pycurl
from io import BytesIO
import pprint as pp
import time
import json
from config.dbconnect import DatabaseConnection

baseUrl = "https://leetcode.com/graphql?query="
altUrl = "https://leetcode.com/graphql/"
db = DatabaseConnection().connection


def getContestMin():
    query = """
            query mostRecentPastContest {
                pastContests(pageNo: 1, numPerPage: 3) {
                    data {
                        title
                        titleSlug
                    }
                }
            }
    """
    requestUrl = altUrl

    try:
        response = requests.post(requestUrl, json={"query": query})
        data = response.json()
        data = data["data"]["pastContests"]["data"]
    except:
        data = {"error": "Error fetching data"}
    return data

def getUpcomingContest():
    data = getContestMin()
    pastBiweekly = 0
    pastWeekly = 0
    contestUrl = "https://leetcode.com/contest"
    for contest in data:
        slug = contest["titleSlug"]
        split = slug.split("-")
        if split[0] == "weekly":
            if pastWeekly < int(split[2]):
                pastWeekly = int(split[2])
        elif split[0] == "biweekly":
            pastBiweekly = int(split[2])

    weekly = contestInfo(f"weekly-contest-{pastWeekly+1}")
    biweekly = contestInfo(f"biweekly-contest-{pastBiweekly+1}")

    return [weekly, biweekly]

# For some reason [ javascript and cookies requirement ] requests doesnt work with this url
def contestInfo(contestName):
    response_buffer = BytesIO()
    c = pycurl.Curl()
    c.setopt(c.URL, f"https://leetcode.com/contest/api/info/{contestName}/")
    headers = [
        "Host: leetcode.com",
        "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
        "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language: en-US,en;q=0.5",
        "Upgrade-Insecure-Requests: 1",
        "Sec-Fetch-Dest: document",
        "Sec-Fetch-Mode: navigate",
        "Sec-Fetch-Site: none",
        "Sec-Fetch-User: ?1",
        "Priority: u=1",
        "Te: trailers",
    ]
    c.setopt(c.HTTPHEADER, headers)

    try:
        c.setopt(c.WRITEDATA, response_buffer)
        c.perform()
        response_code = c.getinfo(pycurl.HTTP_CODE)
        
        if response_code == 429:
            print("Rate limit exceeded. Waiting before retrying...")
            time.sleep(120)
            return contestInfo(contestName)

        response_content = response_buffer.getvalue().decode("utf-8")
        response_content = json.loads(response_content)
        response_content = response_content["contest"]
        if "description" in response_content:
            del response_content["description"]
        response_content["url"] = f"https://leetcode.com/contest/{contestName}/"
        return response_content

    except Exception as e:
        print(f"Error: {e}")
        return {"error": "Error fetching data"}
    finally:
        c.close()


def getPastContest(page):
    query = """
        query ($page : Int!)  {
        pastContests(pageNo: $page, numPerPage: 10){
            data {
                title
                titleSlug
            }
        }
    }

    """
    var = {"page": page}
    requestUrl = altUrl

    try:
        response = requests.post(requestUrl, json={"query": query, "variables": var})
        data = response.json()
        data = data["data"]["pastContests"]["data"]
        if len(data) == 0:
            return {"end": True}
        contests = []
        print(data)
        for contest in data:
            print(contest["titleSlug"])
            contests.append(contestInfo(contest["titleSlug"]))
            time.sleep(1)

    except Exception as e:
        print(e)
        contests = {"error": "Error fetching data"}
    return contests

def populateContestCol():
    collection = db["Contest"]
    page = 1
    while True:
        data = getPastContest(page)
        if "end" in data or "error" in data:
            break
        for contest in data:
            banner = ""
            if "biweekly" in contest["title_slug"]:
                banner = "leetcode-biweekly"
            else:
                banner = "leetcode-weekly"

            modifiedSchema = {
                "platform": "leetcode",
                "banner": banner,
                "id" : contest["id"],
                "title": contest["title"],
                "slug": contest["title_slug"],
                "url": contest["url"],
                "start_time": contest["start_time"],
                "duration": contest["duration"],
                "end_time": contest["start_time"] + contest["duration"],
                "status": "archived"
            }
            try:
                query = collection.insert_one(modifiedSchema)
                print(f"Inserted: {query.inserted_id}")
            except Exception as e:
                print(f"Error: {e}")
                continue

        page += 1
        time.sleep(5)