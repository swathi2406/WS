import { devToolsEnhancer } from "redux-devtools-extension";
import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import reducer from "./reducer";
export default function () {
  let store = configureStore({
    reducer,
    middleware: [...getDefaultMiddleware()],
  });
  console.log("store:", store);
  return store;
}
