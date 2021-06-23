import React, { Component } from "react";
import { Redirect, Link } from "react-router-dom";
import { signin, authenticate, isAuthenticated } from "../auth/index";
import "../styles.css";
import ModalButton from "./../utils/signupbutton/ModalButton";
import { GoogleLogin } from "react-google-login";
import socket from "./../utils/Socket";
import LoginImg from "../images/login.png";
import { registerUser } from "./../utils/Socket";
class Signin extends Component {
  constructor() {
    super();
    this.state = {
      email: "",
      password: "",
      error: "",
      redirectToReferer: false,
      loading: false,
    };
  }
  componentDidMount() {
    localStorage.removeItem("jwt");
    // browser.cookies.remove({
    //   name: "t",
    // });
    // window.location.reload();
  }
  loginGoogle = (e) => {
    const user = {
      email: e.profileObj.email.toString(),
      password: e.profileObj.googleId.toString(),
    };
    signin(user)
      .then((data) => {
        console.log("HI FROM MAIN ROUTE");
        if (data.error) {
          this.setState({ error: data.error, loading: false });
        } else {
          authenticate(data, () => {
            this.setState({ redirectToReferer: true });
          });
        }
      })
      .then(() => {
        // const userId = isAuthenticated().user._id;
        // // socket.emit("login", {
        // //   userId,
        // // });
        // registerUser(userId);
      });
  };
  loginGoogleFailed = (e) => {
    console.log("Failed event");
  };
  handleChange = (name) => (event) => {
    this.setState({ error: "" });
    this.setState({ [name]: event.target.value });
  };

  clickSubmit = (event) => {
    event.preventDefault();
    this.setState({ loading: true });
    const { email, password } = this.state;
    const user = {
      email,
      password,
    };
    // console.log(user);
    signin(user)
      .then((data) => {
        console.log("HI FROM MAIN ROUTE");
        console.log(data);
        if (data.error) {
          this.setState({ error: data.error, loading: false });
        } else {
          // authenticate
          authenticate(data, () => {
            this.setState({ redirectToReferer: true });
          });
        }
      })
      .then(() => {
        if (isAuthenticated()) {
          // const userId = isAuthenticated().user._id;
          // // socket.emit("login", {
          // //   userId,
          // // });
          // registerUser(userId);
        }
      });
  };

  render() {
    const { email, password, error, redirectToReferer, loading } = this.state;

    if (redirectToReferer) {
      return <Redirect to="/home" />;
    }

    return (
      <div className=" h-100 signin-wrapper">
        <div className="row signin-content justify-content-center align-items-center">
          <div className="login-aside d-flex flex-column flex-row-auto">
            <img src={LoginImg} />
          </div>
          <div className="login-content flex-row-fluid d-flex flex-column justify-content-center position-relative overflow-hidden p-17 mx-auto">
            <div className="d-flex flex-column-fluid flex-center">
              <div className="login-form login-signin">
                <form
                  className="form fv-plugins-bootstrap fv-plugins-framework"
                  id="kt_login_signin_form"
                >
                  <div className="pb-13 pt-lg-0 pt-5">
                    <h3 className="font-weight-bolder text-dark font-size-h4 font-size-h1-lg">
                      Welcome to Workshake
                    </h3>
                    <span className="text-muted font-weight-bold font-size-h4">
                      New Here? <ModalButton />
                    </span>
                  </div>
                  <div
                    className="alert alert-danger mb-5 col-sm-8 offset-2"
                    style={{ display: error ? "" : "none" }}
                  >
                    {error}
                  </div>

                  {loading ? (
                    <div className="jumbotron text-center">
                      <h2>Loading...</h2>
                    </div>
                  ) : (
                    ""
                  )}
                  <div className="form-group fv-plugins-icon-container">
                    <label className="font-size-h6 font-weight-bolder text-dark">
                      Email
                    </label>
                    <input
                      className="login-control form-control form-control-solid h-auto py-6 px-6 rounded-lg"
                      onChange={this.handleChange("email")}
                      value={email}
                      type="email"
                    />
                  </div>
                  <div className="form-group fv-plugins-icon-container pt-5">
                    <div className="d-flex justify-content-between mt-n5">
                      <label className="font-size-h6 font-weight-bolder text-dark">
                        Password
                      </label>
                      <Link
                        to="#"
                        className="text-primary font-size-h6 font-weight-bolder text-hover-primary"
                        id="kt_login_forgot"
                      >
                        Forgot Password
                      </Link>
                    </div>
                    <input
                      className="login-control form-control form-control-solid h-auto py-6 px-6 rounded-lg"
                      onChange={this.handleChange("password")}
                      value={password}
                      type="password"
                    />
                  </div>
                  <div className="pb-lg-0 pb-5">
                    <button
                      type="button"
                      id="kt_login_signin_submit"
                      onClick={this.clickSubmit}
                      className="btn btn-primary font-weight-bolder font-size-h6 px-8 py-4 my-3 mr-3"
                    >
                      Sign In
                    </button>
                    <GoogleLogin
                      clientId="11029788971-15i4cq1rn9lijdh2k685to3ri1vtb682.apps.googleusercontent.com"
                      buttonText="Sign in with Google"
                      onSuccess={this.loginGoogle}
                      onFailure={this.loginGoogleFailed}
                      cookiePolicy={"single_host_origin"}
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Signin;
