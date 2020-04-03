import React, { Component } from 'react'
import { connect } from 'react-redux'

import { postSearch, setQuery } from '../actions/search'
import SearchResults from './SearchResults'

const Loading = () => (
  <div className="search-results is-fullwidth">
    <div className="media result">
      <figure className="media-left">
        <div className="loader is-size-3"></div>
      </figure>
    </div>
  </div>
)

class SearchBar extends Component {
  constructor(props) {
    super(props)
    this.timeout = 0
  }

  beginSearch(query) {
    this.props.dispatch(setQuery(query))

    if (this.timeout) clearTimeout(this.timeout);

    this.timeout = setTimeout(() => {
      this.props.dispatch(postSearch(query))
    }, 400);
  }

  render() {
      const { results, query } = this.props;

      const isLoading = (query !== "" && results.isEmpty())

      return (
      <div className="search-bar">
        <div className="field">
          <div className="control is-expanded">
            <input className="input search is-medium" type="text" placeholder="Album or artist..."
              onChange={e => this.beginSearch(e.target.value)}
              value={query}/>
          </div>
        </div>
        { isLoading ? <Loading /> : <SearchResults results={results} /> }
      </div>
    )
  }
}

const mapStateToProps = state => ({
  results: state.search.get('results'),
  query: state.search.get('query')
});

export default connect(mapStateToProps)(SearchBar)
