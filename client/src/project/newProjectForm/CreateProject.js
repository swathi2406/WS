import React, { Component } from "react";
import RoleList from "./RoleCreate";
import { newAcademicProject, newProject } from "./../apiProject";
import SkillsInput from "./../../utils/signupbutton/Tagify/SkillsInput";
import LiveClock from "react-live-clock";
import dayjs from "dayjs";
import { Badge, Button } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead"; // ES2015
import "react-bootstrap-typeahead/css/Typeahead.css";
class CreateProject extends Component {
  constructor() {
    super();
    this.state = {
      title: "",
      description: "",
      skills: [""],
      error: "",
      roleDetails: [
        {
          index: Math.random(),
          roleName: "",
          roleSkills: [],
        },
      ],
      titleAcademic: "",
      descriptionAcademic: "",
      skillsAcademic: [""],
      errorAcademic: "",
      roleDetailsAcademic: [
        {
          index: Math.random(),
          roleName: "",
          roleSkills: [],
        },
      ],
      teamMates: [],
      mentor: "",
      subject: "",
      semester: "",
      open: false,
      clicked: false,
      words: [],
      mentors: [],
    };
  }
  componentDidMount() {
    fetch("http://localhost:8081/words")
      .then((response) => response.json())
      .then((data) => this.setState({ words: data.words }));
    fetch("http://localhost:3000/mentors")
      .then((response) => response.json())
      .then((data) => {
        if (data.error !== undefined) {
          this.setState({ mentors: [] });
        } else {
          let arr = [];
          data.teachers.map((teacher) => {
            let obj = { label: teacher.name, id: teacher._id };
            arr.push(obj);
            this.setState({ mentors: arr });
          });
        }
      });
  }
  handleChange = (proj) => (event) => {
    this.setState({ error: "" });
    this.setState({ [proj]: event.target.value });
    // console.log(proj, event.target.value);
  };
  handleSkills = (newSkills) => {
    this.setState({ skills: newSkills });
  };
  handleSkillsAcademic = (newSkills) => {
    // console.log(newSkills);
    this.setState({ skillsAcademic: newSkills });
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
          index: Math.random(),
          roleName: "",
          roleSkills: "",
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
  clickSubmitAcademic = async (e) => {
    e.preventDefault();
    this.setState({ loading: true, error: "" });
    const {
      titleAcademic,
      descriptionAcademic,
      skillsAcademic,
      mentor,
      subject,
      semester,
      teamMates,
    } = this.state;
    let project = {
      titleAcademic,
      descriptionAcademic,
      skillsAcademic,
      mentor,
      subject,
      semester,
      teamMates,
    };
    console.log(project);
    let error = false;
    // if (teamMates.length === 0) {
    //   this.setState({ error: "check Teammates" });
    //   error = true;
    // }
    if (semester === "") {
      this.setState({ error: "Enter Semester" });
      error = true;
    }
    if (subject === "") {
      this.setState({ error: "Enter Subject" });
      error = true;
    }
    if (mentor === "") {
      this.setState({ error: "Enter Mentor" });
      error = true;
    }
    if (skillsAcademic[0] === "" || skillsAcademic.length === 0) {
      this.setState({ error: "Enter Skills" });
      error = true;
    }
    if (descriptionAcademic === "") {
      this.setState({ error: "Enter Description" });
      error = true;
    }
    if (titleAcademic === "") {
      this.setState({ error: "Enter title" });
      error = true;
    }

    try {
      if (this.state.error === "" && this.state.error !== undefined) {
        newAcademicProject(project).then((data) => {
          if (data === undefined) return;
          if (data.error) {
            if (data.similar) {
              this.setState({ similar: data.similar });
              console.log(this.state.similar);
            }
            this.setState({ error: data.error });
          } else
            this.setState({
              titleAcademic: "",
              descriptionAcademic: "",
              skillsAcademic: [""],
              mentor: "",
              subject: "",
              semester: "",
              teamMates: [],
              error: "",
              open: true,
            });
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  clickSubmit = async (event) => {
    event.preventDefault();
    this.setState({ loading: true, error: "" });
    let { title, description, skills, roleDetails } = this.state;
    await roleDetails.map((role, i) => {
      if (role.roleSkills.length === 0) {
        this.setState({ error: "Empty skills for role Number " + (i + 1) });
      }
      if (role.roleName === "")
        this.setState({ error: "Empty role title at " + (i + 1) });
    });
    let project = {
      title,
      description,
      skills,
      roleDetails,
    };

    // newProject(project);
    try {
      // console.log(this.state.error);
      if (this.state.error === "" && this.state.error !== undefined) {
        newProject(project).then((data) => {
          if (data === undefined) return;
          if (data.error) {
            if (data.similar) {
              this.setState({ similar: data.similar });
              console.log(this.state.similar);
            }
            this.setState({ error: data.error });
          } else
            this.setState({
              title: "",
              description: "",
              skills: [""],
              roleDetails: [
                {
                  index: Math.random(),
                  roleName: "",
                  roleSkills: [],
                },
              ],
              error: "",
              open: true,
            });
        });
      }
    } catch (error) {
      console.log(error);
    }
    // console.log(project);
  };

  render() {
    let { error, title, description, skills, roleDetails, open, mentors } =
      this.state;
    return (
      <>
        <div
          className="subheader py-2 py-lg-6  subheader-transparent "
          id="kt_subheader"
        >
          <div className=" container  d-flex align-items-center justify-content-between flex-wrap flex-sm-nowrap">
            <div className="d-flex align-items-center flex-wrap mr-2">
              <h5 className="text-dark font-weight-bold mt-2 mb-2 mr-5">
                Create Project
              </h5>
              <Button
                className="font-weight-bold mt-2 mb-2 mr-5"
                onClick={() => this.setState({ clicked: !this.state.clicked })}
              >
                {this.state.clicked === true ? "New Idea" : "Academic Project"}
              </Button>
              <div className="subheader-separator subheader-separator-ver mt-2 mb-2 mr-4 bg-gray-200"></div>
            </div>
            <div class="d-flex align-items-center flex-wrap">
              <Badge variant="primary">
                <div className="d-flex align-items-center flex-wrap mr-2">
                  <h6>{dayjs().format("DD MMMM, dddd")}</h6>
                  <div className="subheader-separator subheader-separator-ver mt-2 mb-2 mr-4 ml-4 bg-gray-200"></div>
                  <h6>
                    <LiveClock format="hh:mm a" ticking />
                  </h6>
                </div>
              </Badge>
            </div>
          </div>
        </div>
        {this.state.clicked === false ? (
          <>
            <div className="container">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">
                    <h2>Let's Start a New Project</h2>
                    <p className="text-muted">
                      Fill in the form with all the necessary details to
                      register the project.
                    </p>
                  </div>
                </div>
                <div className="card-body">
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
                    Project Successfully Registered. Check "My Projects".
                  </div>
                  <form className="mt-5">
                    <div className="form-group">
                      <div className="row">
                        <div className="col-sm-10 offset-1">
                          <label>
                            <big>Title of your Project</big>
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            value={title}
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
                            value={description}
                            onChange={this.handleChange("description")}
                          />
                        </div>
                      </div>
                      <div className="row mt-3">
                        <div className="col-sm-10 offset-1">
                          <SkillsInput
                            label={<big>Skills</big>}
                            setSkills={this.handleSkills}
                          />
                        </div>
                      </div>
                      {/*<RoleView />*/}
                      <RoleList
                        add={this.addNewRow}
                        delete={this.clickOnDelete.bind(this)}
                        roleDetails={roleDetails}
                        onChange={this.handleRoleChange}
                      />
                      <div className="row">
                        <button
                          onClick={this.clickSubmit}
                          className="btn btn-raised btn-primary mx-auto mt-3 mb-2 col-sm-3"
                        >
                          Create Project!
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="container">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">
                    <h2>Let's Start a New Academic Project</h2>
                    <p className="text-muted">
                      Fill in the form with all the necessary details to submit
                      for approval.
                    </p>
                  </div>
                </div>
                <div className="card-body">
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
                    Project Successfully Registered. Check "My Projects".
                  </div>
                  <form className="mt-5">
                    <div className="form-group">
                      <div className="row">
                        <div className="col-sm-10 offset-1">
                          <label>
                            <big>Title of your Project</big>
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            value={this.state.titleAcademic}
                            onChange={this.handleChange("titleAcademic")}
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
                            value={this.state.descriptionAcademic}
                            onChange={this.handleChange("descriptionAcademic")}
                          />
                        </div>
                      </div>
                      {/*<RoleView />*/}
                      <div className="row mt-3">
                        <div className="col-sm-10 offset-1">
                          <label>
                            <big>Skills</big>
                          </label>
                          <Typeahead
                            onChange={(selected) => {
                              console.log(selected);
                              this.setState({ skillsAcademic: selected });
                            }}
                            options={this.state.words}
                            multiple
                          />
                        </div>
                      </div>
                      {/* Load list of mentors */}
                      <div className="row mt-3">
                        <div className="col-sm-10 offset-1">
                          <label>
                            <big>Mentor</big>
                          </label>
                          <Typeahead
                            onChange={(selected) => {
                              console.log(selected[0]);
                              this.setState({ mentor: selected[0] });
                            }}
                            options={mentors}
                          />
                        </div>
                      </div>
                      {/* Load list of subjects of user */}
                      <div className="row mt-3">
                        <div className="col-sm-10 offset-1">
                          <label>
                            <big>Subject</big>
                          </label>
                          <Typeahead
                            onChange={(selected) => {
                              this.setState({ subject: selected[0] });
                            }}
                            options={["AI", "Webdev", "Game Programming"]}
                          />
                        </div>
                      </div>
                      {/*  */}
                      <div className="row mt-3">
                        <div className="col-sm-10 offset-1">
                          <label>
                            <big>Semester</big>
                          </label>
                          <Typeahead
                            onChange={(selected) => {
                              this.setState({ semester: selected[0] });
                            }}
                            options={[
                              "Winter Sem 2020-2021",
                              "Summer Sem 2020-2021",
                            ]}
                          />
                        </div>
                      </div>
                      <div className="row mt-3">
                        <div className="col-sm-10 offset-1">
                          <label>
                            <big>Team Mates</big>
                          </label>
                          <Typeahead
                            onChange={(selected) => {
                              console.log(selected);
                              this.setState({ teamMates: selected });
                            }}
                            options={[
                              "17BCE0041_Akshay",
                              "17BCE2244_Nithiya",
                              "17BCE0002_Nithish",
                              "17BCE0835_Manoj",
                              "17BCE2200_Swathi",
                            ]}
                            multiple
                          />
                        </div>
                      </div>
                      {/* <RoleList
                        add={this.addNewRow}
                        delete={this.clickOnDelete.bind(this)}
                        roleDetails={roleDetails}
                        onChange={this.handleRoleChange}
                      /> */}

                      <div className="row">
                        <button
                          onClick={this.clickSubmitAcademic}
                          className="btn btn-raised btn-primary mx-auto mt-3 mb-2 col-sm-3"
                        >
                          Create Academic Project!
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </>
    );
  }
}

export default CreateProject;
