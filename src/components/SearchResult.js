import React, { Component } from 'react'
import { connect } from 'react-redux'

import { postAlbum } from "../actions/collection"

class SearchResult extends Component {

  render() {
    return (
      <div className="media result" onClick={() => this.props.dispatch(postAlbum(this.props.sid))}>
        <figure className="media-left">
          <p className="image is-48x48">
            <img src={this.props.art} alt={this.props.album}/>
          </p>
        </figure>
        <div className="media-content">
          {this.props.album} — {this.props.artist} ({this.props.year})
        </div>
      </div>
    )
  }
}

export default connect()(SearchResult)
