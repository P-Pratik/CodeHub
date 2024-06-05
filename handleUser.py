import requests
import json
import pprint as pp
import geeksforgeeks as gfg
import leetcode as lc
import datetime
from config.db_singleton import DatabaseConnection

db = DatabaseConnection().connection
col = db["Users"]

def updateUserCalender():
    years = [2023,2024]
    submissionCalender = {}
    for year in years:
        gfgCalender = gfg.getSubmissionCalender(year=year)
        lcCalender = json.loads(lc.getSubmissionCalender(year=year))
        lcConverted = {}
        for key,value in lcCalender.items():
            if key == "error":
                print(value)
                return
            else:
                updatedkey = datetime.datetime.fromtimestamp(int(key), datetime.UTC).strftime('%Y-%m-%d')
                lcConverted[updatedkey] = value
        
        mergedData = merge_dictionaries(gfgCalender, lcConverted)
        submissionCalender = merge_dictionaries(submissionCalender, mergedData)
        print(len(gfgCalender), len(lcConverted), len(mergedData))
    print(submissionCalender)

def merge_dictionaries(dict1, dict2):
    merged_dict = dict1.copy()
    for key, value in dict2.items():
        if key in merged_dict:
            merged_dict[key] += value
        else:
            merged_dict[key] = value  
    return merged_dict


updateUserCalender()

# print(datetime.datetime.fromtimestamp(1704067200, datetime.UTC).strftime('%Y-%m-%d'))


