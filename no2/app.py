from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient
app = Flask(__name__)


client = MongoClient('localhost', 27017)
db = client.project

@app.route('/')
def main():
    return render_template('index.html')


# API 역할을 하는 부분 (get으로 요청 받음)
@app.route('/api/list', methods=['POST'])
def show_stars():
    like_star = list(db.puppy.find({},{'_id':False}).sort("like", -1))
    return jsonify({'like': like_star})


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)