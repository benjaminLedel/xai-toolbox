import { createStore } from 'redux'

export const GENERAL_SET_CURRENT_USER = "GENERAL_SET_CURRENT_USER"

const initialState = {
  user: null,
}

const reducer = (state = initialState, action) => {
  return state
}

const store = createStore(reducer)

export default store