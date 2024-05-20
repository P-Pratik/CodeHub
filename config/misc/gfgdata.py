import requests
import json
import pprint

# Define the URL of the API
base_url = "https://practiceapi.geeksforgeeks.org"

# Function to fetch problems from the API
def fetch_problems():
    problems = []
    page = 1
    next = 2
    while next:
        url = f"{base_url}/api/vr/problems/?pageMode=explore&page={page}&sortBy=submissions"
        response = requests.get(url)
        data = response.json()
        if not data:
            break
        filtereddata = data.get('results', [])
        problems.extend(filtereddata)

        next = data.get('next', None)
        print(f"Page {page} done, next: {next}")
        page += 1
    return problems

# Function to save problems to a JSON file
def save_to_json(problems):
    with open("geeksforgeeks_problems.json", "w") as file:
        json.dump(problems, file)

def read_file():
    with open("geeksforgeeks_problems.json", "r") as file:
        data = json.load(file)
        return data
    
pprint.pprint(read_file())
    
# problems = fetch_problems()
# save_to_json(problems)

# url = f"{base_url}/api/vr/problems/?pageMode=explore&page=2&sortBy=submissions"
# res = requests.get(url)
# data = res.json()
# results = data.get('next', None)
# pprint.pprint(results)
