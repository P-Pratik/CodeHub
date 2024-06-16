import os
from app import create_app, db
from scheduler import timely_update

app = create_app()

if __name__ == "__main__":
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
        timely_update(app, db)
    app.run(debug=True)
