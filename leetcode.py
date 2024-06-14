import requests
import json
import pprint as pp
from config.dbconnect import DatabaseConnection

import pycurl
from io import BytesIO

baseUrl = "https://leetcode.com/graphql?query="
altUrl = "https://leetcode.com/graphql/"
db = DatabaseConnection().connection
query = {
    "daily": """{
    activeDailyCodingChallengeQuestion {
        date
        link
        question {
            questionId
            questionFrontendId
            boundTopicId
            title
            titleSlug
            content
            translatedTitle
            translatedContent
            isPaidOnly
            difficulty
            likes
            dislikes
            isLiked
            similarQuestions
            exampleTestcases
            contributors {
                username
                profileUrl
                avatarUrl
            }
            topicTags {
                name
                slug
                translatedName
            }
            companyTagStats
            codeSnippets {
                lang
                langSlug
                code
            }
            stats
            hints
            solution {
                id
                canSeeDetail
                paidOnly
                hasVideoSolution
                paidOnlyVideo
            }
            status
            sampleTestCase
            metaData
            judgerAvailable
            judgeType
            mysqlSchemas
            enableRunCode
            enableTestMode
            enableDebugger
            envInfo
            libraryUrl
            adminUrl
            challengeQuestion {
                id
                date
                incompleteChallengeCount
                streakCount
                type
            }
            note
        }
    }
}""",
    "dailyMin": """
{
    activeDailyCodingChallengeQuestion {
        date
        link
        question {
            questionId
            questionFrontendId
            boundTopicId
            title
            titleSlug
            difficulty
            likes
            dislikes
            exampleTestcases
            topicTags {
                name
                slug
                translatedName
            }
            stats
            hints
        }
    }
}
""",
}


def fetchProblems(page, filters={}):
    collection = db["Leetcode"]
    quantity = 20
    offset = (page - 1) * quantity
    pipeline = [
        {"$sort": {"questionFrontendId": 1}},
        {"$match": filters},
        {"$skip": offset},
        {
            "$project": {
                "_id": 0,
                "problem_name": "$title",
                "difficulty": 1,
                "accuracy": "$acRate",
                "slug": "$titleSlug",
                "tags": "$topicTags",
            }
        },
        {"$limit": quantity},
    ]

    problems = collection.aggregate(pipeline)
    return list(problems)


def getDaily():
    requestUrl = f'{baseUrl}{query["daily"]}'
    response = requests.get(requestUrl)
    data = response.json()
    return data


def getDailyMin():
    requestUrl = f'{baseUrl}{query["dailyMin"]}'
    response = requests.get(requestUrl)
    data = response.json()
    return data


def getProfile(username):
    pass


def getSolveStats(username):
    query = "query ($username: String!) { matchedUser(username: $username) { submitStats { acSubmissionNum { difficulty count submissions } } } }"
    var = {"username": username}
    requestUrl = altUrl

    try:
        response = requests.post(requestUrl, json={"query": query, "variables": var})
        data = response.json()
        data = data["data"]["matchedUser"]["submitStats"]["acSubmissionNum"]
    except:
        data = {"error": "Error fetching data"}
    return data


def getSubmissionCalendar(username, year=2024):
    q = "query userProfileCalendar($username: String!, $year: Int) { matchedUser(username: $username) { userCalendar(year: $year) { activeYears submissionCalendar } } }"
    v = {"username": username, "year": year}
    requestUrl = altUrl

    try:
        response = requests.post(requestUrl, json={"query": q, "variables": v})
        data = response.json()
        data = data["data"]["matchedUser"]["userCalendar"]["submissionCalendar"]
    except:
        data = {"error": "Error fetching data"}
    return data


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

    return {"weekly": weekly, "biweekly": biweekly}


def getPastContest(page):
    query = """
        query ($page : Int!)  {
        pastContests(pageNo: $page, numPerPage: 6){
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
    except:
        data = {"error": "Error fetching data"}
    return data


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
        c.close()
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


# print(fetchProblems(1))
# pp.pprint(getSubmissionCalender())
# pp.pprint(getSubmitStats("pratik_420"))