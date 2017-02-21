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
	date_start = date_to_unix_epoch_milliseconds(request.args.get('dateStart'), "12:00AM")
	date_end = date_to_unix_epoch_milliseconds(request.args.get('dateEnd'), "11:59PM")

	# the basis of the response
	res = { "name" : "data", "children" : [] }

	# load the sql query
	with open('questions_answer_per_user_per_interval.sql') as f:
		cursor.execute(f.read(), (date_start, date_end))

	# get all results from the query
	rows = cursor.fetchall()

	# format the results required by d3 treemap
	min_questions_answered = 999999999
	max_questions_answered = 0
	for row in rows:
		max_questions_answered = max(max_questions_answered, row['total_questions_answered'])
		min_questions_answered = min(min_questions_answered, row['total_questions_answered'])

		user_data = { 
			'name' : row['client>client_id'],
			'children': [],
			'device>platform>name': row['device>platform>name']
		}
		
		if request.args.get('breakdownByInterval') == 'true':
			for key in row.keys():
				if key == 'client>client_id' or key == 'total_questions_answered' or key == 'device>platform>name':
					continue
				elif row[key] > 0:
					user_data['children'].append({ "name": key, "size": row[key] })
		else:
			user_data['size'] = row['total_questions_answered']

		res['children'].append(user_data)

	res['min_questions_answered'] = min_questions_answered
	res['max_questions_answered'] = max_questions_answered

	return json(res)

def date_to_unix_epoch_milliseconds(date_str, time_str):
	""" @param date_str 
			expected format ex: 4/26/2016
	"""
	d = datetime.strptime(date_str + ' ' + time_str, '%m/%d/%Y %I:%M%p')
	return time.mktime(d.timetuple()) * 1000


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8888)
