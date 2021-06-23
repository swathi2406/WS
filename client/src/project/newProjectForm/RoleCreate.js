import React from "react";
import SkillsInput from "../../utils/signupbutton/Tagify/SkillsInput";

const RoleList = (props) => {
  // if (props.skillDetails === undefined) return null;
  const { onChange } = props;
  let { dontShow } = props;
  if (dontShow === undefined) {
    dontShow = false;
  }
  return props.roleDetails.map((val, idx) => {
    let roleName = `roleName-${idx}`;
    let roleSkills = `roleSkills-${idx}`;
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
            id={roleName}
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
          {dontShow === false ? (
            idx === 0 ? (
              <button
                onClick={() => props.add()}
                type="button"
                className="btn btn-primary text-center"
              >
                <i className="fa fa-plus" aria-hidden="true" />
              </button>
            ) : (
              <button
                className="btn btn-danger"
                onClick={() => props.delete(val)}
              >
                <i className="fa fa-minus" aria-hidden="true" />
              </button>
            )
          ) : (
            <></>
          )}
        </div>
      </div>
    );
  });
};

export default RoleList;
