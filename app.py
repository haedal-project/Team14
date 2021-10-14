from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient
app = Flask(__name__)

client = MongoClient('localhost', 27017)
db = client.project


@app.route('/')
def main():
    return render_template('index.html')


@app.route('/api/recommend', methods=['GET'])
def show_stars():
    like_star = list(db.puppy.find({},{'_id':False}).sort("like", -1))
    return jsonify({'like': like_star})


@app.route('/api/like_button', methods=['POST'])
def like_star():
    name_receive = request.form['name_give']
    target_star= db.puppy.find_one({"title": name_receive})
    current_like = target_star['like']
    new_like = current_like + 1
    db.puppy.update_one({"title": name_receive}, {'$set': {'like': new_like}})
    return jsonify({'msg': '좋아요 완료!'})


@app.route('/placereview', methods=['POST'])
def write_review():
    name_receive = request.form['name_give']
    review_receive = request.form['review_give']
    rating_receive = request.form['rating_give']
    lat_receive = request.form['lat_give']
    lng_receive = request.form['lng_give']

    rating_receive = int(rating_receive)
    lat_receive = float(lat_receive)
    lng_receive = float(lng_receive)

    doc = {
        'title':name_receive,
        'review':review_receive,
        'like':rating_receive,
        'x': lat_receive,
        'y': lng_receive
    }
    db.puppy.insert_one(doc)
    return jsonify({'msg': ' 저장완료! '})


@app.route('/placereview', methods=['GET'])
def read_reviews():
    name = request.args.get('name')
    reviews = list(db.puppy.find({'title': name}, {'_id': False}))
    return jsonify({'all_reviews': reviews})


# /api/place?id=${_id}&user_id=${user_id}`,
@app.route('/api/place', methods=['GET'])
def place_detail_info():
    # id = request.args.get('id')
    # user_id = request.args.get('user_id')
    doc = {
        "id": "12132121",
        "rating": 4.12,
        "review_count": 40,
        "enter_amount": 40.1,
        "like": True
    }
    return jsonify({"place-info": doc})


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)

