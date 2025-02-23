import sqlite3
import os

os.chdir("backend")

db_conn = sqlite3.connect("main.sqlite3")
cur = db_conn.cursor()

cur.execute("CREATE TABLE tasks(taskid INTEGER PRIMARY KEY, listid INT2, uid INT2, name TEXT, content TEXT, priority INT1, fromdate INT4, todate INT4, timestamp INT4 DEFAULT (cast(strftime('%s','now') as int)))")
cur.execute("CREATE TABLE users(uid INTEGER PRIMARY KEY, username TEXT, password TEXT, keys TEXT, timestamp INT4 DEFAULT (cast(strftime('%s','now') as int)))")
cur.execute("CREATE TABLE lists(uid INT2, editors TEXT, viewers TEXT, listid INTEGER PRIMARY KEY, timestamp INT4 DEFAULT (cast(strftime('%s','now') as int)))")
cur.close()