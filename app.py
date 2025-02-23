from flask import Flask, request, redirect
# from flask_cors import CORS
import sqlite3, logging
from sys import stderr

import time

import bcrypt, secrets # security things

expected_task_structure = ["taskid", "listid", "uid", "name", "content", "priority", "fromdate", "todate", "timestamp"]

app = Flask(__name__, static_url_path='', static_folder='static')
# CORS(app)

app.config["SERVER_NAME"] = "localhost:80"
app.config["DEBUG"] = True

app.logger.addHandler(logging.FileHandler("app.log"))
app.logger.addHandler(logging.StreamHandler(stderr))

db_conn = sqlite3.connect("main.sqlite3", check_same_thread=False)
cur = db_conn.cursor()


cur.execute("CREATE TABLE IF NOT EXISTS tasks (taskid, listid, uid, name, content, priority, fromdate, todate, timestamp)")
cur.execute("CREATE TABLE IF NOT EXISTS users (uid, salt, hash, name)")
# task_structure = cur.fetchall()
# if task_structure != expected_task_structure:
#     app.logger.warning(f"tasks table is of {task_structure} instead of {expected_task_structure}")

@app.route('/')
def index():
    return redirect('http://localhost/index.html')

@app.route("/api/tasklists/<string:uid>", methods=["GET"])
def tasklists(uid):
    # headers = dict(request.headers)
    # headers[""]
    cur.execute("SELECT * FROM lists WHERE uid=?", (uid,))
    return cur.fetchall()

@app.route("/api/task/<int:taskid>", methods=["GET", "POST"])
def task(taskid):
    pass
    if request.method == "GET":
        cur.execute("SELECT * FROM tasks WHERE taskid=?", (taskid,))
        return cur.fetchall()
    else:
        pass
        headers = dict(request.headers)
        cur.execute("UPDATE tasks SET ? VALUES ?", (headers["name"], headers["content"], headers["priority"], headers["fromdate"], headers["todate"]))
        return
    
@app.route("/api/newtask", methods=["POST"])
def newtask():
    formData = request.form.to_dict()
    if 'priority' not in formData.keys(): formData['priority'] = None
    formData = { key: None if val == '' else val for key, val in formData.items() }
    cur.execute("INSERT INTO tasks (name, content, priority, fromdate, todate) VALUES (?, ?, ?, ?, ?)", (formData['name'], formData['description'], formData['priority'], formData['from'], formData['to']))
    db_conn.commit()
    return "OK", 200

@app.route("/api/login")
def login():
    formData = request.form.to_dict()
    username = formData.get('username')
    password = formData.get('password')
    cur.execute('SELECT * FROM users WHERE name = ?', (username,))
    data = cur.fetchall()
    if len(data) > 1:
        salt = data[0][1]
        hashed = bcrypt.hashpw(password, salt)
        if hashed == data[0][2]:
            token = secrets.token_urlsafe(16)
            refresh_token = secrets.token_urlsafe(16)
            expiry = time.time()+86400
            data = {'token': token, 'refresh': refresh_token, 'expiry': expiry}
            # tokens expire 1 day from creation. refresh token does not expire.
            return data, 200
    else:
        return "ACCOUNT NOT FOUND", 500

@app.route("/api/new_account")
def new_account():
    formData = request.form.to_dict()
    username = formData.get('username')
    password = formData.get('password')
    cur.execute('SELECT * FROM users WHERE name = ?', (username,))
    data = cur.fetchall()
    if len(data) == 0:
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password, salt)
    else:
        return "ACCOUNT NOT FOUND", 500

app.run()