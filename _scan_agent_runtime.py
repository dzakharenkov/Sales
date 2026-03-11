from pathlib import Path 
import re,sys 
lines=Path(r'src/telegram_bot/handlers_agent.py').read_text(encoding='utf-8').splitlines() 
for i,line in enumerate(lines,1): 
    if ('reply_text(' in line or 'edit_message_text(' in line or 'InlineKeyboardButton(' in line or 'await _reply_loc' in line or 'await _edit_loc' in line or 'fallback=' in line) and re.search(r'[?-??-???]', line): 
        sys.stdout.write((str(i)+':' + line).encode('unicode_escape').decode() + '\n') 
