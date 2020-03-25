import { List, Map, fromJS } from 'immutable';

import * as consts from '../constants/search'

const searchInitialState = Map({
  query: '',
  results: List(),
})

const search = (state = searchInitialState, action) => {
  switch (action.type) {
    case consts.SET_RESULTS:
      return state.set('results', fromJS(action.results))
    case consts.CLEAR_RESULTS:
      return state.set('results', List([]))
    case consts.SET_QUERY:
      return state.set('query', action.query)
    case consts.CLEAR_QUERY:
      return state.set('query', '')
    default:
      return state
  }
}
export default search
