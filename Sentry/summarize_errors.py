import json
from collections import Counter

try:
    with open('sentry_errors.json', 'r', encoding='utf-8') as f:
        json_content = json.load(f)
        data = json_content.get('errors', []) if isinstance(json_content, dict) and 'errors' in json_content else json_content
    print(f"Total errors: {len(data)}")
    
    titles = Counter([d.get('title') for d in data])
    print("\nTop Error Titles:")
    for title, count in titles.most_common(10):
        print(f"{count}x: {title}")
        
    projects = Counter([d.get('project', {}).get('name') for d in data])
    print("\nProjects:")
    for proj, count in projects.most_common():
        print(f"{count}x: {proj}")
        
except Exception as e:
    print(f"Error reading JSON: {e}")
