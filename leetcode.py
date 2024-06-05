import requests
import json
import pprint as pp
from config.db_singleton import DatabaseConnection

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
        {"$skip": offset},
        {"$sort": {"questionFrontendId": 1}},
        {"$match": filters},
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

def getSubmissionCalendar (username, year=2024):
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

# print(fetchProblems(1))
# pp.pprint(getSubmissionCalender())
# pp.pprint(getSubmitStats("pratik_420"))