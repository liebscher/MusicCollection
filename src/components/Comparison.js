import React, { Component } from 'react'
import { connect } from 'react-redux'

import { postComparison, fetchComparison } from '../actions/collection'

class Comparison extends Component {

  render() {

    const { albums, comparison, postComparison, fetchNewComparison } = this.props
    const bySID = albums.get('bySID')
    const iter = comparison.get('iter')

    const sid1 = comparison.get('sid1')
    const sid2 = comparison.get('sid2')
    const cat = comparison.get('category')

    const album1 = bySID.get(sid1)
    const album2 = bySID.get(sid2)

    const question = comparison.get('question')

    return (
      <div className="columns">
        <div className="column is-2 is-offset-2 has-text-centered">
          <div className="image grow-art-large">
            <img src={album1.get("art")} onClick={() => postComparison(bySID, sid1, sid2, cat)} alt="Album #1"/>
          </div>
          <p className="is-size-5">
            {album1.get("album")}
          </p>
          <p>
            {album1.get("artist")}
          </p>
          <p>
            {album1.get("year")}
          </p>
        </div>
        <div className="column is-4 has-text-centered">
          <h5 className="is-size-5">{question}</h5>
          <div className="skip-btn button" onClick={() => fetchNewComparison(bySID, iter)}>Skip</div>
        </div>
        <div className="column is-2 has-text-centered">
          <div className="image grow-art-large">
            <img src={album2.get("art")} onClick={() => postComparison(bySID, sid2, sid1, cat)} alt="Album #2"/>
          </div>
          <p className="is-size-5">
            {album2.get("album")}
          </p>
          <p>
            {album2.get("artist")}
          </p>
          <p>
            {album2.get("year")}
          </p>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  albums: state.collection.get('albums'),
  comparison: state.collection.get('comparison'),
});

const mapDispatchToProps = dispatch => ({
  fetchNewComparison: (albums, iter) => dispatch(fetchComparison(albums, iter)),
  postComparison: (albums, sid1, sid2, category) => dispatch(postComparison(sid1, sid2, category))
})

export default connect(mapStateToProps, mapDispatchToProps)(Comparison)
