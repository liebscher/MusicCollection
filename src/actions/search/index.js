import * as consts from '../../constants/search'

export const setSearchResults = (results) => ({
  type: consts.SET_RESULTS,
  results
})

export const clearResults = () => ({
  type: consts.CLEAR_RESULTS,
})

export const setQuery = (query) => ({
  type: consts.SET_QUERY,
  query
})

export const clearQuery = () => ({
  type: consts.CLEAR_QUERY,
})

export function postSearch(query) {
  return dispatch => {

    if (!query || !query.length) {
      dispatch(clearQuery())
      dispatch(clearResults())
      return
    }

    fetch('/search', {
      method: 'POST',
      mode: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({query: query})
    })
    .then(resp => resp.json())
    .then(resp => {

      let formatted = resp.albums.items.map(v => ({
        sid: v["id"],
        artist: v["artists"][0]["name"],
        album: v["name"],
        year: v["release_date"].substring(0,4),
        art: v["images"][2]["url"]
      }))

      dispatch(setSearchResults(formatted))
    })
    .catch(error => {
      dispatch(setSearchResults([
        {
          sid: "123",
          artist: "test",
          album: "test",
          year: "2000",
          art: "https://i.scdn.co/image/ab67616d0000485182fd952c052899397f8c9917"
        }
      ]))
    })
  }
}
