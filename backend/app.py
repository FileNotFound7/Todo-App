from flask import Flask, request
from flask_cors import CORS
import sqlite3, logging
from sys import stderr

expected_task_structure = ["taskid", "listid", "uid", "name", "content", "priority", "fromdate", "todate", "timestamp"]

app = Flask(__name__)

CORS(app)

app.config["SERVER_NAME"] = "127.0.0.1:2999"
app.config["DEBUG"] = True

app.logger.addHandler(logging.FileHandler("app.log"))
app.logger.addHandler(logging.StreamHandler(stderr))

db_conn = sqlite3.connect("main.sqlite3", check_same_thread=False)
cur = db_conn.cursor()

cur.execute("CREATE TABLE IF NOT EXISTS tasks (taskid, listid, uid, name, content, priority, fromdate, todate, timestamp)")
# task_structure = cur.fetchall()
# if task_structure != expected_task_structure:
#     app.logger.warning(f"tasks table is of {task_structure} instead of {expected_task_structure}")

@app.route("/tasklists/<string:uid>", methods=["GET"])
def tasklists(uid):
    # headers = dict(request.headers)
    # headers[""]
    cur.execute("SELECT * FROM lists WHERE uid=?", (uid,))
    return cur.fetchall()

@app.route("/task/<int:taskid>", methods=["GET", "POST"])
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
    
@app.route("/newtask", methods=["POST"])
def newtask():
    formData = request.form.to_dict()
    cur.execute("INSERT INTO tasks (name, content, priority, fromdate, todate) VALUES (?, ?, ?, ?, ?)", (formData['name'], formData['description'], formData['priority'], formData['from'], formData['to']))
    db_conn.commit()
    return "OK", 200

app.run()