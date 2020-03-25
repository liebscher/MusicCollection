import React, { Component } from 'react'
import { connect } from 'react-redux'

import { setSort, sortSIDs, setFilterQuery, filterCollection, resetFilters } from '../actions/collection'

class Filter extends Component {
  constructor(props) {
    super(props)
    this.timeout = 0
  }

  beginSearch(query) {
    this.props.setFilterQuery(query)

    if (query === "") {
      this.props.resetFilters()
    } else {
      if (this.timeout) clearTimeout(this.timeout);

      this.timeout = setTimeout(() => {
        this.props.filterCollection()
      }, 200);
    }
  }

  render() {
    return (
      <div className="columns">
        <div className="column is-8 is-offset-2">
          <nav className="level">
            <div className="level-left">
              <span className="viewing">Viewing {this.props.albumsN} albums </span> <a href="#stats">Go to Stats</a>
            </div>
            <div className="level-right">
              <div className="level-item">
                <div className="control">
                  <input className="input" placeholder="Filter Collection..." type="text"
                    onChange={e => this.beginSearch(e.target.value)}
                    value={this.props.filter} />
                </div>
              </div>
              <div className="level-item">
                <div className="field">
                  <div className="control">
                    <div className="select">
                      <select value={this.props.sort} onChange={(e) => this.props.setSort(e.target.value)}>
                        <option value="SORT_ADDN">Added - Newest</option>
                        <option value="SORT_ADDO">Added - Oldest</option>
                        <option value="SORT_RUNTIMES">Runtime - Shortest</option>
                        <option value="SORT_RUNTIMEL">Runtime - Longest</option>
                        <option value="SORT_LISTENN">Listen - Newest</option>
                        <option value="SORT_LISTENO">Listen - Oldest</option>
                        <option value="SORT_REC">Recommended</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  filter: state.collection.get('filter'),
  sort: state.collection.get('sort')
});

const mapDispatchToProps = dispatch => ({
  setFilterQuery: (q) => dispatch(setFilterQuery(q)),
  filterCollection: () => {
    dispatch(filterCollection())
    dispatch(sortSIDs())
  },
  resetFilters: () => dispatch(resetFilters()),
  setSort: (s) => {
    dispatch(setSort(s))
    dispatch(sortSIDs())
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Filter)
