from pathlib import Path 
import sys 
lines=Path(r'src/telegram_bot/handlers_agent.py').read_text(encoding='utf-8').splitlines() 
for a,b in [(1400,1450,)]: 
    for i in range(a-1,min(b,len(lines))): 
        sys.stdout.write((str(i+1)+':' + lines[i]).encode('unicode_escape').decode() + '\n') 
