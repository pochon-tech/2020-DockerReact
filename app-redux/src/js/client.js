import { createStore } from "redux";

const reducer = (state = 0, action) => {
  console.log("reducer has been called.", state);
  switch (action.type) {
    case "INC":
      return state + action.payload
    case "DEC":
      return state - action.payload
  }
  return state;
}
const store = createStore(reducer, 1);

store.subscribe(() => {
  console.log("store changed", store.getState());
})

store.dispatch({ type: "INC", payload: 3 });
store.dispatch({ type: "INC", payload: 4 });
store.dispatch({ type: "DEC", payload: 3 });
