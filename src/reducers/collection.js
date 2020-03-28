import * as consts from '../constants/collection'
import { List, Map, fromJS } from 'immutable';

const initialState = Map({
  albums: Map({
    isFetching: false,
    isInvalid: false,
    isLoaded: false,
    isScored: false,
    lastUpdated: 0,
    bySID: Map(),
    allSIDs: List(),
    filteredSIDs: List()
  }),
  error: List(),
  sort: consts.SORTS.ADD,
  sort_asc: true,
  filter: '',
  comparison: Map({
    isLoaded: false,
    isFetching: false,
    isInvalid: false,
    category: '',
    question: '',
    sid1: '',
    sid2: '',
    maxIters: 6,
    iter: 6,
  })
})

const sortCollection = (a, b, method) => {
  switch (method) {
    case consts.SORTS.LISTEN:
      if (!a.get('history').isEmpty() && !b.get('history').isEmpty()) {
        return a.get('history').last() - b.get('history').last()

      } else if (!a.get('history').isEmpty() && b.get('history').isEmpty()) {
        return a.get('history').last() - b.get('add_date')

      } else if (!b.get('history').isEmpty() && a.get('history').isEmpty()) {
        return a.get('add_date') - b.get('history').last()
      }
      return a.get('add_date') - b.get('add_date')

    case consts.SORTS.RUNTIME:
      return a.get('runtime') - b.get('runtime')

    case consts.SORTS.RECOMMENDED:
      if (a.get('history').count() === consts.MIN_LISTENS - 1) {
        if (b.get('history').isEmpty()) {
          return -1
        }
        return a.get('history').last() - b.get('history').last()

      }
      return 1

    case consts.SORTS.RANK:
      return a.get('avg_score_rank') - b.get('avg_score_rank')

    default:
      return b.get('add_date') - a.get('add_date')
  }
}

function filterAlbums(albums, query) {
  query = query.toLowerCase()

  return albums.get('allSIDs').filter(sid => {
    const album = albums.getIn(['bySID', sid])

    if (query.substring(0, 6) === "genre:" && album.get("genres")) {
      return album.get("genres").join(" ").includes(query.substring(6))
    }

    return album.get('album').toLowerCase().includes(query) || album.get('artist').toLowerCase().includes(query)
  })
}

function normalizeAlbums(data) {
  return fromJS({
    bySID: data.reduce((obj, cv) => ({...obj, [cv.sid]: cv }), {}),
    allSIDs: data.map(obj => obj.sid),
    filteredSIDs: data.map(obj => obj.sid)
  })
}

const collection = (state = initialState, action) => {
  switch (action.type) {
    case consts.CLEAR_ERROR:
      return state.set('error', state.get('error').shift())

    case consts.RAISE_ERROR:
      return state.set('error', state.get('error').push(action.error))

    case consts.SET_SORT:
      return state.set('sort', action.sort)

    case consts.SET_SORT_ASC:
      return state.set('sort_asc', !state.get('sort_asc'))

    case consts.SORT_SIDS:
      const desc = state.get('sort_asc')
      return state.setIn(['albums', 'filteredSIDs'], state.getIn(['albums', 'filteredSIDs']).sort(
          (a, b) => sortCollection(
            state.getIn(['albums', 'bySID', desc ? a : b]),
            state.getIn(['albums', 'bySID', desc ? b : a]),
            state.get('sort')
          )
        )
      )

    case consts.REQUEST_COMPARISON:
      return state
        .setIn(['comparison', 'sid1'], action.sid1)
        .setIn(['comparison', 'sid2'], action.sid2)
        .setIn(['comparison', 'question'], action.question)
        .setIn(['comparison', 'category'], action.category)
        .setIn(['comparison', 'isLoaded'], false)
        .setIn(['comparison', 'isFetching'], true)
        .setIn(['comparison', 'isInvalid'], false)

    case consts.RECEIVE_COMPARISON:
      return state
        .setIn(['comparison', 'isLoaded'], true)
        .setIn(['comparison', 'isFetching'], false)
        .setIn(['comparison', 'isInvalid'], false)


    case consts.POST_COMPARISON_SUCCESS:
      return state
        .setIn(['comparison', 'sid1'], '')
        .setIn(['comparison', 'sid2'], '')
        .setIn(['comparison', 'question'], '')
        .setIn(['comparison', 'category'], '')
        .setIn(['comparison', 'isLoaded'], false)
        .setIn(['comparison', 'isFetching'], false)
        .setIn(['comparison', 'isInvalid'], false)
        .setIn(['comparison', 'iter'], state.getIn(['comparison', 'iter'])+1)

    case consts.RESET_SCORES_COUNT:
      return state.setIn(['comparison', 'iter'], 0)

    case consts.GET_SCORES_SUCCESS:
      const scores = action.scores
      const key = "score_" + action.category

      return state
        .setIn(['albums', 'bySID'],
          state.getIn(['albums', 'bySID'])
          .reduce((R, V, K) => {
              if (scores[K]) {
                return R.set(K, V.set(key, scores[K]))
              } else {
                console.log("Use local value: ", key, K)
                return R.set(K, V.set(key, Math.random()))
              }
          },
          state.getIn(['albums', 'bySID'])
        )
      )

    case consts.COLLATE_SCORES_SUCCESS:
      return state
        .setIn(['albums', 'bySID'],
          state.getIn(['albums', 'bySID'])
          .reduce((R, V, K) =>
            R.set(K, V.set("avg_score",
              consts.CATEGORIES.reduce((S, W) => {
                let y = 'score_' + W
                let e = V.get(y) ? V.get(y) : 0
                return S + e
              }, 0) / consts.CATEGORIES.length
            )
          ),
          state.getIn(['albums', 'bySID'])
        )
      )
      .setIn(['albums', 'isScored'], true)

    case consts.RANK_SCORES_SUCCESS:
      const sorted = state.getIn(['albums', 'bySID']).map((v, k) => v.get('avg_score')).sort().reverse().keySeq()
      return state
        .setIn(['albums', 'bySID'],
          state.getIn(['albums', 'bySID'])
          .reduce((R, V, K) =>
            R.set(K, V.set("avg_score_rank",
              sorted.indexOf(K)+1
            )
          ),
          state.getIn(['albums', 'bySID'])
        )
      )

    case consts.CACHE_ART:
      return state.setIn(['bySID', action.sid, 'cached_art'], true)

    case consts.SET_FILTER_QUERY_SUCCESS:
      return state.set('filter', action.query)

    case consts.FITLER_COLLECTION_SUCCESS:
      return state.setIn(['albums', 'filteredSIDs'],
        filterAlbums(state.get('albums'), state.get('filter'))
      )

    case consts.INVALIDATE_COLLECTION:
      return state
        .setIn(['albums', 'isInvalid'], true)

    case consts.REQUEST_COLLECTION:
      return state
        .setIn(['albums', 'isInvalid'], false)
        .setIn(['albums', 'isFetching'], true)

    case consts.RECEIVE_COLLECTION:
      return state
        .set('albums', normalizeAlbums(action.collection))
        .setIn(['albums', 'isLoaded'], true)
        .setIn(['albums', 'isInvalid'], false)
        .setIn(['albums', 'isFetching'], false)

    case consts.RESET_FILTERS:
      return state.set('filter', '').setIn(
        ['albums', 'filteredSIDs'], state.getIn(['albums', 'allSIDs'])
      )
    case consts.POST_ALBUM_SUCCESS:
      return state.setIn(
        ['albums', 'bySID', action.sid], fromJS(action.album)
      ).setIn(
        ['albums', 'allSIDs'], state.getIn(['albums', 'allSIDs']).push(action.sid)
      )

    case consts.POST_ALBUM_CATG_SUCCESS:
      let ccatg = state.getIn(['albums', 'bySID', action.sid, 'catg_inc'])
      return state.setIn(['albums', 'bySID', action.sid, 'catg_inc'],
        ccatg ? ccatg.push(action.cat) : List([action.cat])
      )

    case consts.DELETE_ALBUM_CATG_SUCCESS:
      let catg_ix = state.getIn(['albums', 'bySID', action.sid, 'catg_inc']).indexOf(action.cat)
      return state.setIn(['albums', 'bySID', action.sid, 'catg_inc'],
        state.getIn(['albums', 'bySID', action.sid, 'catg_inc']).delete(catg_ix)
      )
    case consts.DELETE_ALBUM_SUCCESS:
      let ix = state.getIn(['albums', 'allSIDs']).indexOf(action.sid)
      return state.setIn(['albums', 'allSIDs'], state.getIn(['albums', 'allSIDs']).delete(ix))
    case consts.POST_REVIEW_SUCCESS:
      return state.setIn(['albums', 'bySID', action.sid, 'review'], action.review)
    case consts.POST_TRACK_REVIEW_SUCCESS:
      return state.setIn(['albums', 'bySID', action.sid, 'tracks', action.tid, 5], action.review)
    case consts.POST_LISTEN_SUCCESS:
      return state.setIn(['albums', 'bySID', action.sid, 'history'],
        state.getIn(['albums', 'bySID', action.sid, 'history']).push(action.time)
      )
    case consts.SET_VIEW:
      return state.setIn(['albums', 'bySID', action.sid, 'view'], action.view)
    default:
      return state
  }
}

export default collection
