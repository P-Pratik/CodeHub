from pymongo import MongoClient
from pymongo.server_api import ServerApi

def connect_db():
    uri = "mongodb+srv://CodehubAdmin:Dhsg0kfZoY38Tl0v@cluster0.6x2hp7m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    client = MongoClient(uri, server_api=ServerApi('1'))

    try:
        client.Codehub.command('ping')
        print("Pinged your deployment. You successfully connected to MongoDB!")
    except Exception as e:
        print(e)

    return client.CodeHub
