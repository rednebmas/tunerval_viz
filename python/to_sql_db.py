import pandas
import sqlite3

df = pandas.read_csv("csv/QuestionAnswered_data.csv")
conn = sqlite3.connect('data.db')

c = conn.cursor()

pandas_dtype_to_sql = { 'int64' : 'int', 'object' : 'VARCHAR(512)', 'float64': 'float' }

# get a list of column names in SQL format
cols = ','.join(list(
	map(lambda c: "[" + c + "] " + pandas_dtype_to_sql[str(df[c].dtype)], df.columns)  
))


# create a table with the
stmt = "CREATE TABLE QuestionAnswers ( " + cols + ")"
print(stmt)
c.execute(stmt)

# put csv data into database
df.to_sql('QuestionAnswers', conn, if_exists='append', index=False)