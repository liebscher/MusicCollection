import * as consts from '../../constants/search'
import { raiseError } from '../collection'

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
  return async dispatch => {

    if (!query || !query.length) {
      dispatch(clearQuery())
      dispatch(clearResults())
      return
    }

    const response = await fetch('/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({query: query})
    })

    if (!response.ok) {
      console.log(response)
      dispatch(raiseError('Failed to post search.'))
      return
    }

    let json = []

    try {
      json = await response.json()

      json = json.albums.items.map(v => ({
        sid: v["id"],
        artist: v["artists"][0]["name"],
        album: v["name"],
        year: v["release_date"].substring(0,4),
        art: v["images"][2]["url"]
      }))
    } catch(error) {
      dispatch(raiseError('Failed to format search: "' + error + '"'))
      json = [
        {
          sid: "123",
          artist: "Test",
          album: "Test",
          year: "2000",
          art: "https://i.scdn.co/image/ab67616d0000485182fd952c052899397f8c9917"
        }
      ]
    }

    dispatch(setSearchResults(json))
  }
}
