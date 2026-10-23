"""Flask entry point. Run `python app.py` or `flask --app app run`."""
import os
from server import create_app

if __name__ == "__main__":
    create_app().run(host=os.getenv("ORBYTE_HOST", "127.0.0.1"), port=5000, debug=False)
