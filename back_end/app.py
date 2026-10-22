from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enables cross-origin requests from your React app

@app.route("/api/greeting", methods=["GET", "POST"])
def greeting():
    user_name = "Guest"
    if request.method == "POST":
        data = request.get_json() or {}
        user_name = data.get("name", "Guest")

    return jsonify({
        "status": "success",
        "greeting": f"Hello, {user_name}! Welcome to Orbyte Smart SME."
    })

@app.route("/api/simulations", methods=["POST"])
def simulate():
    data = request.get_json() or {}
    weather = data.get("weather", "clear")
    incident = data.get("incident", "none")

    foot_traffic_change = 0
    prep_reduction = 0

    if weather == "rain":
        foot_traffic_change = -35
        prep_reduction = 25
    elif weather == "storm":
        foot_traffic_change = -75
        prep_reduction = 60

    if incident != "none":
        foot_traffic_change -= 20

    return jsonify({
        "weather": weather,
        "incident": incident,
        "footTrafficImpact": f"{foot_traffic_change}%",
        "recommendedPrepReduction": f"{prep_reduction}%",
        "aiRecommendation": "AI Protocol Active: Inventory orders adjusted dynamically."
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)