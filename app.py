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

cur.execute("CREATE TABLE IF NOT EXISTS tasks (taskid, listid, username, name, content, priority, fromdate, todate, timestamp)")
cur.execute("CREATE TABLE IF NOT EXISTS users (salt, hash, name)")
# task_structure = cur.fetchall()
# if task_structure != expected_task_structure:
#     app.logger.warning(f"tasks table is of {task_structure} instead of {expected_task_structure}")

@app.route('/')
def index():
    return redirect('/index.html')

@app.route("/api/tasks", methods=["GET"])
def tasklists():
    validate_token(request)
    formData = request.form.to_dict()
    username = formData.get('username')
    # headers = dict(request.headers)
    # headers[""]
    cur.execute("SELECT * FROM tasks WHERE username=?", (username,))
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
        db_conn.commit()
        return

@app.route("/api/newtask", methods=["POST"])
def newtask():
    if not validate_token(request):
        return 'Not logged in', 500
    
    formData = request.form.to_dict()
    if 'priority' not in formData.keys(): formData['priority'] = None
    formData = { key: None if val == '' else val for key, val in formData.items() }
    cur.execute("INSERT INTO tasks (username, name, content, priority, fromdate, todate) VALUES (?, ?, ?, ?, ?)", (formData['username'], formData['name'], formData['description'], formData['priority'], formData['from'], formData['to']))
    db_conn.commit()
    return "OK", 200

@app.route("/api/login", methods=["POST"])
def login():
    formData = request.form.to_dict()
    username = formData.get('username')
    password = formData.get('password')
    cur.execute('SELECT * FROM users WHERE name = ?', (username,))
    data = cur.fetchall()
    if len(data) > 0:
        salt = data[0][1]
        hashed = bcrypt.hashpw(bytes(password, 'utf-8'), salt)
        if hashed == data[0][2]:
            token = secrets.token_urlsafe(16)
            refresh_token = secrets.token_urlsafe(16)

            expiry = time.time()+86400

            data = {'token': token, 'expiry': expiry, 'refresh': refresh_token, 'username': username}
            if tokens.get(username) is not None:
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
    refresh_token = formData.get('refresh')
    if refresh_token in tokens[username]:
        data = tokens[username][refresh_token]
        token = secrets.token_urlsafe(16)
        expiry = time.time()+86400
        data["token"] = token
        data["expiry"] = expiry
        tokens[username][refresh_token] = data
        return data, 200
    else:
        return "invalid token or username", 401

@app.route("/api/new_account", methods=["POST"])
def new_account():
    formData = request.form.to_dict()
    username = formData.get('username')
    password = formData.get('password')
    cur.execute('SELECT * FROM users WHERE name = ?', (username,))
    data = cur.fetchall()
    print(data)

    # create account if it doesn't exist, then log in
    if len(data) == 0:
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(bytes(password, 'utf-8'), salt)
        cur.execute("INSERT INTO users (salt, hash, name) VALUES (?, ?, ?)", (salt, hashed, username))
        db_conn.commit()
    return login()

def validate_token(request):
    formData = request.form.to_dict()
    username = formData.get('username')
    token = formData.get('token')
    for item in tokens[username]:
        if item["token"] == token and item['username'] == username:
            return True
    return False
app.run()