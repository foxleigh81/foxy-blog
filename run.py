from app import create_app

print("Starting app creation...")  # Debugging line
app = create_app()
print("App created successfully")  # Debugging line

if __name__ == '__main__':
    print("Running the app...")  # Debugging line
    app.run(debug=True)