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

tokens = {}

cur.execute("CREATE TABLE IF NOT EXISTS tasks (taskid, listid, uid, name, content, priority, fromdate, todate, timestamp)")
cur.execute("CREATE TABLE IF NOT EXISTS users (salt, hash, name)")
# task_structure = cur.fetchall()
# if task_structure != expected_task_structure:
#     app.logger.warning(f"tasks table is of {task_structure} instead of {expected_task_structure}")

@app.route('/')
def index():
    return redirect('http://localhost/index.html')

@app.route("/api/tasklists/<string:uname>", methods=["GET"])
def tasklists(uname):
    validate_token(request)
    # headers = dict(request.headers)
    # headers[""]
    cur.execute("SELECT * FROM lists WHERE uid=?", (uname,))
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

@app.route("/api/login", methods=["POST"])
def login():
    formData = request.form.to_dict()
    username = formData.get('username')
    password = formData.get('password')
    agent = request.headers.get('User-Agent')
    cur.execute('SELECT * FROM users WHERE name = ?', (username,))
    data = cur.fetchall()
    if len(data) > 0:
        salt = data[0][1]
        hashed = bcrypt.hashpw(password, salt)
        if hashed == data[0][2]:
            token = secrets.token_urlsafe(16)
            refresh_token = secrets.token_urlsafe(16)

            expiry = time.time()+86400

            data = {'token': token, 'expiry': expiry, 'user-agent': agent}
            returned_data = {'token': token, 'refresh': refresh_token, 'expiry': expiry}
            if tokens[username] is not None:
                tokens[username][refresh_token] = data
            else:
                tokens[username] = {}
                tokens[username][refresh_token] = data


            # tokens expire 1 day from creation. refresh token does not expire.
            return data, 200
    return "error", 404

@app.route("/api/refresh", methods=["POST"])
def refresh():
    formData = request.form.to_dict()
    username = formData.get('username')
    refresh_token = formData.get('refresh_token')
    agent = request.headers.get('User-Agent')
    if refresh_token in tokens[username]:
        if tokens[username][refresh_token]["user-agent"] == agent:
            data = tokens[username][refresh_token]
            token = secrets.token_urlsafe(16)
            expiry = time.time()+86400
            data["token"] = token
            data["expiry"] = expiry
            tokens[username][refresh_token] = data
            data.pop("user-agent")
            return data, 200
        else:
            return "invalid token - log back in", 410
    else:
        return "invalid token or username", 401


@app.route("/api/new_account", methods=["POST"])
def new_account():
    formData = request.form.to_dict()
    username = formData.get('username')
    password = formData.get('password')
    cur.execute('SELECT * FROM users WHERE name = ?', (username,))
    data = cur.fetchall()
    if len(data) == 0:
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password, salt)
        cur.execute("INSERT INTO users (salt, hash, name) VALUES (?, ?, ?)", (salt, hashed, password))
        return "log in now", 200
    else:
        return "account already exists", 409

def validate_token(request):
    formData = request.form.to_dict()
    username = formData.get('username')
    token = formData.get('token')
    agent = request.headers.get('User-Agent')
    for item in tokens[username]:
        if item["token"] == token and item["user-agent"] == agent:
            return "valid", 200
    return "invalid", 401

app.run()