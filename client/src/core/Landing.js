import React from "react";
import { Link, Redirect } from "react-router-dom";

export default function Landing() {
  // let token =
  //   JSON.parse(localStorage.getItem("jwt")).token !== null
  //     ? JSON.parse(localStorage.getItem("jwt")).token
  //     : null;
  // let userId =
  //   JSON.parse(localStorage.getItem("jwt")).user._id !== null
  //     ? JSON.parse(localStorage.getItem("jwt")).user._id
  //     : null;
  // if (token !== null && userId !== null) {
  // return <Redirect to={`/home`} />;
  // }
  if (localStorage.getItem("jwt") !== null) {
    return <Redirect to={`/home`} />;
  }
  return (
    <div className="container">
      <div className="jumbotron">
        <h3>Hello, Welcome to our collaboration portal</h3>
        <h5>Meet, Share, Grow</h5>
        <Link to="/signin" className="btn btn-primary">
          Join our community!
        </Link>
      </div>
    </div>
  );
}
