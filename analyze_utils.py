import json
import aws_mobile_analytics_data_parser as aws_madp
import datetime
from datetime import date
import pprint
pp = pprint.PrettyPrinter(indent=4)

def pretty(var):
    pp.pprint(var)

def jpretty(d):
    return json.dumps(d, sort_keys=True, indent=4, separators=(',', ': '))

def load_data_from_cache():
    with open('data.json') as data_file:    
        data = json.load(data_file)
    return data

def bucket_events(data):
    events = {}
    for d in data:
        if d['event_type'] not in events:
            events[d['event_type']] = []
        events[d['event_type']].append(d)
    return events

# note, not currently used but can be used for axis labels by changing 
# parameter event timestamp to date_obj
def formatted_date_str_for_event_time_stamp(event_timestamp):
    datetime_obj = datetime.datetime.fromtimestamp(event_timestamp / 1000)

    year = '{:02d}'.format(datetime_obj.year)
    month = '{:02d}'.format(datetime_obj.month)
    day = '{:02d}'.format(datetime_obj.day)

    date_str = year + "." + month + "." + day
    return date_str

# modifies in place
def add_blank_days_to_bucketed_by_day(bucketed_by_day):
    sorted_keys = sorted(bucketed_by_day.keys())
    start = sorted_keys[0]
    end = sorted_keys[-1]
    date_list = [end - datetime.timedelta(days=x) for x in range(0, (end-start).days)]
    for date in date_list:
        if date not in bucketed_by_day:
            bucketed_by_day[date] = []

def bucket_by_day(data):
    dates = {}
    for d in data:
        day = datetime.date.fromtimestamp(d['event_timestamp'] / 1000)
        if day in dates:
            dates[day].append(d)
        else:
            dates[day] = [d]
    add_blank_days_to_bucketed_by_day(dates)
    return dates

def sorted_by_day(bucketed_by_day):
 	sorted_days = sorted(bucketed_by_day.keys())
 	sorted_events = []
 	for day in sorted_days:
 		sorted_events.append(bucketed_by_day[day])
 	return sorted_days, sorted_events

# returns a bucketed dictionary by the path list, e.g.
# you would bucket by unique users with the following call
#   bucket_by_path(['client', 'client_id'], data)
def bucket_by_path(path_list, data):
    bucketed = {}
    for element in data:
        sub_element = element
        for path in path_list:
            sub_element = sub_element[path]

        if sub_element in bucketed:
            bucketed[sub_element].append(element)
        else:
            bucketed[sub_element] = [element]
    return bucketed

def date_for_event(event):
	return datetime.date.fromtimestamp(event['event_timestamp'] / 1000)
