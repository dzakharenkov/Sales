import os
import sys
import time
import zipfile
import logging
from datetime import datetime
from pathlib import Path
import subprocess

# Avoid UnicodeEncodeError on Windows consoles with cp1252.
for _stream in (getattr(sys, "stdout", None), getattr(sys, "stderr", None)):
    try:
        if _stream and hasattr(_stream, "reconfigure"):
            _stream.reconfigure(errors="replace")
    except Exception:
        pass

# Set up logging to D:\Python\Sales\deploy_to_ubuntu_and_copy.log and console
LOG_FILE = r"D:\Python\Sales\deploy_to_ubuntu_and_copy.log"
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)

try:
    import paramiko
except ImportError:
    logging.info("paramiko not found. Installing...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "paramiko"])
    import paramiko

try:
    from dotenv import load_dotenv
except ImportError:
    logging.info("python-dotenv not found. Installing...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "python-dotenv"])
    from dotenv import load_dotenv

# ========== SETTINGS ==========
HOST = "45.141.76.83"
USER = "dima"
REMOTE_BASE_PATH = "/var/www/sales.zakharenkov.ru"
REMOTE_HTML_PATH = f"{REMOTE_BASE_PATH}/html"
PROJECT_DIR = Path(__file__).parent.resolve()
UPLOAD_ZIP = "deploy_upload.zip"

ITEMS_TO_DEPLOY = [
    "src",
    "alembic",
    "alembic.ini",
    "migrations",
    "requirements.txt",
    "sales_sql.sql"
]
# ==============================

def load_settings():
    env_path = PROJECT_DIR / ".env"
    load_dotenv(dotenv_path=env_path)
    password = os.getenv("SSH_PASSWORD")
    if not password:
        logging.error("SSH_PASSWORD not found in .env file!")
        logging.info("Please add SSH_PASSWORD=your_password to your .env file.")
        sys.exit(1)
    return password

def run_remote_command(ssh, command, sudo_password=None):
    logging.info(f"Running command: {command}")
    
    if sudo_password:
        # Wrap the command with sudo if we need to
        command = f"echo '{sudo_password}' | sudo -S {command}"
        
    stdin, stdout, stderr = ssh.exec_command(command, get_pty=True)
    
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    exit_status = stdout.channel.recv_exit_status()
    
    if out:
        logging.info(f"STDOUT:\n{out}")
    if err:
        logging.warning(f"STDERR:\n{err}")
        
    if exit_status != 0:
        logging.error(f"Command failed with exit status {exit_status}")
    else:
        logging.info("Command completed successfully.")
        
    return exit_status, out, err

def zip_local_files():
    logging.info(f"Creating local deployment zip: {UPLOAD_ZIP}")
    zip_path = PROJECT_DIR / UPLOAD_ZIP
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for item_name in ITEMS_TO_DEPLOY:
            item_path = PROJECT_DIR / item_name
            if not item_path.exists():
                logging.warning(f"Warning: {item_name} not found locally, skipping.")
                continue
                
            if item_path.is_file():
                zipf.write(item_path, arcname=item_name)
            elif item_path.is_dir():
                for root, dirs, files in os.walk(item_path):
                    # Skip __pycache__ etc
                    if '__pycache__' in root:
                        continue
                    for file in files:
                        if file.endswith('.pyc'):
                            continue
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, PROJECT_DIR)
                        zipf.write(file_path, arcname=arcname)
    logging.info("Local zip created.")

def deploy():
    logging.info("=== Starting Deployment ===")
    
    ssh_password = load_settings()
    
    # 1. Zip local files for faster transfer
    zip_local_files()
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        logging.info(f"Connecting to {USER}@{HOST}...")
        ssh.connect(HOST, username=USER, password=ssh_password, timeout=10)
        logging.info("Connected successfully.")
        
        # 2. Upload the new files
        logging.info("Uploading new files via SFTP...")
        sftp = ssh.open_sftp()
        remote_zip_path = f"{REMOTE_BASE_PATH}/{UPLOAD_ZIP}"
        sftp.put(str(PROJECT_DIR / UPLOAD_ZIP), remote_zip_path)
        sftp.close()
        logging.info("Upload complete.")
        
        # 3. Extract new files over the html folder
        logging.info("Extracting new files on server...")
        # Since files like requirements.txt go directly into html:
        run_remote_command(ssh, f"cd {REMOTE_HTML_PATH} && unzip -oq {remote_zip_path}")
        
        # Cleanup remote zip
        run_remote_command(ssh, f"rm {remote_zip_path}")

        # 3.1. Run DB migrations on the server
        logging.info("Applying Alembic migrations on server...")
        migration_command = (
            f"cd {REMOTE_HTML_PATH} && "
            "if [ -x .venv/bin/python ]; then .venv/bin/python -m alembic -c alembic.ini upgrade head; "
            "elif [ -x venv/bin/python ]; then venv/bin/python -m alembic -c alembic.ini upgrade head; "
            "elif [ -x /var/www/sales.zakharenkov.ru/venv/bin/python ]; then /var/www/sales.zakharenkov.ru/venv/bin/python -m alembic -c alembic.ini upgrade head; "
            "elif command -v python3 >/dev/null 2>&1; then python3 -m alembic -c alembic.ini upgrade head; "
            "else python -m alembic -c alembic.ini upgrade head; fi"
        )
        exit_status, _, _ = run_remote_command(ssh, migration_command)
        if exit_status != 0:
            raise Exception("Alembic migration failed on server.")
        
        # 4. Save a copy of the upload zip locally
        logging.info("Saving a local copy of the deployed files...")
        local_backups_dir = PROJECT_DIR / "beckaps"
        local_backups_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime('%d%m%Y_%H%M%S')
        saved_zip_name = f"deploy_{timestamp}.zip"
        saved_zip_path = local_backups_dir / saved_zip_name
        
        import shutil
        local_zip = PROJECT_DIR / UPLOAD_ZIP
        if local_zip.exists():
            shutil.copy2(local_zip, saved_zip_path)
            logging.info(f"Local backup saved as: D:\\Python\\Sales\\beckaps\\{saved_zip_name}")
        
        # 5. Restart services
        logging.info("Restarting services...")
        
        # sales-fastapi.service
        run_remote_command(ssh, "systemctl stop sales-fastapi.service", sudo_password=ssh_password)
        run_remote_command(ssh, "systemctl start sales-fastapi.service", sudo_password=ssh_password)
        run_remote_command(ssh, "systemctl status sales-fastapi.service --no-pager", sudo_password=ssh_password)
        run_remote_command(ssh, "journalctl -u sales-fastapi.service -n 50 --no-pager", sudo_password=ssh_password)
        
        # telegram-uz-sales-bot.service
        marker = f"=== DEPLOY_RESTART_{timestamp} ==="
        run_remote_command(ssh, f"echo '{marker}' >> /var/www/sales.zakharenkov.ru/html/telegram_bot.log")
        run_remote_command(ssh, "systemctl restart telegram-uz-sales-bot.service", sudo_password=ssh_password)
        
        logging.info("Waiting 5 seconds for the bot to initialize...")
        time.sleep(5)
        
        # Verify bot service status
        _, status_stdout, _ = run_remote_command(ssh, "systemctl is-active telegram-uz-sales-bot.service")
        if status_stdout.strip() != "active":
            logging.error(f"❌ ERROR: Telegram bot service is NOT active (Status: {status_stdout.strip()})!")
            run_remote_command(ssh, "journalctl -u telegram-uz-sales-bot.service -n 20 --no-pager", sudo_password=ssh_password)
            raise Exception("Bot service crashed on startup.")
            
        # Verify app logs for hidden Python errors
        _, log_stdout, _ = run_remote_command(ssh, "tail -n 50 /var/www/sales.zakharenkov.ru/html/telegram_bot.log")
        if marker in log_stdout:
            logs_after_restart = log_stdout.split(marker)[-1]
        else:
            logs_after_restart = log_stdout
            
        log_content = logs_after_restart.lower()
        if "traceback (most recent" in log_content or "syntaxerror:" in log_content:
            logging.error("❌ ERROR: Python exception detected in the bot logs shortly after startup!")
            logging.error(f"Recent bot logs:\n{logs_after_restart.strip()}")
            raise Exception("Python error detected in bot logs.")
            
        logging.info("Telegram bot started successfully and is running.")

        logging.info("=== Deployment successfully completed ===")

    except Exception as e:
        logging.error(f"Deployment failed: {e}", exc_info=True)
    finally:
        ssh.close()
        # Fallback cleanup just in case
        local_zip = PROJECT_DIR / UPLOAD_ZIP
        if local_zip.exists():
            local_zip.unlink()

if __name__ == "__main__":
    deploy()
