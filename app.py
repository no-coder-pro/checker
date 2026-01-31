from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import cloudscraper

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)  # Enable CORS for all routes

@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/api/chkr', methods=['GET'])
def check_card():
    cc_data = request.args.get('cc')
    
    if not cc_data:
        return jsonify({"error": "Missing 'cc' parameter"}), 400

    headers = {
        'sec-ch-ua-platform': '"Windows"',
        'Referer': 'https://chkr.cc/',
        'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
        'sec-ch-ua-mobile': '?0',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'DNT': '1',
        'Content-Type': 'application/json; charset=UTF-8',
    }

    json_data = {
        'data': cc_data,
        'charge': False,
    }

    try:
        scraper = cloudscraper.create_scraper()
        response = scraper.post('https://api.chkr.cc/', headers=headers, json=json_data)
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({"error": f"API Request failed: {str(e)}", "status": "Unknown"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
