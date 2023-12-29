import os
from auth import Database
from dotenv import load_dotenv
from flask import Flask, render_template, redirect, request, session


load_dotenv('secret.env')

app = Flask(__name__)
app.secret_key = os.environ['FLASK_SECRET_KEY']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/portal/login', methods=['GET', 'POST'])
def portal_login():
    if request.method == 'POST':
        username, password = request.form['username'], request.form['password']        
        is_valid_login = Database().validate_user(username, password)
        if is_valid_login:
            session['is_logged_in'] = True
            session['username'] = username
            return redirect('/portal')
        else:
            return render_template('login.html', bad_attempt=True)
    else:
        return render_template('login.html')

@app.route('/portal')
def portal():
    if session.get('is_logged_in'):
        return render_template('cms_portal.html')
    else:
        return redirect('/portal/login')

@app.route('/portal/logout')
def portal_logout():
    session['is_logged_in'] = False
    session['username'] = None
    return redirect('/portal')

if __name__ == '__main__':
    app.run(port=3000, debug=True)