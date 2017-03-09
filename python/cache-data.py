import aws_mobile_analytics_data_parser as aws_madp
import threading
import sys
import json
import os
import subprocess

# where aws mobile analytics files are stored
directory = "/Users/sam/s3/mobile-analytics-05-18-2016-b999adf56f104192a4ed120107b55dc9"

# sync analytics before parsing
print('hey')
subprocess.call("aws s3 sync s3://mobile-analytics-05-18-2016-b999adf56f104192a4ed120107b55dc9 " + directory, shell=True)  
print('hey2')

print 's3 synced'

data = aws_madp.parse_data_in_directory(directory)
with open('data.json', 'w') as outfile:
    json.dump(data, outfile)
    print 'Parsed & cached\nCache size: ' + str(os.path.getsize('data.json') / (10.0**6.0)) + " megabytes"
