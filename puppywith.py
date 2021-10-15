from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient
app = Flask(__name__)

client = MongoClient('localhost', 27017)
db = client.project

@app.route('/')
def main():
    return render_template('puppywith.html')

@app.route('/api/recommend', methods=['GET'])
def show_withpuppy():
    id_receive = request.args.get("id_give")
    places = list(db.places.find({}, {'_id': False}).sort("like_count", -1))
    login_like = list(db.likes.find({"user_id": id_receive}, {'_id': False}))
    return jsonify({'places': places, 'login_like':login_like})

@app.route('/api/login/recommend/distinct', methods=['GET'])
def login_show_stars():
    id_receive = request.args.get("id_give")
    like_star = list(db.places.find({},{'_id':False}).sort("like_count", -1))
    login_like = list(db.likes.find({"user_id":id_receive},{'_id':False}))
    return jsonify({'like': like_star, 'login_like':login_like})

@app.route('/api/like_button', methods=['POST'])
def like_star():
    name_receive = request.form['name_give']
    target_star= db.places.find_one({"title": name_receive})
    count_like = target_star['like_count']

    login_star = db.likes.find_one({"title": name_receive})
    login_like = login_star['like']

    if login_like=="True" :
        new_like = count_like - 1
        login_like = "False"
        db.likes.update_one({"title": name_receive}, {'$set': {'like': login_like}})
        db.places.update_one({"title": name_receive}, {'$set': {'like_count': new_like}})
        return jsonify({'msg': '좋아요 취소 완료!'})
    else :
        new_like = count_like+1
        login_like = "True"
        db.likes.update_one({"title": name_receive}, {'$set': {'like': login_like}})
        db.places.update_one({"title": name_receive}, {'$set': {'like_count': new_like}})
        return jsonify({'msg': '좋아요 완료!'})



@app.route('/placereview', methods=['POST'])
def write_review():
    name_receive = request.form['name_give']
    review_receive = request.form['review_give']
    rating_receive = request.form['rating_give']
    lat_receive = request.form['lat_give']
    lng_receive = request.form['lng_give']
    with_receive = request.form['with_give']
    user_id = request.form["user_id"]


    rating_receive = int(rating_receive)
    lat_receive = float(lat_receive)
    lng_receive = float(lng_receive)


    doc = {
        'title':name_receive,
        'user_id' : user_id,
        'like':rating_receive,
        'with' : with_receive,
        'review': review_receive
    }


    do = {
        'title': name_receive,
        'like_count': 1000000000000000000,
        'lat': lat_receive,
        'lng': lng_receive,
        'percent': 100
    }

    db.likes.insert_one(doc)
    return jsonify({'msg': ' 저장완료! '})


@app.route('/placereview', methods=['GET'])
def read_reviews():
    name = request.args.get('name')
    reviews = list(db.puppy.find({'title': name}, {'_id': False}))
    return jsonify({'all_reviews': reviews})


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)