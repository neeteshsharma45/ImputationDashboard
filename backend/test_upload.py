import urllib.request
import urllib.parse

url = 'http://localhost:8000/api/upload'
boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
body = (
    '--' + boundary + '\r\n'
    'Content-Disposition: form-data; name="file"; filename="test.csv"\r\n'
    'Content-Type: text/csv\r\n\r\n'
    'Age,Name\n25,A\n30,B\n,C\n\r\n'
    '--' + boundary + '--\r\n'
).encode('utf-8')

req = urllib.request.Request(url, data=body)
req.add_header('Content-Type', 'multipart/form-data; boundary=' + boundary)

try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print('HTTPError:', e.code, e.read().decode('utf-8'))
except Exception as e:
    print('Exception:', e)
