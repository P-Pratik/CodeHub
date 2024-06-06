from config.dbconnect import DatabaseConnection

db = DatabaseConnection().connection
col = db["Users"]

user = col.find_one({"uid": 1})

print(type(user))   