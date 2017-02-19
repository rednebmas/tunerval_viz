import sqlite3
from sanic import Sanic
from sanic.response import json

# setup live reload server
from aoiklivereload import LiveReloader
reloader = LiveReloader()
reloader.start_watcher_thread()

# setup db connection
conn = sqlite3.connect('python/data.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# create app
app = Sanic()
app.static('/', './')

# routes
@app.route("/")
async def test(request):
    return json({"hello": "world"})

# data for the treemap
@app.route("/treemap")
async def test(request):
	# the basis of the response
	res = { "name" : "data", "children" : [] }

	# load the sql query
	with open('questions_answer_per_user_per_interval.sql') as f:
		cursor.execute(f.read())

	# get all results from the query
	rows = cursor.fetchall()

	# format the results required by d3 treemap
	for row in rows:
		user_data = { 
			'name' : row['client>client_id'],
			# 'size' : row['total_questions_answered'],
			'children': []
		}
		for key in row.keys():
			if key == 'client>client_id' or key == 'total_questions_answered':
				continue
			elif row[key] > 0:
				user_data['children'].append({ "name": key, "size": row[key] })

		res['children'].append(user_data)

	return json(res)

# PRAGMA table_info(QuestionAnswers);

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8888)
