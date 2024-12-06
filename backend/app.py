from flask import Flask, request
import sqlite3, logging
from sys import stderr

expected_task_structure = ["taskid", "listid", "uid", "name", "content", "priority", "fromdate", "todate", "timestmamp"]

app = Flask(__name__)

app.logger.addHandler(logging.FileHandler("app.log"))
app.logger.addHandler(logging.StreamHandler(stderr))

db_conn = sqlite3.connect("main.sqlite3", check_same_thread=False)
cur = db_conn.cursor()

cur.execute("PRAGMA tableinfo(tasks)")
task_structure = cur.fetchall()
if task_structure != expected_task_structure:
    app.logger.warning(f"tasks table is of {task_structure} instead of {expected_task_structure}")

@app.route("/tasklists/<string:uid>", methods=["GET"])
def test(uid):
    # headers = dict(request.headers)
    # headers[""]
    cur.execute("SELECT * FROM lists WHERE uid=?", (uid,))
    return cur.fetchall()

