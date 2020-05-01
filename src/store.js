import React, { createContext, useContext, useReducer } from 'react';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash/cloneDeep';

const StoreContext = createContext();
const initialState = {
  menuOpen: false,

  dimensions: {
    menuWidth: 380,
  },
};


const actions = {
  setMenuOpen(state, payload) { state.menuOpen = payload; },
};

// Reducer function looks through Vuex-style object of action functions, each of which mutates a
// passed state object directly
const reducer = (state, { type: action, payload }) => {
  const func = actions[action];
  if (func) {
    const state2 = cloneDeep(state);
    func(state2, payload);
    return state2;
  }
  throw new Error(`Action ${action?.type} not defined`);
};


// Provider wrapper component

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  // Nicer dispatch API: dispatch(actionType, payload)
  function dispatch2(type, payload) { return dispatch({ type, payload }); }

  return React.createElement(
    StoreContext.Provider,
    { value: { state, dispatch: dispatch2 } },
    children,
  );
}
StoreProvider.propTypes = { children: PropTypes.node.isRequired };


// Easy hook to get access to this store

export const useStore = () => useContext(StoreContext);
