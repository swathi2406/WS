import React, { Component } from "react";
import SkillsInput from "./../utils/signupbutton/Tagify/SkillsInput";
import { updateProject } from "./apiProject";

import RoleEditView from "./RoleEditView";
export default class EditProject extends Component {
  constructor() {
    super();
    this.state = {
      title: "",
      description: "",
      skills: [],
      error: "",
      team: [],
      tasks: [],
      roleDetails: [],
      open: false,
    };
  }

  componentDidMount() {
    let { project } = this.props.location.state;
    this.setState({
      title: project.title,
      description: project.description,
      skills: project.skills,
      roleDetails: project.roles,
      leader: project.leader,
      id: project._id,
      team: project.team,
      tasks: project.tasks,
    });
    let str = "";
    project.skills.map((skill) => {
      str += skill;
      str += ",";
    });
    str = str.slice(0, -1);
    this.setState({ skillstr: str });
  }

  handleChange = (proj) => (event) => {
    console.log(proj);
    console.log(event.target.value);
    this.setState({ error: "" });
    this.setState({ [proj]: event.target.value });
  };
  handleSkills = (newSkills) => {
    this.setState({ skills: newSkills });
  };
  handleRoleChange = (name) => (e) => {
    let id = parseInt(e.target.attributes.idx.value);
    const roleDetails = this.state.roleDetails;
    roleDetails[id][name] = e.target.value;
    this.setState({ roleDetails });
  };

  addNewRow = (e) => {
    this.setState((prevState) => ({
      roleDetails: [
        ...prevState.roleDetails,
        {
          roleName: "",
          roleSkills: [],
          requestBy: [],
        },
      ],
    }));
  };

  deteteRow = (index) => {
    this.setState({
      roleDetails: this.state.roleDetails.filter(
        (s, sindex) => index !== sindex
      ),
    });
  };

  clickOnDelete(record) {
    this.setState({
      roleDetails: this.state.roleDetails.filter((r) => r !== record),
    });
  }

  clickSubmit = (event) => {
    event.preventDefault();
    this.setState({ loading: true });
    let { title, description, skills, roleDetails, team, tasks } = this.state;
    let project = {
      title,
      description,
      skills,
      roleDetails,
      team,
      tasks,
    };
    updateProject(project, this.state.id).then((val) => {
      console.log(val);
    });
  };
  render() {
    if (!this.props.location.state) {
      return null;
    }

    return (
      <div className="mt-5">
        <h1>Edit Project</h1>
        <p className="text-muted">
          Change the desired info and click save at the end of the form.
        </p>
        <form className="mt-5">
          <div className="form-group">
            <div className="row">
              <div className="col-sm-10 offset-1">
                <label>
                  <big>Title of your Project</big>
                </label>
                <input
                  className="form-control"
                  value={this.state.title}
                  type="text"
                  onChange={this.handleChange("title")}
                />
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-sm-10 offset-1">
                <label>
                  <big>Description of the Project</big>
                </label>
                <input
                  className="form-control"
                  type="text"
                  value={this.state.description}
                  onChange={this.handleChange("description")}
                />
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-sm-10 offset-1">
                <SkillsInput
                  label={<big>Skills</big>}
                  setSkills={this.handleSkills}
                  value={this.state.skillstr}
                />
              </div>
            </div>
            {/* <div className="row mt-3">
              <div className="col-sm-10 offset-1">
                <big>Roles</big>
              </div>
            </div>
            {this.state.roleDetails.map((role) => {
              <div className="row mt-3">
                <div className="col-sm-10 offset-1">{role.roleName}</div>
              </div>;
            })} */}
            {/* <table className="table ">
              <thead>
                <tr key={"title"}>
                  <th key={"rolename"}>Role Name</th>
                  <th key={"skills"}>Skills Required</th>
                </tr>
                {this.state.roleDetails.map((role) => (
                  <tr key={role._id.toString()}>
                    <td key={role._id.toString() + role.roleName.toString()}>
                      {role.roleName}
                    </td>
                    <td key={role._id.toString() + role.roleSkills.toString()}>
                      {role.roleSkills + ","}
                    </td>
                  </tr>
                ))}
              </thead>
            </table> */}
            <RoleEditView
              delete={this.clickOnDelete.bind(this)}
              roleDetails={this.state.roleDetails}
              onChange={this.handleRoleChange}
            />

            <div className="d-flex justify-content-center">
              <button
                onClick={() => this.addNewRow()}
                type="button"
                className="btn btn-primary text-center "
              >
                <i className="fa fa-plus" aria-hidden="true" />
              </button>
            </div>
            <div className="row">
              <button
                className="btn btn-raised btn-primary mx-auto mt-3 mb-2 col-sm-3"
                onClick={this.clickSubmit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}
