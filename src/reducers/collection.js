import * as consts from '../constants/collection'
import { List, Map, fromJS } from 'immutable';

const initialState = Map({
  albums: Map({
    isFetching: true,
    isLoaded: false,
    isScored: false,
    bySID: Map(),
    allSIDs: List(),
    filteredSIDs: List()
  }),
  error: List(),
  sort: consts.SORTS.ADD,
  sort_asc: true,
  filter: '',
  comparisonQueue: Map({
    isLoading: true,
    isFetching: true,
    maxIters: 6,
    iter: 0,
    queue: List(),
  }),
  comparisons: Map()
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
      return a.get('recommended_score') - b.get('recommended_score')

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
    isFetching: false,
    isLoaded: true,
    isScored: false,
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
        .setIn(['comparisonQueue', 'isFetching'], true)

    case consts.INCREASE_ITER:
      return state
        .setIn(
          ['comparisonQueue', 'iter'],
          state.getIn(['comparisonQueue', 'iter']) + 1
        )

    case consts.GET_COMPARISONS_SUCCESS:
      return state
        .set('comparisons', fromJS(action.comparisons))

    case consts.SHIFT_QUEUE:
      return state
      .setIn(
        ['comparisonQueue', 'queue'],
        state.getIn(['comparisonQueue', 'queue']).shift()
      )
      .setIn(['comparisonQueue', 'isFetching'], false)

    case consts.RESET_QUEUE:
      return state
        .setIn(['comparisonQueue', 'isLoading'], false)
        .setIn(['comparisonQueue', 'isFetching'], false)
        .setIn(['comparisonQueue', 'queue'], fromJS(action.queue))

    case consts.GET_SCORES_SUCCESS:
      const scores = action.scores
      const key = "score_" + action.category

      return state
        .setIn(['albums', 'bySID'],
          state.getIn(['albums', 'bySID'])
          .reduce((R, V, K) => {
              if (K in scores) {
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
        .setIn(['albums', 'isScored'], true)
        .setIn(['albums', 'bySID'],
          state.getIn(['albums', 'bySID'])
          .reduce((R, V, K) =>
            R.set(K, V.set("avg_score",
              consts.CATEGORIES.reduce((S, W) => {
                let y = 'score_' + W
                let e = V.has(y) ? V.get(y) : 0
                return S + e
              }, 0) / consts.CATEGORIES.length
            )
          ),
          state.getIn(['albums', 'bySID'])
        )
      )

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

    case consts.REQUEST_COLLECTION:
      return state
        .setIn(['albums', 'isFetching'], true)

    case consts.RECEIVE_COLLECTION:
      return state
        .set('albums', normalizeAlbums(action.collection))

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
