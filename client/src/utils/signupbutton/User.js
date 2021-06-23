import React, { Component } from "react";
import GoogleLogin from "react-google-login";
class User extends Component {
  state = {};
  back = (e) => {
    e.preventDefault();
    this.props.prevStep();
  };
  submit = (e) => {
    e.preventDefault();
    this.props.submitStep();
  };
  render() {
    const { values, inputChange, handleGoogleChange } = this.props;
    const responseSuccessGoogle = (response) => {
      let googleObj = {
        username: response.profileObj.googleId.toString(),
        email: response.profileObj.email,
        password: response.profileObj.googleId.toString(),
      };
      handleGoogleChange(googleObj);
    };

    const responseErrorGoogle = (response) => {
      console.log("Error");
    };

    return (
      <>
        <div className="form-container p-5">
          <h1 className="mb-5">User Details</h1>
          <div className="form-group">
            <label for="Username">Username</label>
            <input
              name="Username"
              value={values.username}
              onChange={inputChange("username")}
              className="form-control"
            ></input>
          </div>
          <div className="form-group">
            <label for="Email">Email</label>
            <input
              name="Email"
              value={values.email}
              onChange={inputChange("email")}
              className="form-control"
            ></input>
          </div>
          <div className="form-group">
            <label for="Password">Password</label>
            <input
              name="Password"
              value={values.password}
              onChange={inputChange("password")}
              className="form-control"
              type="password"
            ></input>
          </div>
          <div className="row">
            <div className="col-sm-2">
              <div className=" text-left ">
                <button className="btn btn-primary" onClick={this.back}>
                  Back
                </button>
              </div>
            </div>
            <div className="col-sm-2 offset-7">
              <div className="text-right">
                <button className="btn btn-primary" onClick={this.submit}>
                  Submit
                </button>
              </div>
            </div>
            <div className="col-md-10 offset-md-1 text-center pt-3">
              Or would you like to Sign up with your Google Account?
              <div className="mt-3">
              <GoogleLogin
                clientId="11029788971-15i4cq1rn9lijdh2k685to3ri1vtb682.apps.googleusercontent.com"
                buttonText="Login"
                onSuccess={responseSuccessGoogle}
                onFailure={responseErrorGoogle}
                cookiePolicy={"single_host_origin"}
              />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default User;
