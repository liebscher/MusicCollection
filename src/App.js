import React, { Component } from 'react';
import { connect } from 'react-redux'
import './App.css';

import SearchBar from './components/SearchBar'
import Filter from './components/Filter'
import Album from './components/Album'
import Comparison from './components/Comparison'
import Stats from './components/Stats'

import {  clearError,
          setSort,
          fetchComparison,
          loadScores } from './actions/collection'

const Container = ({content}) => (
  <div className="section">
    {content}
  </div>
)

const Header = ({clear, error = null}) => (
  <div className="columns header">
    <div className="column is-8 is-offset-2">
      <h2 className="title is-2">
        Music Collection
      </h2>
      <div className={`notification is-warning ${error.isEmpty() ? 'is-hidden' : ''}`}>
        <button className="delete" onClick={() => clear()}></button>
        {error.get(0)}
      </div>
      <SearchBar />
    </div>
  </div>
)

const Albums = ({albums}) => (
  <div className="columns">
    <div className="column is-8 is-offset-2">
      {albums.map(sid => (
        <Album key={sid} sid={sid}/>
      ))}
    </div>
  </div>
)

const albumStyle = {margin: "auto", "marginTop": "1em"}
const imageStyle = {margin: "auto"}
const questStyle = {margin: "auto", "marginTop": "3em"}
const LoadingComparison = () => (
  <div className="columns">
    <div className="column is-2 is-offset-2 has-text-centered">
      <div className="image" style={imageStyle}>
        <img src="https://bulma.io/images/placeholders/256x256.png" alt="loader"/>
      </div>
      <p className="is-size-5"><span className="loader" style={albumStyle}></span></p>
    </div>
    <div className="column is-4 has-text-centered">
      <h5 className="is-size-5"><span className="loader is-size-3" style={questStyle}></span></h5>
    </div>
    <div className="column is-2 has-text-centered">
      <div className="image" style={imageStyle}>
        <img src="https://bulma.io/images/placeholders/256x256.png" alt="loader"/>
      </div>
      <p className="is-size-5"><span className="loader" style={albumStyle}></span></p>
    </div>
  </div>
)

class App extends Component {

  componentDidMount() {
    this.props.dispatch(setSort('SORT_ADDN'))
  }

  shouldFetchComparison(albums, comparison) {
    if (albums.get('allSIDs').isEmpty()) {
      return false
    } else if (!comparison.get('isLoaded')) {
      return true
    } else if (comparison.get('isFetching')) {
      return false
    } else {
      return comparison.get('isInvalid')
    }
  }

  render() {
    const { albums, error, comparison } = this.props;

    if (this.shouldFetchComparison(albums, comparison)) {
      this.props.dispatch(fetchComparison())
      this.props.dispatch(loadScores())
    }

    return (
      <div>
        <Container content={<Header error={error} clear={() => this.props.dispatch(clearError())}/>} />

        <Container content={comparison.get('isLoaded') ? <Comparison /> : <LoadingComparison />} />

        <Container content={<Filter albumsN={albums.get('filteredSIDs').size}/>} />

        <Container content={<Albums albums={albums.get('filteredSIDs')} />} />

        <Container content={<Stats />} />

      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    albums: state.collection.get('albums'),
    error: state.collection.get('error'),
    comparison: state.collection.get('comparison'),
  }
};

export default connect(mapStateToProps)(App);
