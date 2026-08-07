import urllib.request
import urllib.parse
import json

url = 'http://localhost:8000/api/upload'
boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
csv_content = 'Age,Income,Score,Category,Active\n25,50000,85,A,True\n30,,90,B,False\n35,60000,,A,True\n,75000,95,C,True\n40,80000,70,,False\n45,90000,60,B,\n50,,50,A,True\n,,40,B,False\n60,120000,,C,True\n22,45000,88,A,False\n'

body = (
    '--' + boundary + '\r\n'
    'Content-Disposition: form-data; name="file"; filename="sample.csv"\r\n'
    'Content-Type: text/csv\r\n\r\n'
    + csv_content + '\r\n'
    '--' + boundary + '--\r\n'
).encode('utf-8')

req = urllib.request.Request(url, data=body)
req.add_header('Content-Type', 'multipart/form-data; boundary=' + boundary)

try:
    with urllib.request.urlopen(req) as response:
        print('SUCCESS:', response.status)
        # print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print('HTTPError:', e.code, e.read().decode('utf-8'))
except Exception as e:
    print('Exception:', e)
