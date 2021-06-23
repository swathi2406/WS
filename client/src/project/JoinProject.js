import React, { Component } from "react";
import { Link } from "react-router-dom";
import { listprojects, request } from "./apiProject";
import { getCurrentUser, getUserById } from "../user/apiUser";
import { connect } from "react-redux";
import { notificationAdded } from "../store/notifications";
import { ToastContainer, toast } from "react-toastify";
import LiveClock from "react-live-clock";
import dayjs from "dayjs";
import { Badge } from "react-bootstrap";
import SearchTwoToneIcon from "@material-ui/icons/SearchTwoTone";
import moment from "moment";
import SearchProjectBar from "./../SearchProjectBar";
class JoinProject extends Component {
  constructor() {
    super();
    this.state = {
      projects: [],
    };
  }

  componentDidMount() {
    listprojects().then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        this.setState({ projects: data });
        let projectLeaderNames = {};
        let projectCreatedDates = {};
        let projectEstimatedDates = {};
        data.map((project, index) => {
          //Leader name
          // let number = index;
          getUserById(project.leader).then((data) => {
            projectLeaderNames[project._id] = data.user.name;
            // console.log(projectLeaderNames);
            this.setState({ projectLeaderNames });
          });
          // var date = moment(new Date(project.created.substr(0, 16)));
          // console.log(date.format("DD-MMM-YYYY"));

          let date = moment(new Date(project.created.substr(0, 16)));
          var new_date = moment(date, "DD-MM-YYYY").add(
            project.estimatedTime,
            "days"
          );
          projectEstimatedDates[project._id] = new_date.format("DD-MMM-YYYY");
          this.setState({ projectEstimatedDates });
          projectCreatedDates[project._id] = date.format("DD-MMM-YYYY");
          this.setState({ projectCreatedDates });
          // console.log(project.leadername);
        });
        // toast.dark("Loaded");
      }
    });
  }

  render() {
    const {
      projects,
      projectLeaderNames,
      projectCreatedDates,
      projectEstimatedDates,
    } = this.state;
    // console.log(projectLeaderNames);
    if (
      projectLeaderNames === undefined ||
      projectCreatedDates === undefined ||
      projectEstimatedDates === undefined
    )
      return null;
    if (
      Object.keys(projectLeaderNames).length !== projects.length ||
      Object.keys(projectCreatedDates).length !== projects.length ||
      Object.keys(projectEstimatedDates).length !== projects.length
    )
      return null;
    return (
      <>
        <ToastContainer />
        <div
          className="subheader py-2 py-lg-6  subheader-transparent "
          id="kt_subheader"
        >
          <div className=" container  d-flex align-items-center justify-content-between flex-wrap flex-sm-nowrap">
            <div className="d-flex align-items-center flex-wrap mr-2">
              <h5 className="text-dark font-weight-bold mt-2 mb-2 mr-5">
                Join Project
              </h5>
              <span>
                <SearchProjectBar />
              </span>
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
        <div className="d-flex flex-column-fluid">
          <div className="container">
            {projects.map((project, i) => (
              <div className="card card-custom gutter-b">
                <div className="card-body">
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center justify-content-between flex-wrap">
                        <div className="mr-3">
                          <Link
                            to={{
                              pathname: `/project/${project._id}`,
                              state: { project: project },
                            }}
                            className="text-dark-75 text-hover-primary mb-1 font-size-lg font-weight-bolder"
                          >
                            {project.title}
                          </Link>
                          <div className="d-flex flex-wrap my-2">
                            <p className="text-muted font-weight-bold mr-lg-8 mr-5 mb-lg-0 mb-2">
                              {projectLeaderNames[project._id]}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center flex-wrap justify-content-between">
                        <div className="flex-grow-1 font-weight-bold text-dark-100 py-5 py-lg-2 mr-5">
                          {project.description}
                          <p className="card-text">
                            <strong>Skills required: </strong>
                            {project.skills.map((skill) => (
                              <span class="btn btn-light-info btn-sm font-weight-bold btn-upper btn-text m-1">
                                {skill}
                              </span>
                            ))}
                          </p>
                        </div>

                        <div className="d-flex flex-wrap align-items-center py-2">
                          <div className="d-flex align-items-center mr-10">
                            <div className="mr-12 d-flex flex-column mb-7">
                              <span className="d-block font-weight-bold mb-4">
                                Start Date
                              </span>
                              <span className="btn btn-sm btn-text btn-light-primary text-uppercase font-weight-bold">
                                {projectCreatedDates[project._id]}
                              </span>
                            </div>
                            <div className="mr-12 d-flex flex-column mb-7">
                              <span className="d-block font-weight-bold mb-4">
                                Due Date
                              </span>
                              <span className="btn btn-sm btn-text btn-light-danger text-uppercase font-weight-bold">
                                {projectEstimatedDates[project._id]}
                              </span>
                            </div>
                          </div>
                          <div className="flex-grow-1 flex-shrink-0 w-150px w-xl-300px mt-4 mt-sm-0">
                            <span className="d-block font-weight-bold mb-4">
                              Progress
                            </span>
                            <div className="d-flex align-items-center pt-2">
                              <div className="progress progress-xs mt-2 mb-2 w-100">
                                <div
                                  className="progress-bar bg-warning"
                                  role="progressbar"
                                  style={{
                                    width: `${project.completion_percentage}%`,
                                  }}
                                  aria-valuenow="50"
                                  aria-valuemin="0"
                                  aria-valuemax="100"
                                ></div>
                              </div>
                              <span className="ml-3 font-weight-bolder">
                                {`${project.completion_percentage}%`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="separator separator-solid my-7"></div>
                  <table className="table">
                    <thead>
                      <tr key={"title"}>
                        <th key={"rolename"}>Role Name</th>
                        <th key={"skills"}>Skills Required</th>
                        <th key={"status"}>Status</th>
                      </tr>
                      {project.roles.map((role) => (
                        <tr key={role._id.toString()}>
                          <td
                            key={role._id.toString() + role.roleName.toString()}
                          >
                            {role.roleName}
                          </td>
                          <td
                            key={
                              role._id.toString() + role.roleSkills.toString()
                            }
                          >
                            {/* {role.roleSkills + ","} */}
                            {role.roleSkills.map((skill) => (
                              <span class="btn btn-light-info btn-sm font-weight-bold btn-upper btn-text mr-1">
                                {skill}
                              </span>
                            ))}
                          </td>
                          <td>
                            {role.assignedTo !== undefined ? (
                              <Badge pill variant="warning">
                                Position Full
                              </Badge>
                            ) : (
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => {
                                  getCurrentUser()._id === project.leader
                                    ? toast.warning(
                                        "Leaders cant Request, right???"
                                      )
                                    : request(
                                        getCurrentUser()._id,
                                        project._id,
                                        role._id
                                      ).then((val) => {
                                        if (!val.err) {
                                          this.props.notificationAdded({
                                            userId: project.leader,
                                            message: `${
                                              role.roleName
                                            } requested by ${
                                              getCurrentUser().name
                                            }!`,
                                            type: "RequestForRole",
                                            projectId: project._id,
                                          });
                                        }
                                      });
                                }}
                              >
                                Request
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </thead>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  notifications: state.notifications.notifications,
});

const mapDispatchToProps = (dispatch) => ({
  notificationAdded: (params) => dispatch(notificationAdded(params)),
});

export default connect(mapStateToProps, mapDispatchToProps)(JoinProject);
