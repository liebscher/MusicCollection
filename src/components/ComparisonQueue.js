import React, { Component } from 'react';
import { connect } from 'react-redux'
import '../App.css';

import { resetQueue, loadScores } from '../actions/collection'

import Comparison from './Comparison'

const Container = ({content}) => (
  <div className="section">
    {content}
  </div>
)

const albumStyle = {margin: "auto", "marginTop": "1em"}
const questStyle = {margin: "auto", "marginTop": "3em"}
const LoadingComparison = () => (
  <div className="columns">
    <div className="column is-2 is-offset-2 has-text-centered">
      <div className="loading-image"></div>
      <p className="is-size-5"><span className="loader" style={albumStyle}></span></p>
    </div>
    <div className="column is-4 has-text-centered">
      <h5 className="is-size-5"><span className="loader is-size-3" style={questStyle}></span></h5>
    </div>
    <div className="column is-2 has-text-centered">
      <div className="loading-image"></div>
      <p className="is-size-5"><span className="loader" style={albumStyle}></span></p>
    </div>
  </div>
)

class ComparisonContainer extends Component {

  shouldResetQueue(isScored, queue) {
    return isScored && queue.count() === 0
  }

  shouldReloadScores(iter, maxIters, scored) {
    let mod = iter % maxIters
    return iter !== 0 &&
            mod === 0 &&
            scored
  }

  render() {
    const { isScored, albums, comparisonIsLoading, queue, comparisonQueue } = this.props

    // if there are scores but the queue is empty

    if (this.shouldResetQueue(isScored, queue)) {
      this.props.dispatch(resetQueue(albums))
    }

    // if there are scores, and iter N % 6 == 0, reload scores

    if (this.shouldReloadScores(comparisonQueue.get('iter'), comparisonQueue.get('maxIters'), isScored)) {
      console.log("LOAD");
      this.props.dispatch(loadScores())
    }

    return (
      <Container content={comparisonIsLoading ? <LoadingComparison /> : <Comparison />} />
    )
  }
}

const mapStateToProps = state => {
  return {
    isScored: state.collection.getIn(['albums', 'isScored']),
    albums: state.collection.getIn(['albums', 'bySID']),
    comparisonIsLoading: state.collection.getIn(['comparisonQueue', 'isLoading']),
    queue: state.collection.getIn(['comparisonQueue', 'queue']),
    comparisonQueue: state.collection.get('comparisonQueue'),
  }
};

export default connect(mapStateToProps)(ComparisonContainer);
