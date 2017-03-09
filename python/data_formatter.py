def add_question_order_column(data):
    user_questions = {}
    for row in data:
        if row['event_type'] != 'QuestionAnswered':
            continue
        client_id = row['client']['client_id']
        their_questions = user_questions.get(client_id, [])
        their_questions.append(row)
        user_questions[client_id] = their_questions

    event_unique_id_to_number = {}
    for client_id in user_questions.keys():
        their_questions = user_questions[client_id]
        their_questions.sort(key=lambda event: (event['metrics']['Interval'], event['event_timestamp']))

        interval_counter = {}
        for i in range(len(their_questions)): 
            event = their_questions[i]
            uid = str(event['event_timestamp']) + str(event['arrival_timestamp']) + str(event['client']['client_id']) + str(event['metrics']['Difficulty']) + str(event['metrics']['Interval'])
            count = interval_counter.get(event['metrics']['Interval'], 0)
            count += 1
            interval_counter[event['metrics']['Interval']] = count
            event_unique_id_to_number[uid] = count
    
    for i in range(len(data)):
        row = data[i]
        if row['event_type'] != 'QuestionAnswered':
            continue
        uid = str(row['event_timestamp']) + str(row['arrival_timestamp']) + str(row['client']['client_id']) + str(row['metrics']['Difficulty']) + str(row['metrics']['Interval'])
        row['answer_order'] = event_unique_id_to_number[uid]

def format_event(event):
    # replace iPhone OS with iOS as device platform name
    if 'device' in event:
        if 'platform' in event['device']:
            if 'name' in event['device']['platform']:
                if event['device']['platform']['name'] == 'iPhone OS':
                    event['device']['platform']['name'] = 'iOS'





