import React, { Component } from 'react'
import { connect } from 'react-redux'

import { postComparison, shiftQueue } from '../actions/collection'

class Comparison extends Component {

  render() {

    const { albums, queue, iter, maxIters, postComparison, shift } = this.props

    const next = queue.first()

    const sid1 = next.get('sid1')
    const sid2 = next.get('sid2')
    const cat = next.get('category')
    const question = next.get('question')

    const album1 = albums.get(sid1)
    const album2 = albums.get(sid2)

    const gap = Math.abs(album1.get("score_" + cat) - album2.get("score_" + cat))*75

    const progress = (iter % maxIters + 1) / maxIters * 100

    return (
      <div className="columns comparisons">
        <div className="column is-2 is-offset-2 has-text-centered">
          <div className="image comp-art">
            <img src={album1.get("art")} onClick={() => postComparison(sid1, sid2, cat, queue)} alt="Album #1"/>
          </div>
          <p className="is-size-5">
            {album1.get("album")}
          </p>
          <p className="is-size-6">
            {album1.get("artist")}
          </p>
          <p className="is-size-6">
            {album1.get("year")}
          </p>
        </div>
        <div className="column is-4 has-text-centered">
          <div className="comp-progress" style={{"width": progress + "%"}}></div>
          <h5 className="is-size-5">{question}</h5>
          <div className="skip-btn button" onClick={() => shift(queue)}>Skip</div>
          <div className="comp-gap" style={{"width": gap + "%"}}></div>
        </div>
        <div className="column is-2 has-text-centered">
          <div className="image comp-art">
            <img src={album2.get("art")} onClick={() => postComparison(sid2, sid1, cat, queue)} alt="Album #2"/>
          </div>
          <p className="is-size-5">
            {album2.get("album")}
          </p>
          <p className="is-size-6">
            {album2.get("artist")}
          </p>
          <p className="is-size-6">
            {album2.get("year")}
          </p>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  albums: state.collection.getIn(['albums', 'bySID']),
  queue: state.collection.getIn(['comparisonQueue', 'queue']),
  iter: state.collection.getIn(['comparisonQueue', 'iter']),
  maxIters: state.collection.getIn(['comparisonQueue', 'maxIters']),
  comp: state.collection.get('comparisonQueue'),
});

const mapDispatchToProps = dispatch => ({
  postComparison: (sid1, sid2, category, queue) => {
    dispatch(postComparison(sid1, sid2, category))
    dispatch(shiftQueue(queue))
  },
  shift: (queue) => dispatch(shiftQueue(queue)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Comparison)
