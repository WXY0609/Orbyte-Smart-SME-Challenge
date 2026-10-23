"""One process keeps the SQLite workflow and Copilot concurrency guard coherent."""
import os

bind = f"0.0.0.0:{int(os.getenv('PORT', '8080'))}"
workers = 1
threads = 4
timeout = 120
graceful_timeout = 30
accesslog = "-"
errorlog = "-"
