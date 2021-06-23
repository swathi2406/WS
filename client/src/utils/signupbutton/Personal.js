import React, { Component } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SkillsInput from "./Tagify/SkillsInput";
// import DatePicker from "react-rainbow-components";
import { Button } from "react-bootstrap";
class Personal extends Component {
  state = {
    teacherState: false,
  };
  continue = (e) => {
    e.preventDefault();
    this.props.nextStep();
  };

  render() {
    const { values, inputChange, inputTeacherChange } = this.props;
    const { teacherState } = this.state;
    return (
      <div className="form-container p-5">
        <div className="row">
          <div className="col">
            <h1 className="mb-5">Personal Details</h1>
            <div className="col">
              <label>Are you a Teacher?</label>
              <Button
                name="Teacher"
                value={values.teacher}
                onClick={() => inputTeacherChange()}
              >
                {values.teacher === true ? <>Yes</> : <>No</>}
              </Button>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <div className="form-group">
              <label>Name</label>
              <input
                name="Name"
                value={values.name}
                onChange={inputChange("name")}
                className="form-control"
              ></input>
            </div>
          </div>
          <div className="col">
            <div className="form-group">
              <label>Your Birthday?</label>
              {/* <DatePicker value={values.dob} onChange={inputChange("dob")} /> */}
              <div>
                <DatePicker
                  selected={values.dob}
                  onChange={inputChange("dob")}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Tell the community about yourself</label>
          <input
            name="Bio"
            value={values.bio}
            onChange={inputChange("bio")}
            className="form-control"
          ></input>
        </div>
        <div className="form-group">
          <label>Where are you From?</label>
          <input
            name="Location"
            value={values.location}
            onChange={inputChange("location")}
            className="form-control"
          ></input>
        </div>
        <div className="form-group">
          <SkillsInput
            setSkills={inputChange("skills")}
            label={"What are you good at?"}
          />
        </div>
        <div className="row pt-5">
          <div className=" text-right">
            <button className="btn btn-primary" onClick={this.continue}>
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Personal;
