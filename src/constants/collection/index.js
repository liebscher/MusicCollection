export const RAISE_ERROR = 'RAISE_ERROR'
export const CLEAR_ERROR = 'CLEAR_ERROR'

export const SET_SORT = 'SET_SORT'
export const SET_SORT_ASC = 'SET_SORT_ASC'
export const SORT_SIDS = 'SORT_SIDS'

export const SORTS = {
  ADD: 'ADD',
  RUNTIME: 'RUNTIME',
  LISTEN: 'LISTEN',
  RECOMMENDED: 'RECOMMENDED',
  RANK: 'RANK',
}

export const REQUEST_COMPARISON = 'REQUEST_COMPARISON'
export const INCREASE_ITER = 'INCREASE_ITER'
export const GET_COMPARISONS_SUCCESS = 'GET_COMPARISONS_SUCCESS'

// export const RESET_SCORES_COUNT = 'RESET_SCORES_COUNT'
// export const SET_COMPARISON_QUEUE = 'SET_COMPARISON_QUEUE'

export const SHIFT_QUEUE = 'SHIFT_QUEUE'
export const RESET_QUEUE = 'RESET_QUEUE'

export const GET_SCORES_SUCCESS = 'GET_SCORES_SUCCESS'
export const COLLATE_SCORES_SUCCESS = 'COLLATE_SCORES_SUCCESS'
export const RANK_SCORES_SUCCESS = 'RANK_SCORES_SUCCESS'

export const SET_FILTER_QUERY_SUCCESS = 'SET_FILTER_QUERY_SUCCESS'
export const FITLER_COLLECTION_SUCCESS = 'FITLER_COLLECTION_SUCCESS'
export const RESET_FILTERS = 'RESET_FILTERS'

export const INVALIDATE_COLLECTION = 'INVALIDATE_COLLECTION'
export const REQUEST_COLLECTION = 'REQUEST_COLLECTION'
export const RECEIVE_COLLECTION = 'RECEIVE_COLLECTION'

export const POST_ALBUM_SUCCESS = 'POST_ALBUM_SUCCESS'
export const GET_ALBUM_CATGS_SUCCESS = 'GET_ALBUM_CATGS_SUCCESS'
export const POST_ALBUM_CATG_SUCCESS = 'POST_ALBUM_CATG_SUCCESS'
export const DELETE_ALBUM_CATG_SUCCESS = 'DELETE_ALBUM_CATG_SUCCESS'
export const DELETE_ALBUM_SUCCESS = 'DELETE_ALBUM_SUCCESS'
export const CACHE_ART = 'CACHE_ART'

export const POST_REVIEW_SUCCESS = 'POST_REVIEW_SUCCESS'
export const POST_TRACK_REVIEW_SUCCESS = 'POST_TRACK_REVIEW_SUCCESS'
export const POST_LISTEN_SUCCESS = 'POST_LISTEN_SUCCESS'
export const SET_VIEW = 'SET_VIEW'

export const MIN_LISTENS = 3
export const CATEGORIES = [
  'art', 'critic', 'cohesive', 'depth', 'dynamics', 'flow', 'friend', 'hold', 'longevity', 'lyrics',
  'structure', 'voice'
]
export const QUESTIONS = [
  "Which album art contributes to the album more?",
  "Which album would you buy for a music critic?",
  "Which has songs that build an album greater than its parts?",
  "Which album makes you think more?",
  "Which album better balances soft and loud?",
  "More songs on which album didn't flow well with the rest?",
  "Which album would you buy for your best friend?",
  "Which are you more likely to get distracted during while listening?",
  "Which would you choose if forced to listen to one once every day?",
  "Taking only the lyrics from these albums, which would make a better story in book form?",
  "Which album has more filler tracks?",
  "Which album has better vocals?",
]

export const RECOMMENDED_WEIGHTS = {
  add_date_score: 0.333,
  listen_score: 0.54,
  runtime_score: 0.5,
  history_score: 1.0,
  genre_score: 0.75,
}
