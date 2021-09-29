from flask import Flask, render_template, jsonify, request
app = Flask(__name__)

from pymongo import MongoClient
client = MongoClient('localhost', 27017)
db = client.groupproject

## HTML을 주는 부분
@app.route('/')
def home():
    return render_template('juyeon_html.html')

## API 역할을 하는 부분
@app.route('/placereview', methods=['POST'])
def write_review():
    name_receive = request.form['name_give']
    review_receive = request.form['review_give']
    rating_receive = request.form['rating_give']

    doc = {
        'name':name_receive,
        'review':review_receive,
        'rating':rating_receive

    }

    db.reviews.insert_one(doc)


    return jsonify({'msg': ' 저장완료! '})


@app.route('/placereview', methods=['GET'])
def read_reviews():
    reviews = list(db.reviews.find({}, {'_id': False}))

    return jsonify({'all_reviews': reviews})


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)