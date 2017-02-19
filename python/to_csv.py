import json
import datetime
from datetime import date
from analyze_utils import *
from data_formatter import format_event, add_question_order_column

# https://github.com/pandas-dev/pandas/blob/master/doc/cheatsheet/Pandas_Cheat_Sheet.pdf
# http://stackoverflow.com/questions/19482970/get-list-from-pandas-dataframe-column-headers

data = load_data_from_cache()
add_question_order_column(data)
print data[0]
for d in data: format_event(d)
events = bucket_events(data)

def flatten_with_sep(data, sep=">"):
	return _flatten_with_sep(data, sep, {})

def _flatten_with_sep(data, sep, output, prefix_key=""):
	for key in data.keys():
		val = data[key]
		if isinstance(val, dict):
			_flatten_with_sep(val, sep, output, prefix_key + key + sep)
		else:
			output[prefix_key + key] = val
	return output


# flatten events
for event_type in events.keys():
	for i in range(len(events[event_type])):
		event = events[event_type][i]
		events[event_type][i] = flatten_with_sep(event)

# ouput
for event_type in events.keys():
	# gather all keys, we have to do this because we added keys at a later date
	key_set = set()
	for event in events[event_type]:
		for key in event.keys():
			key_set.add(key)

	keys = sorted(list(key_set))
	with open('csv/' + event_type + '_data.csv', 'w') as f:
		f.write(','.join(keys) + '\n')
		for event in events[event_type]:
			comma_separated_values = ','.join([str(event[key]) if key in event else "NULL" for key in keys])
			f.write(comma_separated_values + '\n')



print(events.keys())
print(events['_session.start'][0])
print()
print(events['_session.stop'][0])
