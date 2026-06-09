import re

with open('index.html', 'r') as f:
    html = f.read()

# Make sure we don't mess up any other part of the file

with open('index.html', 'w') as f:
    f.write(html)
