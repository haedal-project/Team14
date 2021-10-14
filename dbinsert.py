from pymongo import MongoClient

client = MongoClient('localhost', 27017)
db = client.project

places = [
    {
        "place_id": "121212",
        "title": "낙성대 공원",
        "rating": 4.12,
        "review_count": 40,
        "enter_amount": 40.1,
    },
    {
        "place_id": "34343434",
        "title": "한강공원",
        "rating": 2.23,
        "review_count": 60,
        "enter_amount": 20.1,
    }
]

reviews = [
    {
        "place_id": "121212",
        "user_id": "manijang2",
        "rating": "1",
        "review": "리뷰 내용입니다1",
        "enter_with": False,
        "like": False
    },
    {
        "place_id": "121212",
        "user_id": "manijang3",
        "rating": "3",
        "review": "리뷰 내용입니다2",
        "enter_with": True,
        "like": True
    },
    {
        "place_id": "3434343",
        "user_id": "manijang4",
        "rating": "4",
        "review": "리뷰 내용입니다3",
        "enter_with": False,
        "like": True
    },
]

db.place.delete_many({})
db.place.insert_many(places)

db.review.delete_many({})
db.review.insert_many(reviews)
