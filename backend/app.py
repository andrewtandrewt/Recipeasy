import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from newspaper import Article
import requests
import google.generativeai as genai
from flask_cors import CORS

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SPOONACULAR_API_KEY = os.getenv("SPOONACULAR_API_KEY")

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)

app = Flask(__name__)
CORS(app)

# ----------------------------
# Gemini API route (replaces OpenAI)
# ----------------------------
@app.route('/api/gemini', methods=['POST'])
def gemini_api():
    data = request.get_json()
    prompt = data.get('prompt')

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        return jsonify({"result": response.text})
    except Exception as e:
        return jsonify({"error": f"Gemini API error: {str(e)}"}), 500

# ----------------------------
# Get recipe info (Spoonacular)
# ----------------------------
# @app.route('/api/recipe/<int:recipe_id>', methods=['GET'])
# def get_recipe(recipe_id):
#     params = {"apiKey": SPOONACULAR_API_KEY}
#     url = f"https://api.spoonacular.com/recipes/{recipe_id}/information"
#     response = requests.get(url, params=params)
#     if response.ok:
#         print("Spoonacular API response:")
#         print(response.json())
#         return jsonify(response.json())
#     else:
#         return jsonify({"error": "Spoonacular API error"}), 500

# ----------------------------
# Parse recipe from URL
# ----------------------------
@app.route('/parse', methods=['POST'])
def parse_recipe():
    data = request.get_json()
    url = data.get('url')
    if not url:
        return jsonify({"error": "No URL provided"}), 400

    article = Article(url)
    try:
        article.download()
        article.parse()
        return jsonify({
            "title": article.title,
            "text": article.text
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ----------------------------
# Recipe recommendations (Gemini)
# ----------------------------
@app.route('/recommendations', methods=['POST'])
def recommendations():
    data = request.get_json()
    user_input = data.get('user_input')

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"Suggest some recipes based on these ingredients: {user_input}"
        response = model.generate_content(prompt)

        suggestions = response.text.strip().split("\n")
        return jsonify({"suggestions": suggestions})
    except Exception as e:
        return jsonify({"error": f"Gemini API error: {str(e)}"}), 500

# ----------------------------
# Search recipes (Spoonacular)
# ----------------------------
@app.route('/api/search', methods=['GET'])
def search_recipes():
    query = request.args.get('query')
    if not query:
        return jsonify({"error": "Missing 'query' parameter"}), 400

    url = "https://api.spoonacular.com/recipes/complexSearch"
    params = {
        "apiKey": SPOONACULAR_API_KEY,
        "query": query,
        "number": 10
    }

    spoon_response = requests.get(url, params=params)
    if spoon_response.ok:
        return jsonify(spoon_response.json())
    else:
        return jsonify({"error": "Spoonacular API error"}), 500

if __name__ == '__main__':
    app.run(port=3002, debug=True)
