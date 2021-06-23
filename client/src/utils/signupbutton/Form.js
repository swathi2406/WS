import React, { Component } from "react";
import User from "./User";
import Personal from "./Personal";
import Social from "./Social";
import { Redirect } from "react-router-dom";
import { signup, signin, authenticate } from "../../auth/index";

class Form extends Component {
  state = {
    step: 1,
    name: "",
    dob: new Date(),
    location: "",
    bio: "",
    website: "",
    github: "",
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    youtube: "",
    username: "",
    email: "",
    password: "",
    error: "",
    open: false,
    redirectToReferer: false,
    skills: [],
    teacher: false,
  };

  nextStep = () => {
    const { step } = this.state;
    this.setState({ step: step + 1 });
  };

  prevStep = () => {
    const { step } = this.state;
    this.setState({ step: step - 1 });
  };

  inputChange = (input) => (e) => {
    this.setState({ error: "" });
    this.setState({
      [input]: e.target !== undefined ? e.target.value : e,
    });
  };

  handleGoogleChange = (googleObj) => {
    this.setState({
      email: googleObj.email,
      password: googleObj.password,
      username: googleObj.username,
    });
    this.submitStep();
  };
  submitStep = () => {
    let user = this.state;
    signup(user).then((data) => {
      if (data.error) this.setState({ error: data.error });
      else {
        this.setState({
          error: "",
          name: "",
          email: "",
          password: "",
          open: true,
        });
        signin(user).then((data) => {
          if (data.error) {
            this.setState({ error: data.error, loading: false });
          } else {
            authenticate(data, () => {
              this.setState({ redirectToReferer: true });
            });
          }
        });
      }
    });
  };
  inputTeacherChange = () => {
    const { teacher } = this.state;
    let newVal = !teacher;
    this.setState({ teacher: newVal });
  };
  render() {
    if (this.state.redirectToReferer) {
      return <Redirect to="/home" />;
    }
    const { step, error, open } = this.state;
    const {
      name,
      bio,
      dob,
      location,
      github,
      facebook,
      instagram,
      linkedin,
      twitter,
      youtube,
      website,
      username,
      email,
      password,
      teacher,
    } = this.state;
    const values = {
      name,
      bio,
      dob,
      location,
      github,
      facebook,
      instagram,
      linkedin,
      twitter,
      youtube,
      website,
      username,
      email,
      password,
      teacher,
    };
    switch (step) {
      case 1:
        return (
          <>
            <div
              className="alert alert-danger"
              style={{ display: error ? "" : "none" }}
            >
              {error}
            </div>

            <div
              className="alert alert-success"
              style={{ display: open ? "" : "none" }}
            >
              New account successfully created! Please Sign In.
            </div>
            <Personal
              values={values}
              inputChange={this.inputChange}
              inputTeacherChange={this.inputTeacherChange}
              nextStep={this.nextStep}
            />
          </>
        );
      case 2:
        return (
          <>
            <div
              className="alert alert-danger"
              style={{ display: error ? "" : "none" }}
            >
              {error}
            </div>

            <div
              className="alert alert-success"
              style={{ display: open ? "" : "none" }}
            >
              New account successfully created! Please Sign In.
            </div>
            <Social
              nextStep={this.nextStep}
              prevStep={this.prevStep}
              inputChange={this.inputChange}
              values={values}
            />
          </>
        );
      case 3:
        return (
          <>
            <div
              className="alert alert-danger"
              style={{ display: error ? "" : "none" }}
            >
              {error}
            </div>

            <div
              className="alert alert-success"
              style={{ display: open ? "" : "none" }}
            >
              New account successfully created! Please Sign In.
            </div>
            <User
              submitStep={this.submitStep}
              prevStep={this.prevStep}
              inputChange={this.inputChange}
              handleGoogleChange={this.handleGoogleChange}
              values={values}
            />
          </>
        );
      default:
        return <></>;
    }
  }
}

export default Form;
