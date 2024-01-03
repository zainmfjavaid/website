import os
from database import Database
from dotenv import load_dotenv
from utils.file import *
from werkzeug.utils import secure_filename
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
        user_id = Database().validate_user(username, password)
        if user_id is not None:
            session['is_logged_in'] = True
            session['user_id'] = user_id
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
    
@app.route('/portal/post')
def portal_article_create():
    if not session.get('is_logged_in'):
        return redirect('/portal/login')
    
    article_id = Database().add_article(user_id=session['user_id'], title='', content='')
    return redirect(f'/portal/post/{article_id}')

@app.route('/portal/post/<article_id>')
def portal_edit_post(article_id):
    if not session.get('is_logged_in'):
        return redirect('/portal/login')
    
    return article_id
    
@app.route('/portal/media')
def portal_media():
    if not session.get('is_logged_in'):
        return redirect('/portal/login')
    
    time_sorted_file_names = get_file_paths_by_time(os.path.abspath(os.environ['MEDIA_DIRECTORY_PATH']))
    full_media_paths = [os.path.join('/', os.environ['MEDIA_DIRECTORY_PATH'], file_name) for file_name in time_sorted_file_names]

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
        
        if old_path != new_path:
            os.rename(old_path, new_path)
            
        return {'success':True, 'newUrl':'/'+new_path}
        
    elif action == 'delete':
        file_name = request.json.get('fileName')
        
        if not is_image_file(file_name):
            file_name += '.png'
        full_file_path = os.path.join(os.environ['MEDIA_DIRECTORY_PATH'], file_name)
        
        os.remove(full_file_path)
        
        return {'success':True}

    elif action == 'upload':
        uploaded_files = request.files.getlist("files[]")
        new_image_paths = []
        for file in uploaded_files:
            if file and is_image_file(file.filename):
                file_name = secure_filename(file.filename)
                new_file_path = os.path.join(os.environ['MEDIA_DIRECTORY_PATH'], file_name)
                file.save(new_file_path)
                
                new_image_paths.append('/' + new_file_path)
        return {'success':True, 'uploadedImages':new_image_paths}
    
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