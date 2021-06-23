import React, { Component } from "react";
class Social extends Component {
  state = {};
  continue = (e) => {
    e.preventDefault();
    this.props.nextStep();
  };
  back = (e) => {
    e.preventDefault();
    this.props.prevStep();
  };
  render() {
    const { values, inputChange } = this.props;
    return (
      <>
        <div className="form-container p-5">
          <h1 className="mb-5">Social Details</h1>
          <p className="text-muted">Skip fields you dont wanna fill</p>
          <div className="form-group">
            <label for="Website">Personal Website</label>
            <input
              name="Website"
              value={values.website}
              onChange={inputChange("website")}
              className="form-control"
            ></input>
          </div>
          <div className="row">
            <div className="col">
              <div className="form-group">
                <label for="Github">Github</label>
                <input
                  name="Github"
                  value={values.github}
                  onChange={inputChange("github")}
                  className="form-control"
                ></input>
              </div>
            </div>
            <div className="col">
              <div className="form-group">
                <label for="Youtube">Youtube</label>
                <input
                  name="Youtube"
                  value={values.youtube}
                  onChange={inputChange("youtube")}
                  className="form-control"
                ></input>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <div className="form-group">
                <label for="Twitter">Twitter</label>
                <input
                  name="Twitter"
                  value={values.twitter}
                  onChange={inputChange("twitter")}
                  className="form-control"
                ></input>
              </div>
            </div>
            <div className="col">
              <div className="form-group">
                <label for="Facebook">Facebook</label>
                <input
                  name="Facebook"
                  value={values.facebook}
                  onChange={inputChange("facebook")}
                  className="form-control"
                ></input>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <div className="form-group">
                <label for="LinkedIn">LinkedIn</label>
                <input
                  name="LinkedIn"
                  value={values.linkedin}
                  onChange={inputChange("linkedin")}
                  className="form-control"
                ></input>
              </div>
            </div>
            <div className="col">
              <div className="form-group">
                <label for="Instagram">Instagram</label>
                <input
                  name="Instagram"
                  value={values.instagram}
                  onChange={inputChange("instagram")}
                  className="form-control"
                ></input>
              </div>
            </div>
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
                <button className="btn btn-primary" onClick={this.continue}>
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Social;
