from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient
app = Flask(__name__)


client = MongoClient('localhost', 27017)
db = client.project

@app.route('/')
def main():
    return render_template('index.html')


# API 역할을 하는 부분 (get으로 요청 받음)
@app.route('/api/list', methods=['POST']) # db 저장한거 html에 띄우기
def show_stars(): # client로부터 받을 데이터 x
    like_star = list(db.puppy.find({},{'_id':False}).sort("like", -1)) #like로 내림차순 정렬
    return jsonify({'like': like_star})


@app.route('/api/like', methods=['POST']) # 좋아요 +1 하기
def like_star(): # client에서 받은 이름(name_give)으로 찾아서 좋아요를 증가시키기
    name_receive = request.form['name_give']  # 서버쪽에서 name을 받아야 한다.

    # 이름을 받았으면 이름에 해당하는 like를 하나 찾아온다.
    target_star= db.puppy.find_one({"title": name_receive})
    current_like = target_star['like']  # 현재 like
    new_like = current_like + 1
    db.puppy.update_one({"title": name_receive}, {'$set': {'like': new_like}})
    # name이 name_receive인 것을 찾아서 like를 new_like로 바꿔라

    return jsonify({'msg': '좋아요 완료!'})


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)