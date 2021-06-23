import React, { Component } from "react";
import MainRouter from "./MainRouter";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import configureStore from "./store/store";
const store = configureStore();
class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <MainRouter />
        </BrowserRouter>
      </Provider>
    );
  }
}

export default App;
