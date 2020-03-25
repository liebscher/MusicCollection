import React from 'react'
import SearchResult from './SearchResult'

const SearchResults = ({results}) => {
  if (!results || results.isEmpty()) return null

  return (
    <div className="search-results is-fullwidth">
      {results.map(v => {
        return <SearchResult key={v.get("sid")} sid={v.get("sid")}
          artist={v.get("artist")} album={v.get("album")} year={v.get("year")}
          art={v.get("art")} />
      })}
    </div>
  )
}

export default SearchResults
