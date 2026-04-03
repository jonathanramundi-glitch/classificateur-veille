from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__, static_folder='.', template_folder='.')

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/api/test', methods=['GET'])
def test():
    return {'status': 'ok'}

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)
