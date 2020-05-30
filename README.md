# Music Collection

A locally stored and run browser application for recording, logging, and rating your music collection.

Integrates with Spotify API to access a vast database of album, artist, and track information to fill out the details of your personal music collection.

Features the ability for the user to compare two albums under a dozen different categories which ideally define the best albums. Through these pairwise comparisons, scores are assigned to each album and a ranking is computed.

# Installation

This application relies on five unique things, all which must be set up for it to run. Here is one way you may set everything up, in the order for which I believe you'll run into problems first. The work here has been developed on a unix Mac; issues may arise with other platforms. Feel free to post an issue/email me if you have problems getting set up.

## 1. MongoDB

Visit the [PyMongo documentation](https://pymongo.readthedocs.io/en/stable/tutorial.html). To get PyMongo going (discussed later), you'll first need MongoDB community edition itself. There's a link on the page for that, but I installed with `brew`.

We will need to update the mongodb path in `package.json`, and that is clarified later.

## 2. Repository

Clone this repository: `git clone git@github.com:liebscher/MusicCollection.git`.

`cd` into the new directory.

## 2. Node

Install the [latest Node](https://nodejs.org/en/download/) and npm (already distributed with Node).

Run `npm install` to install the package dependencies from `package-lock.json` in the local `node_modules` directory.

## 3. Python

Ensure you have Python3 installed (using Anaconda should be ok).

Create a [virtual environment](https://packaging.python.org/guides/installing-using-pip-and-virtual-environments/):

1. If you don't already have `virtualenv`, run: `python3 -m pip install --user virtualenv`
2. `python3 -m venv mc`
3. `source mc/bin/activate`

Lastly, we'll install all the necessary packages, run: `pip install -r requirements.txt`

## 4. Spotify API Integration

Visit the [Spotify Developer](https://developer.spotify.com/dashboard/applications) page and log into you/sign up for an account. Select "Create a Client ID". Create an ID for a Website application (I used the unoriginal name "MusicCollection"). Navigate to your new client application dashboard. Copy both your new Client ID and Client Secret into the `config.py` file located in the home directory. Keep them in quotes.

This API is how the application fetches new albums and track lists and everything.

## 5. Launch

Lastly, you'll want to launch the application. Run `npm run launch`. A browser window should open and the application should begin loading. If you you've added albums and they don't load, refresh the page.
