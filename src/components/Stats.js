import React, { Component } from 'react'
import { connect } from 'react-redux'

class Stats extends Component {

  render() {
    const albums = this.props.albums

    return (
      <div className="columns">
        <div className="column is-8 is-offset-2" id="stats">
          <h3 className="title is-3">Stats</h3>
          <h5 className="subtitle is-5">Music Collection by the Numbers</h5>
          <hr />
          <p>
            {albums.get('allSIDs').size} total albums
          </p>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  albums: state.collection.get('albums'),
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(Stats)
