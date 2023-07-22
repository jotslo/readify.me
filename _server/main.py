from threading import Thread
from flask import Flask, request, jsonify
from waitress import serve
from urllib.request import urlopen, Request


# create flask app
app = Flask(__name__)

# return basic OK response at root
@app.route("/")
def home():
    return {"success": True, "message": "Ready!"}


@app.route("/proxy", methods=["GET"])
def proxy():
    url = request.args.get("url")

    if not url:
        return {"success": False, "error": "No URL provided"}, 400
    
    try:
        with urlopen(url) as response:
            content = jsonify({"contents": response.read().decode("utf-8")})
            content.headers.add('Access-Control-Allow-Origin', '*')
            return content
    
    except:
        return {"success": False, "error": "Invalid URL"}, 400


# handle 404 errors
@app.errorhandler(404)
def not_found(e):
    return {"success": False, "error": "Invalid endpoint"}, 404


# start the flask server in production
if __name__ == "__main__":
    serve(app, host="0.0.0.0", port=443)