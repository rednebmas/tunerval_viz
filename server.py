import sqlite3
import time
from json import loads as json_loads
from datetime import datetime
from sanic import Sanic
from sanic.response import json
from python.interval_name_converter import interval_name_converter

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
app.static('/css', './css')
app.static('/js', './js')
app.static('/img', './img')
app.static('/lib', './lib')
app.static('/', './html')

# routes
@app.route("/")
async def test(request):
    return json({"hello": "world"})

# data for the treemap
@app.route("/treemap")
async def test(request):
	print(request.args)

	totalQuestionsAnsweredRange = [int(v) for v in request.args.getlist('totalQuestionsAnswered[]')]
	date_start = date_to_unix_epoch_milliseconds(request.args.get('dateStart'), "12:00AM")
	date_end = date_to_unix_epoch_milliseconds(request.args.get('dateEnd'), "11:59PM")

	# the basis of the response
	res = { "name" : "data", "children" : [] }

	# load and exectue the sql query
	with open('python/questions_answer_per_user_per_interval.sql') as f:
		cursor.execute(f.read(), (date_start, date_end, totalQuestionsAnsweredRange[0], totalQuestionsAnsweredRange[1]))

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
				if 'desc ' not in key and 'asc ' not in key:
					continue
				elif row[key] > 0:
					user_data['children'].append({ "name": key, "size": row[key] })
		else:
			user_data['size'] = row['total_questions_answered']

		res['children'].append(user_data)

	res['min_questions_answered'] = min_questions_answered
	res['max_questions_answered'] = max_questions_answered

	return json(res)

@app.route("/compare")
async def compare(request):
	client_ids = request.args.getlist('client_ids[]')
	intervals = request.args.getlist('intervals[]')
	filter_arr = []
	for i in range(len(client_ids)):
		filter_arr.append({
			'client_id': client_ids[i],
			'interval': intervals[i],
		})

	# fill with arrays of points
	# e.g. final ret would be [[{time: 1, order: 1, difficulty: 98.7}, ... more points], [ ... second line ... ]]
	ret = []
	for f in filter_arr:
		f['interval'] = interval_name_converter[f['interval']]
		filter_clause = "[client>client_id] = {client_id} AND [metrics>interval], [metrics>HalfStepsFromA4] = {interval}".format(**f)
		cursor.execute("""
			SELECT [metrics>Difficulty], [answer_order], [event_timestamp] FROM QuestionAnswers
			WHERE [client>client_id] = ? AND [metrics>interval] = ?
			ORDER BY [event_timestamp]
		""", (f['client_id'], f['interval']))
		rows = map(lambda r: {
			'order' : r['answer_order'],
			'difficulty' : r['metrics>Difficulty'],
			'timestamp' : r['event_timestamp'],
			'halfStepsFromA4' : r['metrics>HalfStepsFromA4'] if 'metrics>HalfStepsFromA4' in r else -1000
		}, cursor.fetchall())
		ret.append(rows)

	return json(ret)

def date_to_unix_epoch_milliseconds(date_str, time_str):
	""" @param date_str 
			expected format ex: 4/26/2016
	"""
	d = datetime.strptime(date_str + ' ' + time_str, '%m/%d/%Y %I:%M%p')
	return time.mktime(d.timetuple()) * 1000


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8888)
