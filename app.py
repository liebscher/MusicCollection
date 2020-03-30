from flask import Flask, request, abort, jsonify
app = Flask(__name__,
	static_url_path='',
	static_folder='build')

from os.path import isfile

import urllib.request as urllib

import spotipy
import pprint
import pandas as pd
from spotipy.oauth2 import SpotifyClientCredentials

from datetime import datetime

from bson.json_util import dumps, loads
from pymongo import MongoClient
client = MongoClient('localhost', 27018)
db = client['musicCollectionDB']
collection = db['collection']
comparisons = db['comparisons']

client_credentials_manager = SpotifyClientCredentials('1e397fe8f48841b29574a0412050c29f', 'b03d95f886e042ceb82bbe398e51aa83')
sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

from choix import opt_pairwise

@app.route('/')
def index():
	return app.send_static_file('index.html')

@app.route('/scores/<category>', methods=['GET'])
def scores(category):

	comps = loads(dumps(list(comparisons.find())))
	dt = loads(dumps(list(collection.find())))
	sids = {album['sid']: i for i, album in enumerate(dt)}
	# albums = {album['sid']: album['album'] for i, album in enumerate(dt)}

	comps = pd.DataFrame(comps, columns=["cat", "sid1", "sid2", "timestamp"])

	CATEGORIES = [
	  'art', 'critic', 'cohesive', 'depth', 'dynamics', 'flow', 'friend', 'hold', 'longevity', 'lyrics',
	  'structure', 'voice'
	]
	REVERSE = ['flow', 'hold', 'structure'] # questions that solicit reverse answers

	if category not in CATEGORIES:
		abort(404, description='Category not found')

	d = comps.loc[comps.loc[:, "cat"] == category, ['sid1', 'sid2']]
	if category in REVERSE:
		d = d.reindex(columns=['sid2', 'sid1'])

	x = len(sids)
	ids = d.values.tolist()
	m = opt_pairwise(int(x), [(sids[p[0]], sids[p[1]]) for p in ids])
	m = (m-min(m)) / (max(m) - min(m))

	# return pd.DataFrame({'album': list(albums.values()), 'score': m}).sort_values('score').to_html()

	return jsonify({k: m[sids[k]] for k in sids})

@app.route('/collection', methods=['GET'])
def get_collection():
	return dumps(list(collection.find())), 200, {'Content-Type': 'application/json'}

@app.route('/collection/<sid>', methods=['POST'])
def add_album(sid):
	album = sp.album(sid)
	genres = sp.artist(album['artists'][0]['id'])["genres"]

	data = {
		'sid': sid,
		'add_date': datetime.now().timestamp(),
		'album': album['name'],
		'artist': album['artists'][0]['name'],
		'year': album['release_date'][:4],
		'genres': genres,
		'popularity': album['popularity'],
		'art': album['images'][0]['url'],
		'tracks': [[t['track_number'], t['name'], t['duration_ms'], t['preview_url'], ''] for t in album['tracks']['items']],
		'review': '',
		'history': [],
		'catg_inc': [
		  'art', 'critic', 'cohesive', 'depth', 'dynamics', 'flow', 'friend', 'hold', 'longevity', 'lyrics',
		  'structure', 'voice'
		],
		'url': album['external_urls']['spotify'],
	}

	try:
		with open(f'public/images/{sid}.png', 'wb') as f:
			img = urllib.urlopen(data['art']).read()
			f.write(img)

	except Exception as e:
		print(e)
		abort(500, description=f"Error downloading album art for SID: {sid}")

	data['cached_art'] = False

	dbres = collection.insert_one(data)
	if not dbres.acknowledged:
		abort(500, description=f"Failed to add album SID: {sid}")

	return dumps(data), 201, {'Content-Type': 'application/json'} # return the item found so it can be appended to client collection

@app.route('/collection/<sid>', methods=['PUT'])
def edit_album_review(sid):
	review = request.get_json()['review']

	collection.update_one({'sid': sid}, {'$set': {'review': review}})

	return jsonify({'sid': sid}), 201

@app.route('/collection/<sid>/cache', methods=['POST'])
def cache_art(sid):
	if isfile(f'public/images/{sid}.png'):
		dbres = collection.update_one({'sid': sid}, {'$set': {'cached_art': True}})
		if not dbres.acknowledged:
			abort(500, description=f"Failed to cache album art for SID: {sid}")

	else:
		abort(400, description=f"Album art does not exist for SID: {sid}")

	return jsonify({"sid": sid}), 201

@app.route('/collection/<sid>/catg/<cat>', methods=['POST'])
def add_album_category(sid, cat):

	dbres = collection.update_one({'sid': sid}, {'$push': {'catg_inc': cat}})
	if not dbres.acknowledged:
		abort(500, description=f"Failed to add album category {cat} for SID: {sid}")

	return jsonify({"sid": sid}), 201

@app.route('/collection/<sid>/catg/<cat>', methods=['DELETE'])
def delete_album_category(sid, cat):

	dbres = collection.update_one({'sid': sid}, {'$pull': {'catg_inc': cat}})
	if not dbres.acknowledged:
		abort(500, description=f"Failed to delete album category {cat} for SID: {sid}")

	return jsonify({"sid": sid}), 200

@app.route('/collection/<sid>/track/<tid>', methods=['PUT'])
def update_track_review(sid, tid):
	review = request.get_json()['review']

	collection.update_one({'sid': sid}, {'$set': {f'tracks.{tid}.4': review}})
	dbres = collection.update_one({'sid': sid}, {'$set': {'cached_art': True}})
	if not dbres.acknowledged:
		abort(500, description=f"Failed to cache album art for SID: {sid}")

	return jsonify({"sid": sid}), 201

@app.route('/collection/<sid>/listen', methods=['POST'])
def add_album_listen(sid):
	ts = datetime.now().timestamp()

	dbres = collection.update_one({'sid': sid}, {'$push': {'history': ts}})
	if not dbres.acknowledged:
		abort(500, description=f"Failed to cache album art for SID: {sid}")

	return jsonify({"sid": sid, "timestamp": ts}), 201

@app.route('/collection/<sid>', methods=['DELETE'])
def delete_album(sid):
	dbres = collection.delete_one({'sid': sid})
	if not dbres.acknowledged:
		abort(500, description=f"Failed to delete album for SID: {sid}")

	return jsonify({'sid': sid})

@app.route('/comparisons', methods=['GET'])
def get_comparisons():
	return dumps(list(comparisons.find())), 200, {'Content-Type': 'application/json'}

@app.route('/comparisons/<cat>', methods=['POST'])
def post_comparison(cat):
	sid1 = request.get_json()['sid1']
	sid2 = request.get_json()['sid2']

	data = {
		'timestamp': datetime.now().timestamp(),
		'sid1': sid1,
		'sid2': sid2,
		'cat': cat
	}

	dbres = comparisons.insert_one(data)
	if not dbres.acknowledged:
		abort(500, description=f"Failed to add comparison SID: {sid}")

	return dumps(data), 201, {'Content-Type': 'application/json'}

@app.route('/search', methods=['POST'])
def search():
	query = request.get_json()['query']
	result = sp.search(query, type='album', limit=5)
	return result
