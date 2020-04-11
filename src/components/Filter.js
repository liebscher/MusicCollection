import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons'


import { setSort, setSortAsc, sortSIDs, setFilterQuery,
         filterCollection, resetFilters } from '../actions/collection'

import { SORTS } from '../constants/collection'

const UP = () => (<FontAwesomeIcon icon={faChevronUp} className="sort-default"/>)
const DOWN = () => (<FontAwesomeIcon icon={faChevronDown} className="sort-default"/>)

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
              <span className="viewing">Viewing {this.props.albumsN} albums</span> <a href="#stats">Go to Stats</a>
            </div>

            <div className="level-right">
              <div className="level-item">
                <input className="input filter-input" placeholder="Filter Collection..." type="text"
                  onChange={e => this.beginSearch(e.target.value)}
                  value={this.props.filter} />
              </div>
              <div className="level-item">
                <div className="select">
                  <select value={this.props.sort} onChange={e => this.props.setSort(e.target.value)}>
                    <option value={SORTS.ADD}>Added</option>
                    <option value={SORTS.RUNTIME}>Runtime</option>
                    <option value={SORTS.LISTEN}>Listen</option>
                    <option value={SORTS.RECOMMENDED}>Recommended</option>
                    <option value={SORTS.RANK}>Rank</option>
                  </select>
                </div>
              </div>
              <div className="level-item">
                <span onClick={() => this.props.setSortAsc()}>{this.props.sort_asc ? (<UP />) : (<DOWN />)}</span>
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
  sort: state.collection.get('sort'),
  sort_asc: state.collection.get('sort_asc'),
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
  setSortAsc: () => {
    dispatch(setSortAsc())
    dispatch(sortSIDs())
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Filter)
