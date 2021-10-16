from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient

import hashlib
import jwt
import datetime

app = Flask(__name__)

client = MongoClient('localhost', 27017)
db = client.project

SECRET_KEY = 'JAVAJABA'


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
            "lat": lat,
            "lng": lng,
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
        if review_row['enter_with'] == 'true':
            enter_with_sum += 1

    # 평점, 애완동물과 출입한 퍼센트, 총 리뷰개수를 구함
    rating_final = truncate(rating_sum / len(review_rows), 2)
    enter_with_final = truncate(enter_with_sum / len(review_rows) * 100, 2)
    review_count = len(review_rows)

    # 업데이트한 place 레코드를 다시 업데이트
    updated_place_row = db.places.find_one({'title': title, 'address': address}, {'_id': False})
    updated_place_row['rating'] = rating_final
    updated_place_row['review_count'] = review_count
    updated_place_row['enter_amount'] = enter_with_final
    db.places.update_one({'title': title, 'address': address}, {'$set': updated_place_row})
    return jsonify({'msg': '저장완료'})


@app.route('/api/review', methods=['GET'])
def place_review_select():
    title = request.args.get('title')
    address = request.args.get('address')
    # user_id = request.args.get('user_id')
    user_id = "manijang3"

    review_rows = list(db.reviews.find({'title': title, 'address': address}, {'_id': False}))
    myself_review_idx = find(review_rows, 'user_id', user_id)
    if myself_review_idx > 0:
        review_rows.insert(0, review_rows.pop(myself_review_idx))
    return jsonify({"review-list": review_rows})


@app.route('/api/review/pagination', methods=['GET'])
def place_review_select_pagination():
    page = int(request.args.get('page'))
    title = request.args.get('title')
    address = request.args.get('address')
    user_id = request.args.get('user_id')

    # 한 페이지에 보여줄 리뷰 수
    limit = 3
    # 시작점
    offset = (page - 1) * limit
    review_rows = list(db.reviews.find({'title': title, 'address': address}, {'_id': False}).limit(limit).skip(offset))
    myself_review_idx = find(review_rows, 'user_id', user_id)
    if myself_review_idx > 0:
        review_rows.insert(0, review_rows.pop(myself_review_idx))

    doc = {"review-list": review_rows,
           "count": int(db.reviews.find({'title': title, 'address': address}, {'_id': False}).count())}

    return jsonify(doc)


@app.route('/api/review', methods=['DELETE'])
def place_review_delete():
    user_id = request.form['user_id']
    title = request.form['title']
    address = request.form['address']
    db.reviews.delete_one({'title': title, 'address': address, 'user_id': user_id})

    return jsonify({'msg': '삭제완료'})


@app.route('/fileUpload', methods = ['GET','POST'])
def place_photo_upload():
    title = request.form['title']
    address = request.form['address']
    user_id = "manijang3"

    # 해당 장소에 대한 파일들을 검사하고 없으면 생성한다.
    placePhoto_row = db.place_photos.find_one({'title': title, 'address': address, 'user_id': user_id}, {'_id': False})
    if placePhoto_row is None:
        placePhoto_doc = {
            "title": title,
            "address": address,
            "user_id": user_id,
            'filenames': []
        }
        db.place_photos.insert_one(placePhoto_doc)

    # 해당 장소의 파일들을 가져온다.
    placePhoto_row = db.place_photos.find_one({'title': title, 'address': address, 'user_id': user_id}, {'_id': False})

    files = request.files
    filenames = files.to_dict(flat=False)['filename[]']
    # 예전 파일과 새로 업로드 되는 파일의 개수를 비교하여 3개가 넘는지 확인한다
    old_file_count = len(placePhoto_row['filenames'])
    new_file_count = len(filenames)
    msg = ''
    if old_file_count + new_file_count <= 10:
        for f in filenames:
            filename = f.filename
            placePhoto_row['filenames'].append(filename)
            f.save('static/' + filename)
        msg = '추가 완료'
    else:
        msg = '해당 파일이 3개보다 많습니다'

    db.place_photos.update_one({'title': title, 'address': address, 'user_id': user_id}, {'$set': placePhoto_row})
    return jsonify({'msg': msg})


@app.route('/api/place/photo/my')
def place_photo_my_select():
    title = request.args.get('title')
    address = request.args.get('address')
    user_id = "manijang2"

    placePhoto_row = db.place_photos.find_one({'title': title, 'address': address, 'user_id': user_id}, {'_id': False})
    if placePhoto_row is None:
        placePhoto_row = {
            "title": title,
            "address": address,
            "user_id": user_id,
            'filenames': []
        }
    return jsonify({'photos': placePhoto_row})


@app.route('/api/place/photo/all')
def place_photo_all_select():
    title = request.args.get('title')
    address = request.args.get('address')
    user_id = "manijang2"

    placePhoto_rows = list(db.place_photos.find({'$and': [{'title': title, 'address': address},{'user_id': {'$ne': user_id}}]}, {'_id': False}))
    if placePhoto_rows is None:
        placePhoto_rows = [{
            "title": title,
            "address": address,
            'filenames': []
        }]

    filenames = []
    for placePhoto_row in placePhoto_rows:
        for filename in placePhoto_row['filenames']:
            filenames.append(filename)
    return jsonify({'photos': filenames})


def find(mylist, key, value):
    for i, dic in enumerate(mylist):
        if dic[key] == value:
            return i
    return -1


@app.route('/login')
def login():
    msg = request.args.get("msg")
    return render_template('login.html', msg=msg)


@app.route('/register')
def register():
    return render_template('register.html')


@app.route('/api/register', methods=['POST'])
def api_register():
    id_receive = request.form['id_give']
    pw_receive = request.form['pw_give']

    pw_hash = hashlib.sha256(pw_receive.encode('utf-8')).hexdigest()

    doc = {
        'id': id_receive,
        'pw': pw_hash,
    }

    db.accounts.insert_one(doc)

    return jsonify({'result': 'success'})


@app.route('/register/check_dup', methods=['POST'])
def check_dup():
    id_receive = request.form['id_give']
    exists = bool(db.accounts.find_one({"id": id_receive}))
    return jsonify({'result': 'success', 'exists': exists})


@app.route('/api/login', methods=['POST'])
def api_login():
    id_receive = request.form['id_give']
    pw_receive = request.form['pw_give']

    pw_hash = hashlib.sha256(pw_receive.encode('utf-8')).hexdigest()

    result = db.accounts.find_one({'id': id_receive, 'pw': pw_hash})

    if result is not None:
        payload = {
            'id': id_receive,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=600)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256').decode('utf-8')
        return jsonify({'result': 'success', 'token': token})
    else:
        return jsonify({'result': 'fail', 'msg': '아이디/비밀번호가 일치하지 않습니다.'})


def truncate(num, n):
    integer = int(num * (10 ** n)) / (10 ** n)
    return float(integer)


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)



