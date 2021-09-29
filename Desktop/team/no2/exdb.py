from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")

db = client.project

codes = [
    {"title": "서울역", "x": 37.55557204038986, "y":126.97086288999319, "like": 0},
    {"title": "홍대역", "x": 37.55772878020116, "y": 126.92443206582216, "like": 0},
    {"title": "신촌역", "x": 37.55651354243585, "y": 126.94001089267073, "like": 0},
    {"title": "동대문역사문화공원역", "x": 37.565995621593025, "y": 127.00802933789727, "like": 0},
    {"title": "건대입구역", "x": 37.54078034225141, "y": 127.07099797804028, "like": 0},
]
db.puppy.insert_many(codes)
