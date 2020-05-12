import * as consts from '../../constants/collection'
import { clearQuery, clearResults } from '../search'
import { OrderedMap } from 'immutable'

export const clearError = () => ({
  type: consts.CLEAR_ERROR
})

export const raiseError = (error) => ({
  type: consts.RAISE_ERROR,
  error,
})

export const setSort = (sort) => ({
  type: consts.SET_SORT,
  sort
})

export const setSortAsc = () => ({
  type: consts.SET_SORT_ASC,
})

export const sortSIDs = () => ({
  type: consts.SORT_SIDS,
})

/////

export const setFilterQuery = (query) => ({
  type: consts.SET_FILTER_QUERY_SUCCESS,
  query
})

export const filterCollection = () => ({
  type: consts.FITLER_COLLECTION_SUCCESS,
})

export const resetFilters = () => ({
  type: consts.RESET_FILTERS,
})

/////

function shuffle(array) {
  // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  var currentIndex = array.length, temporaryValue, randomIndex;

  while (0 !== currentIndex) {

    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

const increaseIter = () => ({
  type: consts.INCREASE_ITER,
})

export function postComparison(sid1, sid2, category) {
  return async dispatch => {

    const uri = '/comparisons/' + category

    const response = await fetch(uri,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({sid1: sid1, sid2: sid2})
      }
    )

    if (!response.ok) {
      console.log(response)
      dispatch(raiseError('Failed to post comparison'))
      return
    }

    dispatch(increaseIter())

    return dispatch
  }
}

const getComparisonsSuccess = (comparisons) => ({
  type: consts.GET_COMPARISONS_SUCCESS,
  comparisons
})

export function getComparisons() {
  return async dispatch => {

    const uri = '/comparisons'

    const response = await fetch(uri)

    if (!response.ok) {
      console.log(response)
      dispatch(raiseError('Failed to get comparisons'))
      return
    }
    let json = [{'sid1': 'a', 'sid2': 'b'}]

    try {
      json = await response.json()
    } catch(error) {
      dispatch(raiseError('Failed to get JSON comparisons'))
    }

    dispatch(getComparisonsSuccess(json))
  }
}

//////

export const collateScoresSuccess = () => ({
  type: consts.COLLATE_SCORES_SUCCESS,
})

export const rankScoresSuccess = () => ({
  type: consts.RANK_SCORES_SUCCESS,
})

export const getScoresSuccess = (category, scores) => ({
  type: consts.GET_SCORES_SUCCESS,
  category,
  scores,
})

export function getScores(category) {
  return async dispatch => {
    const uri = '/scores/' + category

    const response = await fetch(uri)

    if (!response.ok) {
      console.log(response)
      dispatch(raiseError('Failed to fetch score for "' + category + '"'))
      return
    }

    let json = {}

    try {
      json = await response.json()
    } catch(error) {
      json = {}
    }

    return dispatch(getScoresSuccess(category, json))
  }
}

export function loadScores() {
  return dispatch => {

    Promise.all([
      dispatch(getScores(consts.CATEGORIES[0])),
      dispatch(getScores(consts.CATEGORIES[1])),
      dispatch(getScores(consts.CATEGORIES[2])),
      dispatch(getScores(consts.CATEGORIES[3])),
      dispatch(getScores(consts.CATEGORIES[4])),
      dispatch(getScores(consts.CATEGORIES[5])),
      dispatch(getScores(consts.CATEGORIES[6])),
      dispatch(getScores(consts.CATEGORIES[7])),
      dispatch(getScores(consts.CATEGORIES[8])),
      dispatch(getScores(consts.CATEGORIES[9])),
      dispatch(getScores(consts.CATEGORIES[10])),
      dispatch(getScores(consts.CATEGORIES[11])),
    ]).then(() => {
      dispatch(collateScoresSuccess())
      dispatch(rankScoresSuccess())
    })

  }
}

const _requestComparison = () => ({
  type: consts.REQUEST_COMPARISON,
})

export function requestComparison() {
  return dispatch => {

    return dispatch(_requestComparison())
  }
}

const _shiftQueue = () => ({
  type: consts.SHIFT_QUEUE,
})

export function shiftQueue(queue) {
  return dispatch => {

    dispatch(_shiftQueue())
    dispatch(_requestComparison())

    return queue.first()
  }
}

export const _resetQueue = (queue) => ({
  type: consts.RESET_QUEUE,
  queue,
})

export function resetQueue(albums) {
  return dispatch => {
    let queue = []

    for (let i = 0; i < 10 * 3; i++) {
      let catgs = Array.from(consts.CATEGORIES)
      if (queue.length > 0) {
        catgs.splice(catgs.indexOf(queue[0]['category']), 1)
      }
      let ix = Math.floor(Math.random() * catgs.length)
      let category = catgs[ix]
      let cix = consts.CATEGORIES.indexOf(category)

      albums = albums.filter(v =>
        v.get('history').size >= consts.MIN_LISTENS && v.has('catg_inc') && v.get('catg_inc').includes(category)
      )

      const scoreKey = 'score_' + category
      let k = albums.keySeq()
      const N = k.count()
      let [sid1, sid2] = shuffle(k.toJS()).slice(0,2)

      if (i % 3 !== 0 && i < N) {
        albums = OrderedMap(albums)
        albums = albums.sort((a,b) => a.get(scoreKey) - b.get(scoreKey))

        let k = albums.keySeq()

        let z = []
        for (let i = 1; i < albums.count(); i++) {
          z.push([[k.get(i-1), k.get(i)], albums.getIn([k.get(i), scoreKey]) - albums.getIn([k.get(i-1), scoreKey])])
        }

        console.log(z.sort((a,b) => a[1] - b[1]));

        [sid1, sid2] = z.sort((a,b) => a[1] - b[1])[(i-1) % z.length][0];
      }

      queue.unshift({
        sid1: sid1,
        sid2: sid2,
        category: category,
        question: consts.QUESTIONS[cix]
      })
    }

    dispatch(_resetQueue(queue))
  }
}

//////

export const receiveCollection = (collection) => ({
  type: consts.RECEIVE_COLLECTION,
  collection,
})

export const requestCollection = () => ({
  type: consts.REQUEST_COLLECTION,
})

function resolveAttributes(doc) {
  doc.runtime = doc.tracks.reduce((a,b) => a + b[2], 0)
  doc.view = "r"
  if (doc.catg_inc === undefined) {
    doc.catg_inc = []
  }
  return doc
}

function fetchAlbums() {
  return async dispatch => {
    dispatch(requestCollection())

    const response = await fetch('/collection')

    if (!response.ok) {
      console.log(response)
      dispatch(raiseError('Failed to fetch collection'))
      return
    }

    let json = []
    try {
      json = await response.json()

      // json = json.slice(0, 30) // uncomment for a smaller batch of albums
    } catch(error) {
      console.log("Development data in use")
      dispatch(raiseError('Failed to get albums from collection: ' + error))
      json = [
        {
          "_id": {"$oid": "5e49990141ce0c2071deda8a"},
          "sid": "587Clxxo1i5flgjvS52bEC",
          "add_date": 1581894355.189555,
          "album": "Multi-Love",
          "artist": "Unknown Mortal Orchestra",
          "year": "2015",
          "genres": [],
          "popularity": 64,
          "art": "https://i.scdn.co/image/ab67616d0000b273ee70875d2ac4c16bdeba0191",
          "tracks": [
            [1, "Multi-Love", 250800, "https://p.scdn.co/mp3-preview/be4fb5d07c991cb3e39c3727e59d4f9dcde32dc1?cid=1e397fe8f48841b29574a0412050c29f", ""], [2, "Like Acid Rain", 122426, "https://p.scdn.co/mp3-preview/2f18cd56b39342420ca99e6b75bacaa6f713301d?cid=1e397fe8f48841b29574a0412050c29f", ""], [3, "Ur Life One Night", 267906, "https://p.scdn.co/mp3-preview/a7aca2d833e8957994d03dfa536ac5f0a94f1372?cid=1e397fe8f48841b29574a0412050c29f", ""], [4, "Can\u2019t Keep Checking My Phone", 256066, "https://p.scdn.co/mp3-preview/9e9c97ac933fe93e2ebb145167944c9223872c71?cid=1e397fe8f48841b29574a0412050c29f", ""], [5, "Extreme Wealth and Casual Cruelty", 364626, "https://p.scdn.co/mp3-preview/18f00f6e7a2f714bba9797786657156a83425129?cid=1e397fe8f48841b29574a0412050c29f", ""], [6, "The World Is Crowded", 259600, "https://p.scdn.co/mp3-preview/957f0985805c3abda09aba73e3975d7da5510fe7?cid=1e397fe8f48841b29574a0412050c29f", ""], [7, "Stage or Screen", 206066, "https://p.scdn.co/mp3-preview/c60c065136430232d63ff309a4ac4b87067cfa5c?cid=1e397fe8f48841b29574a0412050c29f", ""], [8, "Necessary Evil", 317800, "https://p.scdn.co/mp3-preview/7c89086aaf5995496ca6ecfd6dfad2bc741c9ac2?cid=1e397fe8f48841b29574a0412050c29f", ""], [9, "Puzzles", 422706, "https://p.scdn.co/mp3-preview/6c0797ad41fd020a021600429f3ae969b53952e9?cid=1e397fe8f48841b29574a0412050c29f", ""]
          ],
          "review": "",
          "history": [1582836433.86285],
          "url": "https://open.spotify.com/album/587Clxxo1i5flgjvS52bEC",
          "catg_inc": consts.CATEGORIES
        },
        {
          "_id": {"$oid": "5e49cbc72b98a08692eb69dc"},
          "sid": "4EX1fAypgQC9wDjGI5QzbZ",
          "add_date": 1581894652.239842,
          "album": "LONG SEASON",
          "artist": "Fishmans",
          "year": "1996",
          "genres": ["classic j-rock", "j-rock", "japanese city pop", "shibuya-kei"],
          "popularity": 32,
          "art": "https://i.scdn.co/image/ab67616d0000b273f9f1de08fccfce6067fbd225",
          "tracks": [[1, "LONG SEASON", 716040, null, ""]],
          "review": "",
          "history": [],
          "url": "https://open.spotify.com/album/4EX1fAypgQC9wDjGI5QzbZ",
          "catg_inc": consts.CATEGORIES
        },
        {
          "_id": {"$oid": "5e49cbc72b98a08692eb69dc"},
          "sid": "1BHwJqnHhuIryphXMZ0PMQ",
          "add_date": 1581980331.445438,
          "album": "New Album",
          "artist": "Some Artist",
          "year": "1998",
          "genres": ["cool music", "nice genre"],
          "popularity": 5,
          "art": "https://i.scdn.co/image/ab67616d0000b273c7ed978a7fd1498ce8c031f7",
          "tracks": [[1, "LONG SEASON", 1016040, null, "Track Rev!"], [2, "LONG SEASON", 116040, null, ""]],
          "review": "Review!",
          "history": [1583798696.841091],
          "url": "https://open.spotify.com/album/1BHwJqnHhuIryphXMZ0PMQ",
          "art_cached": true,
          "catg_inc": consts.CATEGORIES
        },
        {
          "_id": {"$oid": "5e4b1ae48b90ec3d6a742cc4"},
          "sid": "0bCAjiUamIFqKJsekOYuRw",
          "add_date": 1581980388.362533,
          "album": "Wish You Were Here",
          "artist": "Pink Floyd",
          "year": "1975",
          "genres": ["album rock", "art rock", "classic rock", "progressive rock", "psychedelic rock", "rock", "symphonic rock"],
          "popularity": 74,
          "art": "https://i.scdn.co/image/ab67616d0000b273d8fa5ac6259dba33127b398a",
          "tracks": [[1, "Shine On You Crazy Diamond (Pts. 1-5)", 811077, "https://p.scdn.co/mp3-preview/7c03d0cf10ad5784dab1f41840727bbf4492c7f4?cid=1e397fe8f48841b29574a0412050c29f", "Saxophone brings in a huge organic wave of emotion"], [2, "Welcome to the Machine", 451680, "https://p.scdn.co/mp3-preview/81b353c6cc187c13ae81b9cc79df63742fabac89?cid=1e397fe8f48841b29574a0412050c29f", "Wild synths mostly. Juxtaposition with Shine On Pt1-5."], [3, "Have a Cigar", 307733, "https://p.scdn.co/mp3-preview/5128e08debcd7d73176ad5bdac640c48ae8e6f79?cid=1e397fe8f48841b29574a0412050c29f", "Starts with some synths, then moves into the wicked guitar solo"], [4, "Wish You Were Here", 334743, "https://p.scdn.co/mp3-preview/7ce0d4e5f0ffcf8fe1a312c9c2f9331c8d2bf994?cid=1e397fe8f48841b29574a0412050c29f", "Excellent song-writing, performance, and instrumentals"], [5, "Shine On You Crazy Diamond (Pts. 6-9)", 747325, "https://p.scdn.co/mp3-preview/0149309a02c147a561d5557707c1ab8494cc48d6?cid=1e397fe8f48841b29574a0412050c29f", "Monumental, dramatic, space-y, well-paced"]],
          "review": "A tribute album to Syd Barrett and a critique of the music industry.",
          "history": [1582225364.605084, 1584397348.102282],
          "url": "https://open.spotify.com/album/0bCAjiUamIFqKJsekOYuRw",
          "catg_inc": ["art", "critic", "cohesive", "depth", "dynamics", "flow", "friend", "hold", "longevity", "lyrics", "structure", "voice"],
          "cached_art": true
        }
      ]
    }

    json = json.map(x => resolveAttributes(x))

    let addDates = json.map(x => x['add_date'])
    const minAddDates = Math.min(...addDates)
    const maxAddDates = Math.max(...addDates)
    json = json.map(x => {
      x['add_date_score'] = 1 - (x['add_date'] - minAddDates) / (maxAddDates - minAddDates)
      return x
    })

    let listenDates = json.map(x => x['history'].length > 0 ? x['history'][x['history'].length-1] : x['add_date'])
    const minListenDates = Math.min(...listenDates)
    const maxListenDates = Math.max(...listenDates)
    json = json.map(x => {
      let l = x['history'].length
      let v = l > 0 ? x['history'][l - 1] : x['add_date']
      x['listen_score'] = 1 - (v - minListenDates) / (maxListenDates - minListenDates)

      switch(l) {
        case 0:
          x['history_score'] = 1.0
          break
        case 1:
          x['history_score'] = 0.75
          break
        case 2:
          x['history_score'] = 1.0
          break
        default:
          x['history_score'] =  10.5 * Math.pow(l - 2.7, 1.9) * Math.pow(1.2*l - 2.16, -3.4) // Similar to an F-dist
          break
      }
      return x
    })

    let runtimes = json.map(x => x['runtime'])
    const minRuntimes = Math.min(...runtimes)
    const maxRuntimes = Math.max(...runtimes)
    json = json.map(x => {
      x['runtime_score'] = 1 - (x['runtime'] - minRuntimes) / (maxRuntimes - minRuntimes)
      return x
    })

    let genres = json.map(x => x['genres']).flat()
    let genreFreq = {};
    for (var i = 0; i < genres.length; i++) {
        genreFreq[genres[i]] = 1 + (genreFreq[genres[i]] || 0);
    }

    json = json.map(x => {
      x['genre_freq'] = x['genres'].reduce((a, b) => genreFreq[b] + a, 0)
      return x
    })

    let maxGenreFreq = Math.max(...json.map(x => x['genre_freq']))
    json = json.map(x => {
      x['genre_score'] = 1 - (x['genre_freq']) / maxGenreFreq
      return x
    })

    const maxWeight = Object.values(consts.RECOMMENDED_WEIGHTS).reduce((a, b) => a + b, 0)

    json = json.map(x => {
      x['recommended_score'] = (
        consts.RECOMMENDED_WEIGHTS['add_date_score'] * x['add_date_score'] +
        consts.RECOMMENDED_WEIGHTS['listen_score'] * x['listen_score'] +
        consts.RECOMMENDED_WEIGHTS['runtime_score'] * x['runtime_score'] +
        consts.RECOMMENDED_WEIGHTS['history_score'] * x['history_score'] +
        consts.RECOMMENDED_WEIGHTS['genre_score'] * x['genre_score']) / maxWeight
      return x
    })

    dispatch(receiveCollection(json))
    dispatch(sortSIDs())

    return dispatch
  }
}

function shouldFetchCollection(state) {
  if (!state.collection) {
    return true
  }

  const albums = state.collection.get('albums')

  if (albums.get('allSIDs').isEmpty()) {
    return true
  } else if (albums.get('isFetching')) {
    return false
  } else {
    return albums.get('isInvalid')
  }
}

export function fetchCollectionIfNecessary() {
  return (dispatch, getState) => {
    if (shouldFetchCollection(getState)) {
      return dispatch(fetchAlbums())
    } else {
      return Promise.resolve()
    }
  }
}

//////

export const cacheArt = (sid) => ({
  type: consts.CACHE_ART,
  sid,
})

export function postCacheArt(sid) {
  return async dispatch => {

    const uri = '/collection/' + sid + '/cache'

    const response = await fetch(uri, { method: 'POST' })

    if (!response.ok) {
      console.log(response)
      dispatch(raiseError('Error caching album art for Album SID ' + sid + '.'))
    } else {
      dispatch(cacheArt(sid))
    }
  }
}

export const postAlbumCatgSuccess = (sid, cat) => ({
  type: consts.POST_ALBUM_CATG_SUCCESS,
  sid,
  cat,
})

export const deleteAlbumCatgSuccess = (sid, cat) => ({
  type: consts.DELETE_ALBUM_CATG_SUCCESS,
  sid,
  cat,
})

export function postAlbumCatg(sid, cat) {
  return async dispatch => {

    const uri = '/collection/' + sid + '/catg/' + cat

    const response = await fetch(uri, { method: 'POST' })

    if (!response.ok) {
      console.log(response)
      dispatch(raiseError('Error adding comparison category to album to collection.'))
    } else {
      dispatch(postAlbumCatgSuccess(sid, cat))
    }
  }
}

export function deleteAlbumCatg(sid, cat) {
  return async dispatch => {

    const uri = '/collection/' + sid + '/catg/' + cat

    const response = await fetch(uri, { method: 'DELETE' })

    if (!response.ok) {
      console.log(response)
      dispatch(raiseError('Error deleting comparison category from album to collection.'))
    } else {
      dispatch(deleteAlbumCatgSuccess(sid, cat))
    }
  }
}

export const postAlbumSuccess = (sid, album) => ({
  type: consts.POST_ALBUM_SUCCESS,
  sid,
  album,
})

export function postAlbum(sid) {
  return async dispatch => {

    const uri = '/collection/' + sid

    const response = await fetch(uri, { method: 'POST' })

    if (!response.ok) {
      console.log(response)
      dispatch(raiseError('Failed to post new album'))
      return
    }

    try {
      const json = await response.json()

      // json = resolveAttributes(json)

      json.view = "r"
      json.runtime = json.tracks.reduce((a,b) => a + b[2], 0)
      json.recommended_score = 0
      dispatch(clearResults()) // clears results
      dispatch(clearQuery()) // clears query

      dispatch(setSort('SORT_ADDN'))
      dispatch(postAlbumSuccess(sid, json))
      dispatch(resetFilters())
      dispatch(sortSIDs())
    } catch(error) {
      dispatch(raiseError('Error adding album to collection.'))
    }
  }
}

export const deleteAlbumSuccess = (sid) => ({
  type: consts.DELETE_ALBUM_SUCCESS,
  sid,
})

export function deleteAlbum(sid) {
  return async dispatch => {

    const uri = '/collection/' + sid

    const response = await fetch(uri, { method: 'DELETE' })

    if (!response.ok) {
      console.log(response)
      dispatch(raiseError('Error deleting album from collection.'))
    } else {
      dispatch(deleteAlbumSuccess(sid))
      dispatch(resetFilters())
      dispatch(sortSIDs())
    }

  }
}

// album actions

export const postReviewSuccess = (sid, review) => ({
  type: consts.POST_REVIEW_SUCCESS,
  sid,
  review,
})

export function postReview(sid, review) {
  return async dispatch => {

    const uri = '/collection/' + sid

    const response = await fetch(uri, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        review: review
      })
    })

    if (!response.ok) {
      console.log(response)
      dispatch(raiseError('Error adding review to album.'))
    } else {
      dispatch(postReviewSuccess(sid, review))
    }
  }
}

export const postTrackReviewSuccess = (sid, tid, review) => ({
  type: consts.POST_TRACK_REVIEW_SUCCESS,
  sid,
  tid,
  review,
})

export function postTrackReview(sid, tid, review) {
  return async dispatch => {

    const uri = '/collection/' + sid + '/track/' + tid

    const response = await fetch(uri, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        review: review
      })
    })

    if (!response.ok) {
      console.log(response)
      dispatch(raiseError('Error adding track review to album.'))
    } else {
      dispatch(postTrackReviewSuccess(sid, tid, review))
    }
  }
}

export const postListenSuccess = (sid, time) => ({
  type: consts.POST_LISTEN_SUCCESS,
  sid,
  time,
})

export function postListen(sid) {
  return async dispatch => {

    const uri = '/collection/' + sid + '/listen'

    const response = await fetch(uri, { method: 'POST' })

    if (!response.ok) {
      console.log(response)
      dispatch(raiseError('Failed to post listen'))
      return
    }

    try {
      const json = await response.json()
      dispatch(postListenSuccess(sid, json['timestamp']))
    } catch(error) {
      dispatch(raiseError('Error adding listen to album.'))
    }
  }
}

export const setAlbumView = (sid, view) => ({
  type: consts.SET_VIEW,
  sid,
  view,
})
