import json
import os

def main():
    with open('sentry_errors.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    print("KEYS:", data.keys())
    
    errors = data.get('errors', [])
    print(f"Total errors: {len(errors)}")
    
    projects = {}
    for e in errors:
        proj = e.get('project', 'Unknown')
        projects[proj] = projects.get(proj, 0) + 1
        
    print(f"Projects count: {projects}")
    
    # Move ai_realty tasks out of the way to focus on the telegram bot
    if not os.path.exists('sentry_tasks/ai_realty'):
        os.makedirs('sentry_tasks/ai_realty', exist_ok=True)
        
    sales_bot_tasks = []
    
    for f in os.listdir('sentry_tasks'):
        if f.endswith('.md'):
            with open(os.path.join('sentry_tasks', f), 'r', encoding='utf-8') as md:
                content = md.read()
                if '**Проект:** ai_realty' in content:
                    md.close()
                    os.rename(os.path.join('sentry_tasks', f), os.path.join('sentry_tasks', 'ai_realty', f))
                else:
                    sales_bot_tasks.append(f)
                    
    print(f"Sales Bot Tasks remaining in sentry_tasks/: {len(sales_bot_tasks)}")
    for t in sales_bot_tasks[:10]:
        print(" -", t)

if __name__ == "__main__":
    main()
