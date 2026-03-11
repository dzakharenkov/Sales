from pathlib import Path 
import re,sys 
lines=Path(r'src/telegram_bot/handlers_agent.py').read_text(encoding='utf-8').splitlines() 
for i,line in enumerate(lines,1): 
    if re.search(r'[?-??-???]', line): 
        sys.stdout.write((str(i)+':' + line).encode('unicode_escape').decode() + '\n') 
