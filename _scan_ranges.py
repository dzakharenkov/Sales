from pathlib import Path 
import sys 
lines=Path(r'src/telegram_bot/handlers_agent.py').read_text(encoding='utf-8').splitlines() 
ranges=[(95,155),(230,280),(320,350),(430,455),(480,510),(568,610),(618,705),(730,810),(850,1010),(1118,1450),(1548,1775)] 
for a,b in ranges: 
    sys.stdout.write(f'--- {a}-{b} ---\n') 
    for i in range(a-1,min(b,len(lines))): 
        sys.stdout.write((str(i+1)+':' + lines[i]).encode('unicode_escape').decode() + '\n') 
