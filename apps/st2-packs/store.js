import _ from 'lodash';

import { createStore, applyMiddleware, compose } from 'redux';

const initialState = {
  collapsed: false,
  tables: {},
  packs: {},
  selected: undefined
};

const reducer = (state = initialState, action) => {
  switch (action.type) {

    case 'REGISTER_FLEX_TABLE': {
      const { tables, collapsed } = state;
      const { title } = action;

      return {
        ...state,
        tables: {
          ...tables,
          [title]: {
            ...tables[title],
            collapsed
          }
        }
      };
    }

    case 'TOGGLE_FLEX_TABLE': {
      const { tables } = state;
      const { title } = action;

      const newTables = {
        ...tables,
        [title]: {
          ...tables[title],
          collapsed: !(tables[title] || state).collapsed
        }
      };

      let { collapsed } = state;

      if (_.some(newTables, item => item.collapsed === newTables[title].collapsed)) {
        collapsed = newTables[title].collapsed;
      }

      return {
        ...state,
        collapsed,
        tables: newTables
      };
    }

    case 'TOGGLE_ALL': {
      let { collapsed, tables } = state;

      collapsed = !collapsed;
      tables = _.mapValues(tables, v => ({ ...v, collapsed }));

      return {
        ...state,
        collapsed,
        tables
      };
    }

    case 'FETCH_INSTALLED_PACKS':

      switch(action.status) {
        case 'success':
          const { packs } = state;
          const installedPacks = {};

          action.payload.forEach(pack => {
            installedPacks[pack.ref] = {
              ...pack,
              installed: true
            };
          });

          return {
            ...state,
            packs: {
              ...installedPacks,
              ...packs
            }
          };
        case 'error':
          return {
            ...state
          };
        default:
          return {
            ...state
          };
      }

    case 'FETCH_PACK_INDEX':

      switch(action.status) {
        case 'success':
          const { packs } = state;

          return {
            ...state,
            packs: {
              ...action.payload,
              ...packs
            }
          };
        case 'error':
          return {
            ...state
          };
        default:
          return {
            ...state
          };
      }

      return {
        ...state
      };

    case 'SELECT_PACK':

      return {
        ...state,
        selected: action.ref
      };

    default:
      return state;
  }
};

const promiseMiddleware = () => next => action => {
  if (!action.promise) {
    return next(action);
  }

  function actionFactory(status, data) {
    const { promise, ...newAction } = action;
    return {
      ...newAction,
      status,
      ...data
    };
  }

  next(actionFactory());
  return action.promise.then(
    payload => next(actionFactory('success', { payload })),
    error => next(actionFactory('error', { error }))
  );
};


const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  reducer,
  composeEnhancers(
    applyMiddleware(
      promiseMiddleware
    )
  )
);

export default store;
