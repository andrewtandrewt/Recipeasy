import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from newspaper import Article
import requests

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SPOONACULAR_API_KEY = os.getenv("SPOONACULAR_API_KEY")

app = Flask(__name__)

@app.route('/api/openai', methods=['POST'])
def openai_api():
    data = request.get_json()
    prompt = data.get('prompt')
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": prompt}]
    }
    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers=headers,
        json=payload
    )
    if response.ok:
        content = response.json()["choices"][0]["message"]["content"]
        return jsonify({"result": content})
    else:
        return jsonify({"error": "OpenAI API error"}), 500

@app.route('/api/recipe/<int:recipe_id>', methods=['GET'])
def get_recipe(recipe_id):
    params = {
        "apiKey": SPOONACULAR_API_KEY
    }
    url = f"https://api.spoonacular.com/recipes/{recipe_id}/information"
    response = requests.get(url, params=params)
    if response.ok:
        return jsonify(response.json())
    else:
        return jsonify({"error": "Spoonacular API error"}), 500

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


    response = requests.get(url, params=params)
    if response.ok:
        return jsonify(response.json())
    else:
        return jsonify({"error": "Spoonacular API error"}), 500 

if __name__ == '__main__':
    app.run(port=3002, debug=True)
