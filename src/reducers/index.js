import { combineReducers } from 'redux'
import collection from './collection'
import search from './search'

export default combineReducers({
  collection,
  search,
})
