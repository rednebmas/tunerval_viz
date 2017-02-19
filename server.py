import sqlite3
from sanic import Sanic
from sanic.response import json

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

@app.route("/treemap")
async def test(request):

	res = { "name" : "data", "children" : [] }
	with open('questions_answer_per_user_per_interval.sql') as f:
		cursor.execute(f.read())

	rows = cursor.fetchall()
	for row in rows:
		user_data = { 
			'name' : row['client>client_id'],
			'size' : row['total_questions_answered'],
			'children': []
		}
		# for key in row.keys():
		# 	if key == 'client>client_id' or key == 'total_questions_answered':
		# 		continue
		# 	elif row[key] > 0:
		# 		user_data['children'].append({ "name": key, "size": row[key] })

		res['children'].append(user_data)


	return json(res)


# SELECT COUNT(*) as qCount FROM QuestionAnswers GROUP BY [client>client_id] ORDER by qCount;
# PRAGMA table_info(QuestionAnswers);

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8888)
