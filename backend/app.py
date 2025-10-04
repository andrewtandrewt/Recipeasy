from flask import Flask, request, jsonify
from newspaper import Article

app = Flask(__name__)

@app.route('/parse', methods=['POST'])
def parse_recipe():
    data = request.get_json()
    url = data.get('url')

    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    try:
        article = Article(url)
        article.download()
        article.parse()
        text = article.text

        # Very simple placeholder parsing
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        title = article.title
        ingredients = [line for line in lines if 'cup' in line.lower() or 'tsp' in line.lower() or 'tablespoon' in line.lower()]
        steps = [line for line in lines if line not in ingredients][:10]  # first 10 lines as steps

        return jsonify({
            'title': title,
            'ingredients': ingredients,
            'steps': steps
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)