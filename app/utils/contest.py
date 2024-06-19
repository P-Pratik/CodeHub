import requests
import json
import pprint as pp
from datetime import datetime
from config.dbconnect import DatabaseConnection

db = DatabaseConnection().connection

def getPastContests(page = 1):
    collection = db["Contest"]
    filters = {}
    limit = 10
    offset = (page - 1) * limit

    pipeline = [
        {
            "$match": filters
        },
        {
            "$sort": {
                "start_time": -1
            }
        },
        {"$skip": offset},
        {
            "$project": {
                "_id" : 0
            }
        },
        {
            "$limit": limit
        },
    ]

    contests = collection.aggregate(pipeline)
    data = list(contests)
    return data