import React, { Component } from "react";
import { Tab, Nav, Modal, Button, ModalBody, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LiveClock from "react-live-clock";
import dayjs from "dayjs";
import { Badge } from "react-bootstrap";
import StorageRoundedIcon from "@material-ui/icons/StorageRounded";
import AssignmentIndRoundedIcon from "@material-ui/icons/AssignmentIndRounded";
import PeopleOutlineIcon from "@material-ui/icons/PeopleOutline";
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import { DropzoneArea } from "material-ui-dropzone";
import { PdfDropZone } from "./PdfDropZone";
import { checkProject } from "./../project/apiProject";
import UserRecommender from "./UserRecommender";
import RecommendationProject2 from "./RecommendationProject2";
import RecommendationPDF from "./RecommendationPDF";
import SkillsInput from "./../utils/signupbutton/Tagify/SkillsInput";
import { Line } from "react-chartjs-2";
class Recommendation extends Component {
  state = {
    key: "Database",
    projectSkills: [],
    requiredSkills: [], //added
    files: [], //added
    show: false,
    title: "",
    description: "",
    skills: [""],
    error: "",
    roleDetails: [
      {
        index: Math.random(),
        roleName: "",
        roleSkills: [""],
      },
    ],
    open: false,
    similar: [],
  };

  handleShow() {
    this.setState({ show: true });
  }

  handleClose() {
    this.setState({ show: false });
  }

  handleChange = (proj) => (event) => {
    this.setState({ error: "" });
    this.setState({ [proj]: event.target.value });
  };

  setFiles(files) {
    console.log(files);
    this.setState({ files });
  }

  clickSubmit = (event) => {
    event.preventDefault();
    this.setState({ loading: true });
    let { title, description, skills, roleDetails } = this.state;
    let project = {
      title,
      description,
      skills,
      roleDetails,
    };
    try {
      checkProject(project).then((data) => {
        if (data === undefined) return;
        if (data.error) {
          if (data.similar) {
            this.setState({ similar: data.similar });
            console.log(data.similar);
          } else if (data.similar === undefined)
            this.setState({ similar: undefined });
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
    } catch (error) {
      console.log(error);
    }
    // console.log(project);
    this.setState({ show: true });
  };
  componentDidMount() {}
  render() {
    let { error, title, description, open, files, requiredSkills } = this.state;
    const { similar } = this.state;
    let data = {};
    if (similar !== undefined) {
      let xaxis = [];
      let yaxis = [];
      similar.map((project) => {
        xaxis.push(project.title);
        yaxis.push(project.similarity);
      });
      data = {
        labels: xaxis,
        datasets: [
          {
            label: "similarity",
            data: yaxis,
            fill: false,
            backgroundColor: "rgb(255, 99, 132)",
            borderColor: "rgba(255, 99, 132, 0.2)",
          },
        ],
      };
    }
    console.log("data:", data);
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
                Recommendation
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
        <div className="container">
          <div className="card">
            <Tab.Container id="Database" defaultActiveKey="Database">
              <div className="card-header">
                <div className="card-title">
                  <Nav variant="pills">
                    <Nav.Item>
                      <Nav.Link eventKey="Database">
                        <div className="d-flex align-items-center">
                          <div className="mr-3">
                            <StorageRoundedIcon />
                          </div>
                          <div>Database</div>
                        </div>
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="Resume">
                        <div className="d-flex align-items-center">
                          <div className="mr-3">
                            <AssignmentIndRoundedIcon />
                          </div>
                          <div>Resume</div>
                        </div>
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </div>
              </div>
              <div className="card-body">
                <Tab.Content>
                  <Tab.Pane eventKey="Database">
                    <div>
                      <Tab.Container
                        id="DatabaseRecommender"
                        defaultActiveKey="ProjectRecommender"
                      >
                        <div>
                          <div className="card-title">
                            <Nav variant="pills">
                              <Nav.Item>
                                <Nav.Link eventKey="ProjectRecommender">
                                  <div className="d-flex align-items-center">
                                    <div className="mr-3">
                                      <LibraryBooksIcon />
                                    </div>
                                    <div>Project Recommender</div>
                                  </div>
                                </Nav.Link>
                              </Nav.Item>
                              <Nav.Item>
                                <Nav.Link eventKey="UserRecommender">
                                  <div className="d-flex align-items-center">
                                    <div className="mr-3">
                                      <PeopleOutlineIcon />
                                    </div>
                                    <div>User Recommender</div>
                                  </div>
                                </Nav.Link>
                              </Nav.Item>
                              <Nav.Item>
                                <Nav.Link eventKey="ProjectChecker">
                                  <div className="d-flex align-items-center">
                                    <div className="mr-3">
                                      <FileCopyIcon />
                                    </div>
                                    <div>Project Checker</div>
                                  </div>
                                </Nav.Link>
                              </Nav.Item>
                            </Nav>
                          </div>
                        </div>
                        <div className="card-body">
                          <Tab.Content>
                            <Tab.Pane eventKey="ProjectRecommender">
                              <SkillsInput
                                label={"Skills"}
                                name={"skillsInput"}
                                value={""}
                                setSkills={(arr) => {
                                  console.log(arr);
                                  this.setState({
                                    projectSkills: arr,
                                  });
                                }}
                              />
                              <RecommendationProject2
                                skills={this.state.projectSkills}
                              />
                            </Tab.Pane>
                            <Tab.Pane eventKey="UserRecommender">
                              <div className="row row-cols-1 ">
                                <UserRecommender />
                              </div>
                            </Tab.Pane>
                            <Tab.Pane eventKey="ProjectChecker">
                              <div className="row row-cols-1 ">
                                Similar Projects
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
                                        onChange={this.handleChange(
                                          "description"
                                        )}
                                      />
                                    </div>
                                  </div>
                                  <div className="row">
                                    <button
                                      onClick={this.clickSubmit}
                                      className="btn btn-raised btn-primary mx-auto mt-3 mb-2 col-sm-3"
                                    >
                                      Check for Projects
                                    </button>
                                    <Modal
                                      show={this.state.show}
                                      onHide={() =>
                                        this.setState({ show: false })
                                      }
                                    >
                                      <Modal.Header>
                                        <Modal.Title>
                                          Similar projects
                                        </Modal.Title>
                                        <Button
                                          onClick={this.handleClose.bind(this)}
                                        >
                                          x
                                        </Button>
                                      </Modal.Header>
                                      <ModalBody>
                                        {similar === undefined ? (
                                          <h1>No similar projects found</h1>
                                        ) : (
                                          <>
                                            {similar.map((project) => (
                                              <p>
                                                <h3>{project.title}</h3>
                                                <h4>{project.description}</h4>

                                                {/* <p>{_id}</p> */}
                                                <Link
                                                  className="btn btn-info mr-2"
                                                  to={{
                                                    pathname: `/joinproject`,
                                                    state: { project: project },
                                                  }}
                                                >
                                                  Go to project
                                                </Link>
                                              </p>
                                            ))}
                                            Graph:
                                            <Line data={data} />
                                          </>
                                        )}
                                      </ModalBody>
                                    </Modal>
                                  </div>
                                </div>
                              </form>
                            </Tab.Pane>
                          </Tab.Content>
                        </div>
                      </Tab.Container>
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="Resume">
                    <SkillsInput
                      label={"Skills"}
                      name={"skillsInput"}
                      value={""}
                      setSkills={(arr) => {
                        this.setState({
                          requiredSkills: arr,
                        });
                      }}
                    />
                    <div className="text-center">
                      <div>Drop in the resumes here</div>
                      <PdfDropZone
                        setFiles={this.setFiles.bind(this)}
                        files={this.state.files}
                      />
                    </div>
                    <RecommendationPDF skills={requiredSkills} files={files} />
                  </Tab.Pane>
                </Tab.Content>
              </div>
            </Tab.Container>
          </div>
        </div>
      </>
    );
  }
}
export default Recommendation;
