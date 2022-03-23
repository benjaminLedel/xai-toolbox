import { createStore } from 'redux'

const initialState = {
  user: null,
}

const reducer = (state = initialState, action) => {
  return state
}

const store = createStore(reducer)

export default store