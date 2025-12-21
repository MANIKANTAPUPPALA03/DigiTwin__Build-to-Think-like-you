import json
from mail_extractor import fetch_latest_mails

with open('token.json', 'r') as f:
    TOKEN_JSON = json.load(f)

events = fetch_latest_mails(TOKEN_JSON, max_results=5)

print("\nExtracted Events:\n")
for e in events:
    print(e)
