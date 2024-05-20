import requests
import json
import pprint
from urllib.parse import quote

# Define the URL of the API
base_url = "https://leetcode.com/graphql?query="

# Function to fetch problems from the API
def fetch_problems():
    problems = []
    query = '''{problemsetQuestionList: questionList(
        categorySlug: "all-code-essentials"
        limit: 1
        skip: 0
        filters: {}
    ) {
        total: totalNum
        questions: data { 
            acRate
            difficulty
            freqBar
            questionFrontendId
            isFavor
            isPaidOnly
            status
            title
            titleSlug
            topicTags {
                name
                id
                slug
            }
            hasSolution
            hasVideoSolution
        }
    }
}'''

    encoded_query = quote(query, safe='')
    url = f"{base_url}{encoded_query}"
    response = requests.get(url)
    data = response.json()
    if not data:
        print("No data found")

    filtereddata = data.get('data', {}).get('problemsetQuestionList', {}).get('questions', [])
    problems.extend(filtereddata)

    pprint.pprint(data)
    return problems

# Function to save problems to a JSON file
def save_to_json(problems):
    with open("leetcode_problems.json", "w") as file:
        json.dump(problems, file)

def read_file():
    with open("geeksforgeeks_problems.json", "r") as file:
        data = json.load(file)
        return data
    
# pprint.pprint(fetch_problems())
    
problems = fetch_problems()

# save_to_json(problems)

# url = f"{base_url}/api/vr/problems/?pageMode=explore&page=2&sortBy=submissions"
# res = requests.get(url)
# data = res.json()
# results = data.get('next', None)
# pprint.pprint(results)
