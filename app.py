import os
from dotenv import load_dotenv
from flask import Flask, render_template


load_dotenv('secret.env')

app = Flask(__name__)
app.secret_key = os.environ['FLASK_SECRET_KEY']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/portal')
def portal():
    return render_template('cms_portal.html')

if __name__ == '__main__':
    app.run(port=3000, debug=True)