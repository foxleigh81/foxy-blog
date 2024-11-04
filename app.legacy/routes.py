from flask import Blueprint, render_template, current_app, g
import requests

# Define a blueprint for main routes
main = Blueprint('main', __name__)

def _fetch_from_sanity(query):
    """Helper function to fetch data from Sanity based on the given query."""
    
    # Build the URL to fetch data from Sanity
    url = f'https://{g.project_id}.api.sanity.io/v2021-10-21/data/query/{g.dataset}'
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
    # Fetch posts from Sanity
    query = '*[_type == "post"]{..., category->{slug}, hero, heroAlt, excerpt, slug}'
    posts = _fetch_from_sanity(query) or []

    return render_template('index.html', posts=posts, project_id=g.project_id, dataset=g.dataset)

@main.route('/<category_slug>')
def category_detail(category_slug):
    # Fetch category and its posts from Sanity
    query = f'''*[_type == "category" && slug.current == "{category_slug}"][0] {{
      name, 
      slug, 
      "posts": *[_type == "post" && category._ref == ^._id] {{
        title, 
        slug, 
        category->{{name, slug}}, 
        hero, 
        heroAlt, 
        excerpt 
      }}
    }}'''
    
    category = _fetch_from_sanity(query)

    # Handle case where category doesn't exist
    if not category:
        return render_template('404.html'), 404

    project_id, dataset = g.project_id, g.dataset
    return render_template('category_detail.html', category=category, project_id=project_id, dataset=dataset)

@main.route('/<category_slug>/<post_slug>')
def post_detail(category_slug, post_slug):
    # Fetch a specific post by category and slug from Sanity, dereferencing the category
    query = f'*[_type == "post" && category->slug.current == "{category_slug}" && slug.current == "{post_slug}"][0]{{..., category->{{name, slug}}}}'
    post = _fetch_from_sanity(query)

    
    return render_template('post_detail.html', post=post, project_id=g.project_id, dataset=g.dataset)