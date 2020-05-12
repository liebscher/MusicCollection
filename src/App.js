import React, { Component } from 'react';
import { connect } from 'react-redux'
import './App.css';

import SearchBar from './components/SearchBar'
import Filter from './components/Filter'
import Album from './components/Album'
import ComparisonQueue from './components/ComparisonQueue'
import Stats from './components/Stats'

import {  clearError,
          setSort,
          loadScores } from './actions/collection'

const Container = ({content}) => (
  <div className="section">
    {content}
  </div>
)

const Header = ({clear, error = null}) => (
  <div className="columns header">
    <div className="column is-8 is-offset-2">
      <h1 className="title is-1" id="header">
        Music Collection
      </h1>
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
    <div className="column is-8 is-offset-2 albums">
      {albums.map(sid => (
        <Album key={sid} sid={sid}/>
      ))}
    </div>
  </div>
)

class App extends Component {

  componentDidMount() {
    this.props.dispatch(setSort('SORT_ADDN'))
    this.props.dispatch(loadScores())
  }

  render() {
    const { filteredSIDs, error } = this.props;

    return (
      <div>
        <Container content={<Header error={error} clear={() => this.props.dispatch(clearError())}/>} />

        <Container content={<ComparisonQueue />} />

        <Container content={<Filter albumsN={filteredSIDs.count()}/>} />

        <Container content={<Albums albums={filteredSIDs} />} />

        <Container content={<Stats />} />

      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    filteredSIDs: state.collection.getIn(['albums', 'filteredSIDs']),
    error: state.collection.get('error'),
  }
};

export default connect(mapStateToProps)(App);
