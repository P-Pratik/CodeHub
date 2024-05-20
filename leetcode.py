import requests
import json

baseUrl = "https://leetcode.com/graphql?query="

query = {
    "daily" : '''{
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
}'''
,
"dailyMin" : '''
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
'''
,
}

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
