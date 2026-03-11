from pathlib import Path 
import sys 
lines=Path(r'src/telegram_bot/handlers_agent.py').read_text(encoding='utf-8').splitlines() 
for i,line in enumerate(lines,1): 
    if '?????? ??????' in line: 
        sys.stdout.write((str(i)+':' + line).encode('unicode_escape').decode() + '\n') 
