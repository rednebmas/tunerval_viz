import sqlite3
import time
from datetime import datetime
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
	print(request.args)
	print(request.args.get('dateStart'))
	date_start = date_to_unix_epoch_milliseconds(request.args.get('dateStart'))
	date_end = date_to_unix_epoch_milliseconds(request.args.get('dateEnd'))

	# the basis of the response
	res = { "name" : "data", "children" : [] }

	# load the sql query
	with open('questions_answer_per_user_per_interval.sql') as f:
		cursor.execute(f.read(), (date_start, date_end))

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

def date_to_unix_epoch_milliseconds(date_str):
	""" @param date_str 
			expected format ex: 4/26/2016
	"""
	d = datetime.strptime(date_str + ' 11:59PM', '%m/%d/%Y %I:%M%p')
	return time.mktime(d.timetuple()) * 1000


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8888)
