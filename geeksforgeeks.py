import requests
import json

baseUrl = "https://practiceapi.geeksforgeeks.org"

def getDaily():
    requestUrl = f'{baseUrl}/api/vr/problems-of-day/problem/today/'
    response = requests.get(requestUrl)
    data = response.json()
    return data
