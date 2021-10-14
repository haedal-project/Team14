from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient
from datetime import datetime

app = Flask(__name__)
client = MongoClient('localhost', 27017)
db = client.project

@app.route('/')
def main():
    return render_template('test.html')

@app.route('/files', methods=['POST'])
def save_files():
    files = request.files.getlist("file")
    db.photo.insert_one(files)
    return jsonify({"result": True})

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)

