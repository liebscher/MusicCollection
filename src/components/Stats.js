import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as consts from '../constants/collection'

import { makeWidthFlexible, XYPlot, XAxis, VerticalBarSeries, HorizontalBarSeries } from 'react-vis'

const FlexibleXYPlot = makeWidthFlexible(XYPlot)

const VarianceComponent = ({album, artist, year, variance}) => (
  <p>
    {album} – {artist} ({year}): {variance.toFixed(2)}
  </p>
)

class Stats extends Component {

  bin(data, bins=10) {
    let min = Math.min(...data)
    let max = Math.max(...data)
    let counts = []
    if (typeof(bins) === "number") {
      const step = (max-min) / bins
      min = min - step*0.5
      max = max + step*0.5
      for (let i = min; i < max; i += step) {
        counts.push({x: i, y: data.reduce((a,v) => a + (v >= i && v < i + step), 0)})
      }
    } else {
      for (let i = 0; i < bins.length-1; i++) {
        counts.push({x: bins[i], y: data.reduce((a,v) => a + (v >= bins[i] && v < bins[i+1] ), 0)})
      }
    }

    return counts

  }

  render() {
    const { albums, comparisons } = this.props

    const runtimes = albums.get('bySID').map(x => x.get('runtime') / (1000 * 60)).valueSeq().toJS()
    const releases = albums.get('bySID').map(x => x.get('year')).valueSeq().toJS().map(x => parseInt(x))
    let genres = albums.get('bySID').map(x => x.get('genres')).valueSeq().flatten()

    const runtimesBinned = this.bin(runtimes)
    let releasesBinned = this.bin(releases, [1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020, 2030])
    releasesBinned = releasesBinned.map(x => {
      x['x'] = x['x'] < 2000 ? "'".concat(x['x'] - 1900) : "'".concat(x['x'] - 2000)
      if (x['x'].length === 2) x['x'] = x['x'].concat('0')
      return x
    })

    genres = genres.groupBy(elem => elem).map(arr => {
      return arr.size
    }).sort().reverse()

    genres = genres.take(10).map((v,k) => ({"x": k, "y": v})).valueSeq().toJS()

    const sds = albums.get('bySID').map(x => {
      let n = consts.CATEGORIES.length
      let mean = consts.CATEGORIES.map(c => x.get('score_' + c)).reduce((a, v) => a + v, 0) / n

      return Math.sqrt(consts.CATEGORIES.map(c => Math.pow(x.get('score_' + c) - mean, 2)).reduce((a, v) => a + v, 0) / (n - 1))
    }).sort().reverse()

    return (
      <div className="columns">
        <div className="column is-8 is-offset-2" id="stats">
          <h3 className="title is-3">Stats</h3>
          <div className="is-pulled-right">
            <a href="#header">Back to Top</a>
          </div>
          <h5 className="subtitle is-5">Music Collection by the Numbers</h5>
          <hr />
          <br />
          <div className="tile is-ancestor">
            <div className="tile is-parent is-vertical">
              <div className="tile is-parent">
                <div className="tile is-child box">
                  <p>
                    {albums.get('allSIDs').size} total albums
                  </p>
                </div>
              </div>
              <div className="tile is-parent">
                <div className="tile is-child box">
                  <p>
                    {comparisons.count()} total comparisons
                  </p>
                  <p>
                    {albums.get('bySID').reduce((R, V, K) => {
                      if (V.get('history').count() < consts.MIN_LISTENS) {
                        return R + 1
                      }
                      return R
                    }, 0)} albums with less than {consts.MIN_LISTENS} listens
                  </p>
                </div>
              </div>
              <div className="tile is-parent">
                <div className="tile is-child box">
                  <h5 className="is-size-5">Top Genres</h5>
                  <FlexibleXYPlot height={300} xType="ordinal">
                    <VerticalBarSeries
                      data={genres} />
                    <XAxis tickLabelAngle={90} />
                  </FlexibleXYPlot>
                </div>
              </div>
              <div className="tile is-parent">
                <div className="tile is-parent">
                  <div className="tile is-child box">
                    <span><span className="is-size-5">Runtimes</span> <span className="is-size-6">(in Minutes)</span></span>
                    <FlexibleXYPlot height={200}>
                      <VerticalBarSeries data={runtimesBinned} />
                      <XAxis />
                    </FlexibleXYPlot>
                  </div>
                </div>
                <div className="tile is-parent">
                  <div className="tile is-child box">
                    <h5 className="is-size-5">Release Years</h5>
                    <FlexibleXYPlot height={200} xType="ordinal">
                      <VerticalBarSeries data={releasesBinned} />
                      <XAxis />
                    </FlexibleXYPlot>
                  </div>
                </div>
              </div>
              <div className="tile is-parent">
                <div className="tile is-child box">
                  <h5 className="is-size-5">Most Controversial Albums</h5>
                  {sds.take(3).map((v,k) =>
                    <VarianceComponent
                      album={albums.getIn(['bySID', k, 'album'])}
                      artist={albums.getIn(['bySID', k, 'artist'])}
                      year={albums.getIn(['bySID', k, 'year'])}
                      variance={v} />
                  ).valueSeq()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  albums: state.collection.get('albums'),
  comparisons: state.collection.get('comparisons'),
});

export default connect(mapStateToProps)(Stats)
