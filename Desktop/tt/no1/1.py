from pymongo import MongoClient
from flask import Flask, render_template, jsonify, request
import requests
from bs4 import BeautifulSoup
app = Flask(__name__)

client = MongoClient('localhost', 27017)
db = client.project

# HTML 화면 보여주기
@app.route('/')
def home():
    return render_template('1.html')

@app.route('/api/show', methods=['GET'])
def save():
    name_receive = request.form['name_give']
    number_receive = 0
    doc = {
        "title" : name_receive,
        "like" : number_receive
    }
    db.puppy.insert_one(doc)
    return jsonify({'msg': '저장 완료!'})

@app.route('/api/like', methods=['POST'])
def like_star():
    name_receive = request.form['name_give']
    target_star = db.puppy.find_one({"title": name_receive})
    current_like = target_star['like']
    new_like = current_like + 1
    db.puppy.update_one({"name": name_receive}, {'$set': {'like': new_like}})
    return jsonify({'msg': '좋아요 완료!'})

# API 역할을 하는 부분 (get으로 요청 받음)
@app.route('/api/list', methods=['POST'])
def show_stars():
    like_star = list(db.puppy.find({},{'_id':False}).sort("like", -1))
    return jsonify({'like': like_star})


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)