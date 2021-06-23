import React from "react";
import SkillsInput from "./../utils/signupbutton/Tagify/SkillsInput";
import AssignedTo from "./AssignedTo";
const RoleEditView = (props) => {
  // if (props.skillDetails === undefined) return null;
  const { onChange } = props;
  const renderTask = (props, val, idx) => {
    return (
      <div className="form-row mt-3" key={val.index}>
        <div className="form-group col-md-2 offset-1">
          <label>
            <big>Role Title</big>
          </label>
          <div>{props.roleDetails[idx].roleName}</div>
        </div>
        <div className="form-group col-md-2 offset-1">
          <label>
            <big>Role Skills</big>
          </label>
          <div>{props.roleDetails[idx].roleSkills.join(", ")}</div>
        </div>
        <div className="form-group col-md-3 offset-1">
          <label>
            <big>Assigned To</big>
          </label>
          <div>
            {val.assignedTo ? (
              <AssignedTo id={props.roleDetails[idx].assignedTo} />
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    );
  };
  const renderInputTask = (props, val, idx) => {
    return (
      <div className="form-row mt-3" key={val.index}>
        <div className="form-group col-md-4 offset-1">
          <label>
            <big>Role Title</big>
          </label>
          <input
            type="text"
            className="form-control required"
            // rolename="roleName"
            idx={idx}
            onChange={onChange("roleName")}
            value={props.roleDetails[idx].roleName}
          />
        </div>
        {/*<div className="form-row" key={val.index}>*/}
        <div className="form-group col-md-5">
          <SkillsInput
            label={<big>Role Skills</big>}
            setSkills={(e) => {
              props.roleDetails[idx].roleSkills = e;
            }}
            value={props.roleDetails[idx].roleSkills}
          />
        </div>
        {/*</div>*/}
        <div className="form-group col-md-2 mt-4">
          <button
            className="btn btn-danger"
            onClick={() => props.delete(props.roleDetails[idx])}
          >
            <i className="fa fa-minus" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  };
  return props.roleDetails.map((val, idx) => {
    let roleName = `roleName-${idx}`;
    let roleSkills = `roleSkills-${idx}`;

    return (
      <>
        {val.assignedTo
          ? renderTask(props, val, idx)
          : renderInputTask(props, val, idx)}
      </>
    );
  });
};

export default RoleEditView;
