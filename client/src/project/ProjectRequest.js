import React, { Component } from "react";
import { listprojects } from "./apiProject";
import { getCurrentUser, getUserById } from "./../user/apiUser";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { clearAll } from "../store/cpm";
import { connect } from "react-redux";
import LiveClock from "react-live-clock";
import dayjs from "dayjs";
import { Badge } from "react-bootstrap";
import ApproveOrDeclineProject from "./ApproveOrDeclineProject";

class ProjectRequest extends Component {
  state = {
    reqProjects: [],
  };
  componentDidMount() {
    listprojects().then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        let req_proj = [];
        data.map((proj, index) => {
          console.log(proj.mentors_requested)
          let memb = proj.mentors_requested
          memb.map((user) => {
            if (user.id === getCurrentUser()._id)
              req_proj.push(proj);
          })
        })
        this.setState({ reqProjects: req_proj })
      }
    });
  }

  render() {
    console.log(this.state.reqProjects)
    if (
      this.state.reqProjects === undefined ||
      this.state.reqProjects.length === 0
    )
      return <h1>No Requests Found</h1>;
    const {
      reqProjects
    } = this.state;

    console.log(reqProjects)
    let PendingProjects = reqProjects.filter(
      (x) => !x.mentors.includes(getCurrentUser()._id)
    );
    console.log(PendingProjects)
    return (
      <>
        <div
          className="subheader py-2 py-lg-6  subheader-transparent "
          id="kt_subheader"
        >
          <ToastContainer />
          <div className=" container  d-flex align-items-center justify-content-between flex-wrap flex-sm-nowrap">
            <div className="d-flex align-items-center flex-wrap mr-2">
              <h5 className="text-dark font-weight-bold mt-2 mb-2 mr-5">
                Requested Projects
              </h5>
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
        <div className="row row-cols-1 row-cols-md-4">
          {PendingProjects.map((project, i) => (
            <div className="col">
              <div className="card card-custom gutter-b card-stretch" key={i}>
                <div className="card-body text-center pt-4">
                  <div className="my-4">
                    <h5 className="text-dark font-weight-bold font-size-h3">
                      {project.title}
                    </h5>
                  </div>
                  <div className="text-dark font-weight-bold font-size-h6">
                    {project.description}
                  </div>
                  <div className="mt-9">
                    <ApproveOrDeclineProject project={project} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }
}

export default ProjectRequest;
