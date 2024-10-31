from flask import Blueprint, render_template, current_app
import requests

# Define a blueprint for main routes
main = Blueprint('main', __name__)

def _fetch_from_sanity(query):
    """Helper function to fetch data from Sanity based on the given query."""
    project_id = current_app.config['SANITY_PROJECT_ID']
    dataset = current_app.config['SANITY_DATASET']

    # Build the URL to fetch data from Sanity
    url = f'https://{project_id}.api.sanity.io/v2021-10-21/data/query/{dataset}'
    params = {'query': query}

    # Make the request to Sanity's API
    response = requests.get(url, params=params)

    # Check if the request was successful
    if response.status_code == 200:
        return response.json().get('result', [])
    else:
        print(f'Error fetching data from Sanity: {response.status_code}, {response.text}')
        return None

@main.route('/')
def index():
    project_id = current_app.config['SANITY_PROJECT_ID']
    dataset = current_app.config['SANITY_DATASET']
    # Fetch all posts from Sanity
    query = '*[_type == "post"]'
    posts = _fetch_from_sanity(query) or []

    return render_template('index.html', posts=posts, project_id=project_id, dataset=dataset)

@main.route('/post/<post_id>')
def post_detail(post_id):
    project_id = current_app.config['SANITY_PROJECT_ID']
    dataset = current_app.config['SANITY_DATASET']
    # Fetch a specific post by ID from Sanity
    query = f'*[_type == "post" && _id == "{post_id}"][0]'
    post = _fetch_from_sanity(query)

    return render_template('post_detail.html', post=post, project_id=project_id, dataset=dataset)