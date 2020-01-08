import React, { createContext, useContext, useReducer } from 'react';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash.clonedeep';

const StoreContext = createContext();
const initialState = {
  menuOpen: false,
};


const actions = {
  setMenuOpen(state, payload) { state.menuOpen = payload; },
};

// Reducer function looks through Vuex-style object of action functions, each of which mutates a
// passed state object directly
const reducer = (state, action) => {
  const func = actions[action.type];
  if (func) {
    const state2 = cloneDeep(state);
    func(state2, action.payload);
    return state2;
  }
  throw new Error(`Action ${action?.type} not defined`);
};


// Provider wrapper component

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return React.createElement(
    StoreContext.Provider,
    { value: { state, dispatch } },
    children,
  );
}
StoreProvider.propTypes = { children: PropTypes.node.isRequired };


// Easy hook to get access to this store

export const useStore = () => useContext(StoreContext);
