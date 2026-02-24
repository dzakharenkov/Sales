import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import paramiko

PROJECT_DIR = Path(__file__).parent.parent.resolve()
env_path = PROJECT_DIR / ".env"
load_dotenv(dotenv_path=env_path)
ssh_password = os.getenv("SSH_PASSWORD")

if not ssh_password:
    print("SSH_PASSWORD not found!")
    sys.exit(1)

HOST = "45.141.76.83"
USER = "dima"
REMOTE_LOG_PATH = "/var/www/sales.zakharenkov.ru/html/telegram_bot.log"

def fetch_logs():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=ssh_password, timeout=10)

    print("--- journalctl telegram-uz-sales-bot.service ---")
    stdin, stdout, stderr = ssh.exec_command("journalctl -u telegram-uz-sales-bot.service -n 50 --no-pager")
    print(stdout.read().decode('utf-8', errors='replace'))

    print("\n--- telegram_bot.log ---")
    stdin, stdout, stderr = ssh.exec_command(f"tail -n 100 {REMOTE_LOG_PATH}")
    print(stdout.read().decode('utf-8', errors='replace'))

    ssh.close()

if __name__ == "__main__":
    fetch_logs()
