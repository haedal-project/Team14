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
    like_star = list(db.puppy.find({}, {'_id': False}).sort("like", -1))
    return jsonify({'like': like_star})


@app.route('/api/like_button', methods=['POST'])
def like_star():
    name_receive = request.form['name_give']
    target_star = db.puppy.find_one({"title": name_receive})
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
        'title': name_receive,
        'review': review_receive,
        'like': rating_receive,
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


@app.route('/api/place', methods=['GET'])
def place_detail_info():
    title = request.args.get('title')

    # 장소 정보 가져옴
    place_row = db.places.find_one({'title': title}, {'_id': False})
    if place_row is None:
        # 장소 정보가 없다면 아무도 리뷰를 안 쓴 경우임. 응답 데이터를 0으로 세팅
        doc = {
            "title": title,
            "rating": 0,
            "review_count": 0,
            "enter_amount": 0
        }
    else:
        doc = {
            "title": place_row['title'],
            "rating": place_row['rating'],
            "review_count": place_row['review_count'],
            "enter_amount": place_row['enter_amount'],
        }
    return jsonify({"place-info": doc})


@app.route('/api/review', methods=['POST'])
def place_review_register():
    user_id = request.form['user_id']
    enter_with_check = request.form['enter_with_check']
    rating = request.form['rating']
    review_content = request.form['review']
    lat = request.form['lat']
    lng = request.form['lng']
    title = request.form['title']
    address = request.form['address']

    # 아무도 리뷰를 안쓴 경우 => 장소를 미리 생성
    place_row = db.places.find_one({'title': title, 'address': address}, {'_id': False})
    if place_row is None:
        place_doc = {
            "title": title,
            "address": address,
            "rating": 0,
            "review_count": 0,
            "enter_amount": 0
        }
        db.places.insert_one(place_doc)

    review_doc = {
        "title": title,
        "address": address,
        "user_id": user_id,
        "rating": rating,
        "review": review_content,
        "enter_with": enter_with_check
    }
    db.reviews.insert_one(review_doc)

    # review 데이터를 모두 가져와서 place 정보를 업데이트함
    review_rows = list(db.reviews.find({'title': title, 'address': address}, {'_id': False}))
    rating_sum = 0
    enter_with_sum = 0
    for review_row in review_rows:
        rating_sum += int(review_row['rating'])
        if review_row['enter_with'] == 'True':
            enter_with_sum += 1

    # 평점, 애완동물과 출입한 퍼센트, 총 리뷰개수를 구함
    rating_final = truncate(rating_sum / len(review_rows), 2)
    enter_with_final = int(enter_with_sum / len(review_rows) * 100)
    review_count = len(review_rows)

    # 업데이트한 place 레코드를 다시 업데이트
    updated_place_row = db.places.find_one({'title': title, 'address': address}, {'_id': False})
    updated_place_row['rating'] = rating_final
    updated_place_row['review_count'] = review_count
    updated_place_row['enter_amount'] = enter_with_final
    db.places.update_one({'title': title, 'address': address}, {'$set': updated_place_row})
    return jsonify({'msg': '저장완료'})


def truncate(num, n):
    integer = int(num * (10**n))/(10**n)
    return float(integer)

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)
