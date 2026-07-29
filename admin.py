from flask import Flask, render_template, request, jsonify, send_from_directory, Response
from werkzeug.utils import secure_filename
from PIL import Image
import os
import time
import json
import subprocess
from functools import wraps

# Credentials: set ADMIN_USER and ADMIN_PASS in environment for security
# Defaults (overridable via env): admin / 12345
ADMIN_USER = os.environ.get('ADMIN_USER', 'admin')
ADMIN_PASS = os.environ.get('ADMIN_PASS', '12345')

APP_ROOT = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, static_folder='static', template_folder='templates')

ALLOWED_EXT = {'.png', '.jpg', '.jpeg', '.webp', '.gif'}


def allowed_file(filename):
    return os.path.splitext(filename)[1].lower() in ALLOWED_EXT


def make_dirs(path):
    os.makedirs(path, exist_ok=True)


def write_json_safe(path, data):
    tmp = path + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    os.replace(tmp, path)


def check_auth(username, password):
    return username == ADMIN_USER and password == ADMIN_PASS


def authenticate():
    return Response('Authentication required', 401, {'WWW-Authenticate': 'Basic realm="Login"'})


def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not check_auth(auth.username, auth.password):
            return authenticate()
        return f(*args, **kwargs)
    return decorated


@app.route('/')
@auth_required
def index():
    return render_template('admin.html')
    return username == ADMIN_USER and password == ADMIN_PASS


def authenticate():
    return Response('Authentication required', 401, {'WWW-Authenticate': 'Basic realm="Login"'})


def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not check_auth(auth.username, auth.password):
            return authenticate()
        return f(*args, **kwargs)
    return decorated


@app.route('/upload', methods=['POST'])
@auth_required
def upload():
    section = request.form.get('section') or 'hero'
    title = (request.form.get('title') or '').strip()
    tag = (request.form.get('tag') or '').strip()
    desc = (request.form.get('desc') or '').strip()
    file = request.files.get('file')

    if not (title and tag and desc and file):
        return jsonify({'ok': False, 'error': 'Missing fields'}), 400

    if not allowed_file(file.filename):
        return jsonify({'ok': False, 'error': 'Invalid file type'}), 400

    # Prepare destinations
    assets_dir = os.path.join(APP_ROOT, 'assets', section)
    make_dirs(assets_dir)
    data_dir = os.path.join(APP_ROOT, 'data')
    make_dirs(data_dir)

    ext = os.path.splitext(file.filename)[1].lower()
    timestamp = int(time.time())
    prefix = 'slide_' if section == 'hero' else 'pub_'
    filename = f"{prefix}{timestamp}{ext}"
    filename = secure_filename(filename)
    dest_path = os.path.join(assets_dir, filename)

    # Save original file
    file.save(dest_path)

    # Make a web-friendly resized image (optional)
    try:
        img = Image.open(dest_path)
        img = img.convert('RGB')
        max_w = 1600
        if img.width > max_w:
            h = int(max_w * img.height / img.width)
            img = img.resize((max_w, h), Image.LANCZOS)
            img.save(dest_path, quality=85)
    except Exception:
        pass

    # Update JSON
    json_file = 'hero-rotator.json' if section == 'hero' else 'publications.json'
    json_path = os.path.join(data_dir, json_file)
    current = []
    if os.path.exists(json_path):
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                current = json.load(f)
        except Exception:
            current = []

    rel_path = os.path.join('assets', section, filename).replace('\\', '/')
    entry = {
        'id': f"{section}-{timestamp}",
        'title': title,
        'tag': tag,
        'img': rel_path,
        'desc': desc
    }
    current.append(entry)
    write_json_safe(json_path, current)

    return jsonify({'ok': True, 'entry': entry})


def is_git_repo(path):
    return os.path.isdir(os.path.join(path, '.git'))


@app.route('/git-push', methods=['POST'])
@auth_required
def git_push():
    if not is_git_repo(APP_ROOT):
        return jsonify({'ok': False, 'error': 'No git repository found. Initialize git and set the remote to https://github.com/oreejoy/website.git first.'}), 400

    # Run git add/commit/push — careful: requires repo and remote configured
    message = request.json.get('message') if request.is_json else None
    commit_msg = message or f"Update assets via admin {int(time.time())}"
    try:
        subprocess.run(['git', 'add', '--all'], cwd=APP_ROOT, check=True, capture_output=True)
        subprocess.run(['git', 'commit', '-m', commit_msg], cwd=APP_ROOT, check=True, capture_output=True)
        proc = subprocess.run(['git', 'push'], cwd=APP_ROOT, check=True, capture_output=True)
        out = proc.stdout.decode('utf-8', errors='ignore')
        return jsonify({'ok': True, 'output': out})
    except subprocess.CalledProcessError as e:
        return jsonify({'ok': False, 'error': e.stderr.decode('utf-8', errors='ignore')}), 500


if __name__ == '__main__':
    # Bind to localhost only for safety
    app.run(host='127.0.0.1', port=5000, debug=True)
