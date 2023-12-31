import os
from auth import Database
from dotenv import load_dotenv
from utils.file_format import *
from flask import Flask, render_template, redirect, request, session


load_dotenv('config.env')

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
        return render_template('portal.html')
    else:
        return redirect('/portal/login')
    
@app.route('/portal/media')
def portal_media():
    if not session.get('is_logged_in'):
        return redirect('/portal/login')
    
    full_media_paths = []
    for media_file in os.listdir(os.environ['MEDIA_DIRECTORY_PATH']):
        full_media_paths.append(os.path.join('/', os.environ['MEDIA_DIRECTORY_PATH'], media_file))
    
    return render_template('portal_media.html', media_files=full_media_paths)

@app.route('/portal/media/<action>', methods=['POST'])
def portal_media_rename(action):
    if action == 'rename':
        old_name = request.json.get('oldName')
        new_name = request.json.get('newName')
        
        if not is_image_file(new_name) and is_image_file(old_name):
            new_name = os.path.splitext(new_name)[0] + '.png'
            
        old_path = os.path.join(os.environ['MEDIA_DIRECTORY_PATH'], old_name)
        new_path = os.path.join(os.environ['MEDIA_DIRECTORY_PATH'], new_name)
        
        os.rename(old_path, new_path)
        
    elif action == 'delete':
        file_name = request.json.get('fileName')
        full_file_path = os.path.join(os.environ['MEDIA_DIRECTORY_PATH'], file_name)
        
        os.remove(full_file_path)
    
    return {'success':True}

@app.route('/portal/profile')
def portal_profile():
    if not session.get('is_logged_in'):
        return redirect('/portal/login')
    return render_template('portal_profile.html')

@app.route('/portal/logout')
def portal_logout():
    session['is_logged_in'] = False
    session['username'] = None
    return redirect('/portal')

if __name__ == '__main__':
    app.run(port=3000, debug=True)