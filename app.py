from flask import Flask, render_template, request

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def home():
    greeting = "Hello, welcome to my Python web app!"
    if request.method == "POST":
        user_name = request.form.get("name")
        if user_name:
            greeting = f"Hello, {user_name}! Great to meet you."
    return render_template("index.html", greeting=greeting)

if __name__ == "__main__":
    app.run(debug=True)