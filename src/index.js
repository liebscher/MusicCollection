import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
// import * as serviceWorker from './serviceWorker';

// import { render } from 'react-dom'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import rootReducer from './reducers'

import { fetchCollectionIfNecessary } from './actions/collection'

const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);

store.dispatch(fetchCollectionIfNecessary())

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
