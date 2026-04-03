from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__, static_folder='.', template_folder='.')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({'status': 'ok', 'message': 'API working'})

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)
