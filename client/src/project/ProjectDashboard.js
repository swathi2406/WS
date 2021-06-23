import React, { Component } from "react";
import { Accordion, Card, Button, Row, Tab, Col, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import AddTask from "./taskComponents/AddTask";
import LayoutComponent from "./layout/LayoutComponent";
import TrelloTask from "./taskComponents/TrelloTask";
import GroupTwoToneIcon from "@material-ui/icons/GroupTwoTone";
import AccountTreeTwoToneIcon from "@material-ui/icons/AccountTreeTwoTone";
import TuneTwoToneIcon from "@material-ui/icons/TuneTwoTone";
import PlaylistAddTwoToneIcon from "@material-ui/icons/PlaylistAddTwoTone";
import ListAltTwoToneIcon from "@material-ui/icons/ListAltTwoTone";
import PhotoLibraryIcon from "@material-ui/icons/PhotoLibrary";
import ChatIcon from "@material-ui/icons/Chat";
import { getCurrentUser, getUserById } from "../user/apiUser";
import { getAllPosts } from "./../posts/apiPosts";
import Post from "../posts/Post";
import VideoPost from "./../posts/VideoPost";
import Chat from "./Chat";
import { getTasks } from "./apiProject";
import { connect } from "react-redux";
import { updateTasks } from "../store/tasks";
import { clearAll } from "../store/cpm";
import RoleReq from "./RoleReq";
import AssignedTo from "./AssignedTo";
import UserRecommendation from "./UserRecommendation";
import moment from "moment";
import RecommendedRolePeople from "./RecommendedRolePeople";
import { ToastContainer } from "react-toastify";
import StartIcon from "../images/victory.png";
import {
  clearFirstLayer,
  clearSecondLayer,
  clearThirdLayer,
  setFirstLayer,
  setSecondLayer,
  setThirdLayer,
} from "../store/projectStats";

class ProjectDashboard extends Component {
  state = {
    expectedTime: {},
    leaderName: "",
    assignedTo: {},
    assignedUser: {},
    count1: 0,
    count2: 0,
    count3: 0,
    count4: 0,
  };
  componentDidMount() {
    this.props.clearAll();
    this.props.clearFirstLayer();
    this.props.clearSecondLayer();
    this.props.clearThirdLayer();
    const { project } = this.props.location.state;
    getTasks(project._id).then((val) => {
      this.props.updateTasks({
        tasks: val.tasks,
      });
    });
    getAllPosts()
      .then((res) => res.json())
      .then((data) => {
        // console.log(data);
        this.setState({ posts: data.posts });
      });
    getUserById(project.leader).then((data) =>
      this.setState({ leaderName: data.user.name })
    );

    let tasks = project.tasks;
    let Obj = {};
    let count1 = 0,
      count2 = 0,
      count3 = 0,
      count4 = 0;
    tasks.map(async (task) => {
      let names = [];
      if (task.assignedTo !== undefined)
        await task.assignedTo.map(async (user) => {
          await getUserById(user).then((data) => {
            names.push(data.user.name);
            Object.assign(Obj, { [task._id]: names.join(" ") });
          });
        });
    });
    tasks.map((task) => {
      if (task.status !== undefined) {
        if (task.status === "PLANNED") count1++;
        else if (task.status === "WIP") count2++;
        else if (task.status === "Review") count3++;
        else if (task.status === "COMPLETED") count4++;
      }
    });
    this.setState({
      assignedUser: Obj,
      count1,
      count2,
      count3,
      count4,
    });
  }
  userNameBuilder = async (task) => {
    let names = [];
    const promises = task.assignedTo.map(async (user) => {
      let userObj = await getUserById(user);
      return userObj.user.name;
    });
    const resolved = await Promise.all(promises);
    return resolved;
    // console.log(names);
  };
  async componentDidUpdate(prevProps, prevState) {
    // if (prevState.connections.length !== this.props.connections.length) {
    //   // if (this.props.pert.latestFinishTimes !== undefined)
    //   //   console.log("end time:", this.props.pert.latestFinishTimes.__end);
    //   // const expectedTime =
    //   //   this.props.pert.latestFinishTimes !== undefined
    //   //     ? Math.floor(this.props.pert.latestFinishTimes.__end)
    //   //     : "Not set yet";
    //   // this.setState({ expectedTime });
    //   // this.props.setExpectedTime({ expectedTime });
    // }
    if (prevProps.tasks !== undefined && this.props.tasks !== undefined && prevProps.tasks.length !== this.props.tasks.length) {
      console.log("prevProps:", prevProps.tasks);
      console.log("this Props:", this.props.tasks);
      const { project } = this.props.location.state;
      const { slacks, expectedTime, tasks, criticalPath } = this.props;
      console.log("slacks:", slacks);

      // First Layer

      // Project Created date

      let createDate = new Date(project.created);

      // End Date

      let expectedDate = moment(createDate, "DD-MM-YYYY").add(
        expectedTime,
        "days"
      );

      // Duration

      let today = new Date();
      let day1 = new Date(today.toUTCString());
      const diffTime = expectedDate._d - day1;
      const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // tasks todo, on progress, review, completed

      let planned = 0,
        inProgress = 0,
        review = 0,
        completed = 0;
      if (tasks.length !== 0 && tasks !== undefined) {
        // console.log("Tasks:", tasks);
        tasks.map((task) => {
          if (task.status !== undefined) {
            if (task.status === "PLANNED") planned++;
            if (task.status === "WIP") inProgress++;
            if (task.status === "Review") review++;
            if (task.status === "COMPLETED") completed++;
          }
        });
      }
      let firstLayerData = {
        startDate: moment(project.created).format("DD-MM-YYYY"),
        daysLeft: duration,
        endDate: expectedDate.format("DD-MM-YYYY"),
        toDoTasks: planned,
        onGoingTasks: inProgress,
        reviewingTasks: review,
        completedTasks: completed,
      };
      this.props.setFirstLayer({ firstLayer: firstLayerData });

      // Second Layer

      let secondLayerData = {};
      if (tasks.length !== 0 && tasks !== undefined) {
        const { allIdPertData, idFromKeyObject } = this.props;
        console.log("allIdPertData:", allIdPertData);
        console.log("idFromKey:", idFromKeyObject);
        const promises = await tasks.map(async (task) => {
          if (
            task.taskName !== "Lets Start Working" &&
            task.taskName !== "Completed!!" &&
            slacks !== {} &&
            slacks[task.taskName] !== undefined &&
            allIdPertData.criticalPath !== undefined &&
            allIdPertData.criticalPath.includes(idFromKeyObject[task._id])
          ) {
            let usernameArr = await this.userNameBuilder(task);
            let pertData = allIdPertData[idFromKeyObject[task._id]];
            let startby = moment(task.created).add(
              pertData.earliestStart,
              "days"
            );
            let obj = {
              [task._id]: {
                taskName: task.taskName, //taskName
                taskDescription: task.taskDescription, //taskName
                daysLeft: slacks[task.taskName].days, // days left for task
                assignedTo: usernameArr, // assigned To usernames
                started: startby.format("DD-MM-YY"), //moment(task.created).format("DD-MM-YY"), // started
                dueOn: startby
                  .add(pertData.expectedTime, "days") // dueOn
                  .format("DD-MM-YY"),
                status: task.status, // status of task
              },
            };
            Object.assign(secondLayerData, obj);
          }
        });
        await Promise.all(promises);
      }

      console.log("second layer:", secondLayerData);
      this.props.setSecondLayer({ secondLayer: secondLayerData });

      // Third Layer

      let thirdLayerData = {};
      if (tasks.length !== 0 && tasks !== undefined) {
        const { allIdPertData, idFromKeyObject } = this.props;
        function inverse(obj) {
          var retobj = {};
          for (var key in obj) {
            retobj[obj[key]] = key;
          }
          return retobj;
        }
        let keyFromIdObject = inverse(idFromKeyObject);
        let promises = await tasks.map(async (task) => {
          if (
            task.taskName !== "Lets Start Working" &&
            task.taskName !== "Completed!!" &&
            slacks !== {} &&
            slacks[task.taskName] !== undefined &&
            allIdPertData.criticalPath !== undefined &&
            !allIdPertData.criticalPath.includes(idFromKeyObject[task._id])
          ) {
            let pertData = allIdPertData[idFromKeyObject[task._id]];
            // Username Array
            let usernameArr = await this.userNameBuilder(task);
            // For days left
            let today = new Date();
            let todayDate = new Date(today.toUTCString());
            let createdDate = new Date(task.created);
            let earliestFinish = moment(createdDate, "DD-MM-YYYY").add(
              pertData.earliestFinish,
              "days"
            );
            earliestFinish = earliestFinish._d;
            let earliestStart = moment(createdDate, "DD-MM-YYYY").add(
              pertData.earliestStart,
              "days"
            );
            earliestStart = earliestStart._d;

            //Overdue calc
            let days = Math.round(
              (earliestFinish - todayDate) / (1000 * 60 * 60 * 24)
            );
            days = pertData.slack !== 0 ? days + pertData.slack : days;

            let startby = moment(task.created).add(
              pertData.earliestStart,
              "days"
            );
            //Obj
            let obj = {
              [task._id]: {
                taskName: task.taskName, //taskName
                taskDescription: task.taskDescription, //taskDesc
                started: startby.format("DD-MM-YY"), //moment(task.created).format("DD-MM-YY"), // started
                dueOn: startby
                  .add(pertData.expectedTime, "days") // dueOn
                  .format("DD-MM-YY"),
                assignedTo: usernameArr, // assigned To user Names
                daysLeft: Math.round(
                  (earliestFinish - todayDate) / (1000 * 60 * 60 * 24)
                ), // days left for task
                slack: pertData.slack,
                overdue: days < 0 ? "Overdue" : "On Schedule",
              },
            };
            Object.assign(thirdLayerData, obj);
          }
        });
        await Promise.all(promises);
      }

      console.log("third layer:", thirdLayerData);
      this.props.setThirdLayer({ thirdLayer: thirdLayerData });
    }
    if (prevState !== this.state) {
      console.log("prevState:", prevState);
      console.log("this state:", this.state);
    }
    // console.log(prevState);
  }
  renderSlacks(slacks) {
    if (slacks === undefined) return null;
    // console.log(slacks);
    // let assignedUser = this.state.assignedUser;
    // // console.log(assignedUser);
    // if (assignedUser === undefined) return null;
    // let str = "";
    console.log(slacks);
    // console.log(this.state.assignedUser);
    const { projectStats, allIdPertData, idFromKeyObject } = this.props;
    function inverse(obj) {
      var retobj = {};
      for (var key in obj) {
        retobj[obj[key]] = key;
      }
      return retobj;
    }
    let keyFromIdObject = inverse(idFromKeyObject);
    console.log(projectStats.thirdLayer);
    let thirdLayer = projectStats.thirdLayer;
    return Object.keys(thirdLayer).map((key) => (
      <>
        <div>
          <div className="col mb-4">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="d-flex flex-column flex-grow-1">
                    <div className="text-dark-100 mb-1 font-size-lg font-weight-bolder">
                      {thirdLayer[key] !== undefined
                        ? thirdLayer[key].taskName
                        : "Loading..."}
                    </div>
                  </div>
                  {thirdLayer[key].overdue === "Overdue" ? (
                    <span className="btn btn-light-danger btn-sm font-weight-bold btn-upper btn-text">
                      Overdue
                    </span>
                  ) : (
                    <span className="btn btn-light-success btn-sm font-weight-bold btn-upper btn-text">
                      On schedule
                    </span>
                  )}
                  {/* <span className="btn btn-light-success btn-sm font-weight-bold btn-upper btn-text">
                    [LOAD]
                  </span> */}
                </div>

                <p className="card-text pt-3">
                  Days left: {thirdLayer[key].daysLeft}
                </p>
                <p className="card-text">
                  Number of Days you can Slack: {thirdLayer[key].slack}
                </p>
                <p className="card-text">
                  Start By:
                  <span className="btn btn-light-success btn-sm font-weight-bold btn-upper btn-text">
                    {thirdLayer[key] !== undefined
                      ? thirdLayer[key].started
                      : "Loading..."}
                  </span>
                </p>
                <p className="card-text">
                  Due on:
                  <span className="btn btn-light-danger btn-sm font-weight-bold btn-upper btn-text">
                    {/* {moment(slacks[key].earliestFinishDate).format(
                  "DD-MM-YYYY"
                )} */}
                    {thirdLayer[key] !== undefined
                      ? thirdLayer[key].dueOn
                      : "Loading..."}
                  </span>
                </p>
                <p className="card-text">
                  Assigned To:
                  <span className="btn btn-light-info btn-sm font-weight-bold btn-upper btn-text">
                    {thirdLayer[key] !== undefined
                      ? thirdLayer[key].assignedTo.toString()
                      : "Loading..."}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    ));
  }
  renderCriticalPath(criticalPathArr, criticalPathObject) {
    const { projectStats, allIdPertData, idFromKeyObject } = this.props;
    function inverse(obj) {
      var retobj = {};
      for (var key in obj) {
        retobj[obj[key]] = key;
      }
      return retobj;
    }
    let keyFromIdObject = inverse(idFromKeyObject);
    console.log(keyFromIdObject);
    const secondLayer = projectStats.secondLayer;
    console.log("Second layer in critical path : ", secondLayer);
    if (allIdPertData.criticalPath !== undefined) {
      console.log(allIdPertData.criticalPath);
      return allIdPertData.criticalPath.map((nodeIndex) =>
        nodeIndex !== "1" && nodeIndex !== "2" ? (
          <div className="col mb-4">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="d-flex flex-column flex-grow-1">
                    <div className="text-dark-100 mb-1 font-size-lg font-weight-bolder">
                      {secondLayer[keyFromIdObject[nodeIndex]] !== undefined
                        ? secondLayer[keyFromIdObject[nodeIndex]].taskName
                        : "Loading..."}
                    </div>
                  </div>
                  <span className="btn btn-light-success btn-sm font-weight-bold btn-upper btn-text">
                    {secondLayer[keyFromIdObject[nodeIndex]] !== undefined
                      ? secondLayer[keyFromIdObject[nodeIndex]].status
                      : "Loading..."}
                  </span>
                </div>
                <p className="card-text">
                  {secondLayer[keyFromIdObject[nodeIndex]] !== undefined
                    ? secondLayer[keyFromIdObject[nodeIndex]].taskDescription
                    : "Loading..."}
                </p>
                <p className="card-text pt-3">
                  Days left:{" "}
                  {secondLayer[keyFromIdObject[nodeIndex]] !== undefined
                    ? secondLayer[keyFromIdObject[nodeIndex]].daysLeft
                    : "Loading..."}
                </p>
                <p className="card-text text-danger">
                  You cannot slack in this task.
                </p>
                <p className="card-text">
                  Assigned To:
                  <span className="btn btn-light-info btn-sm font-weight-bold btn-upper btn-text">
                    {secondLayer[keyFromIdObject[nodeIndex]] !== undefined
                      ? secondLayer[
                        keyFromIdObject[nodeIndex]
                      ].assignedTo.toString()
                      : "Loading..."}
                  </span>
                </p>
                <p className="card-text">
                  Start By:
                  <span className="btn btn-light-success btn-sm font-weight-bold btn-upper btn-text">
                    {secondLayer[keyFromIdObject[nodeIndex]] !== undefined
                      ? secondLayer[keyFromIdObject[nodeIndex]].started
                      : "Loading..."}
                  </span>
                </p>
                <p className="card-text">
                  Due Date:
                  <span className="btn btn-light-danger btn-sm font-weight-bold btn-upper btn-text">
                    {secondLayer[keyFromIdObject[nodeIndex]] !== undefined
                      ? secondLayer[keyFromIdObject[nodeIndex]].dueOn
                      : "Loading..."}
                  </span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <></>
        )
      );
    }
  }
  render() {
    if (this.props.location.state.project === undefined) {
      return null;
    }
    if (this.state.leaderName === undefined) return null;

    const { project } = this.props.location.state;
    // console.log(this.props.location);
    // 25/5 26/5     23/6
    // estimated date : 23/6
    // no of days left : 23/6 - 26/5
    console.log(this.props.pert);
    let today = new Date();
    let day1 = new Date(today.toUTCString());
    // let day2 = new Date(project.created);
    // let difference = Math.abs(day2 - day1);
    // let days = parseInt(difference / (1000 * 3600 * 24));
    // console.log(days);
    const { expectedTime, slacks, criticalPath, pert, projectStats } =
      this.props;
    const { posts, leaderName } = this.state;
    let createDate = new Date(project.created);
    let expectedDate = moment(createDate, "DD-MM-YYYY").add(
      expectedTime,
      "days"
    );
    // console.log(this.props);
    const diffTime = Math.abs(expectedDate._d - day1);
    const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // console.log("no. of days left:", duration);
    // console.log("expectedDate : ", expectedDate.format("DD-MM-YYYY"));
    // console.log(slacks);
    // if (slacks === undefined) return ;
    if (expectedTime === undefined) return null;
    console.log("projectStats:", projectStats);
    return (
      <div className="pt-5">
        <ToastContainer />
        <Tab.Container id="left-tabs-example" defaultActiveKey="projStats">
          <Row>
            <Col sm={2}>
              <div className="card card-custom card-stretch">
                <div className="card-body pt-4">
                  <h5 className="font-weight-bolder text-dark-75 text-hover-primary">
                    {project.title}
                  </h5>
                  <div className="text-muted">{project.description}</div>
                  <Nav variant="pills" className="flex-column mt-3">
                    <Nav.Item>
                      <Nav.Link eventKey="teamInfo">
                        <div className="d-flex align-items-center">
                          <div className="mr-3">
                            <GroupTwoToneIcon />
                          </div>
                          <div>Team Information </div>
                        </div>
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="projStats">
                        <div className="d-flex align-items-center">
                          <div className="mr-3">
                            <TuneTwoToneIcon />
                          </div>
                          <div>Project Stats</div>
                        </div>
                      </Nav.Link>
                    </Nav.Item>
                    {project.status !== "Completed" &&
                      getCurrentUser()._id === project.leader ? (
                      <Nav.Item>
                        <Nav.Link eventKey="addTask">
                          <div className="d-flex align-items-center">
                            <div className="mr-3">
                              <PlaylistAddTwoToneIcon />
                            </div>
                            <div>Add Task</div>
                          </div>
                        </Nav.Link>
                      </Nav.Item>
                    ) : (
                      <div> </div>
                    )}
                    <Nav.Item>
                      <Nav.Link eventKey="netDiagram">
                        <div className="d-flex align-items-center">
                          <div className="mr-3">
                            <AccountTreeTwoToneIcon />
                          </div>
                          <div>Network Diagram</div>
                        </div>
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="allTasks">
                        <div className="d-flex align-items-center">
                          <div className="mr-3">
                            <ListAltTwoToneIcon />
                          </div>
                          <div>All Tasks</div>
                        </div>
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="Chat">
                        <div className="d-flex align-items-center">
                          <div className="mr-3">
                            <ChatIcon />
                          </div>
                          <div>Group Chat</div>
                        </div>
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="Posts">
                        <div className="d-flex align-items-center">
                          <div className="mr-3">
                            <PhotoLibraryIcon />
                          </div>
                          <div>Posts</div>
                        </div>
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </div>
              </div>
            </Col>
            <Col sm={10}>
              <Tab.Content>
                <Tab.Pane eventKey="teamInfo">
                  <div className="card card-stretch">
                    <div className="card-header">
                      <div className="card-title align-items-start flex-column">
                        <h4 className="card-label font-weight-bolder text-dark">
                          Team Information
                        </h4>
                        <span className="text-muted font-weight-bold font-size-sm mt-1">
                          Analysis of the tasks and time required displayed
                          here.
                        </span>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="col mb-4">
                        {/* {console.log(project.completion_percentage)} */}
                        <div className="d-flex align-items-center justify-content-between flex-wrap">
                          <div className="mr-3">
                            <div className="d-flex align-items-center text-dark font-size-h5 font-weight-bold mr-3">
                              {project.title}
                            </div>
                            <div className="d-flex flex-wrap my-2">
                              <Link
                                to="#"
                                className="text-muted text-hover-primary font-weight-bold mr-lg-8 mr-5 mb-lg-0 mb-2"
                              >
                                {leaderName}
                              </Link>
                            </div>
                          </div>
                        </div>
                        <div className="flex-grow-1 font-weight-bold font-size-h6 py-5 py-lg-2 mr-5">
                          {project.description}
                        </div>
                        <div className="flex-grow-1 font-weight-bold font-size-h6 py-5 py-lg-2 mr-5">
                          {project.skills.map((skill) => (
                            <span class="btn btn-light-info btn-sm font-weight-bold btn-upper btn-text m-1">
                              {skill}
                            </span>
                          ))}
                        </div>
                        <table className="table table-light">
                          <thead>
                            <tr>
                              <th key={"rolename"}>Role Name</th>
                              <th key={"skills"}>Skills Required</th>
                              <th key={"assigned"}>Assigned To</th>
                              <th key={"invite"}>Send Invite</th>
                            </tr>
                          </thead>
                          <tbody>
                            {project.roles.map((role) => (
                              <>
                                <tr key={role._id.toString()}>
                                  <td
                                    key={
                                      role._id.toString() +
                                      role.roleName.toString()
                                    }
                                  >
                                    {role.roleName}
                                  </td>
                                  <td
                                    key={
                                      role._id.toString() +
                                      role.roleSkills.toString()
                                    }
                                  >
                                    {role.roleSkills.join(", ")}
                                  </td>
                                  <td>
                                    {project.leader === getCurrentUser()._id &&
                                      role.assignedTo === undefined ? (
                                      <div>
                                        <RoleReq
                                          requestBy={role.requestBy}
                                          projectId={project._id}
                                          roleId={role._id}
                                        />
                                      </div>
                                    ) : (
                                      <div>
                                        <AssignedTo id={role.assignedTo} />
                                      </div>
                                    )}
                                  </td>
                                  <td>
                                    {getCurrentUser()._id === project.leader &&
                                      role.assignedTo === undefined ? (
                                      <button className="btn btn-info">
                                        <RecommendedRolePeople
                                          project={project}
                                          role={role}
                                        />
                                      </button>
                                    ) : (
                                      <></>
                                    )}
                                  </td>
                                </tr>
                              </>
                            ))}
                          </tbody>
                        </table>
                        {getCurrentUser()._id === project.leader ? (
                          <UserRecommendation project={project} />
                        ) : (
                          <div></div>
                        )}
                      </div>
                    </div>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="projStats">
                  <div className="card card-stretch  projectDashboard">
                    <div className="card-header">
                      <div className="card-title align-items-start flex-column">
                        <h4 className="card-label font-weight-bolder text-dark">
                          Project Stats
                        </h4>
                        <span className="text-muted font-weight-bold font-size-sm mt-1">
                          Analysis of the tasks and time required displayed
                          here.
                        </span>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="flex-row-fluid mb-7">
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
                            {project.completion_percentage}%
                          </span>
                        </div>
                      </div>
                      {/* <h4>No. of days:</h4>
                      <span>{duration}</span>
                      <h4>Estimated date:</h4>
                      <span>{expectedDate.format("DD-MM-YYYY")}</span> */}
                      {slacks !== undefined ? (
                        <>
                          {/* <h4>Tasks that can be slacked On:</h4>
                          <div>{this.renderSlacks(slacks)}</div> */}
                        </>
                      ) : (
                        <></>
                      )}
                      <div>
                        {/* <div>
                          <h4>Critical Path:</h4>
                        </div>
                        <div>
                          {pert.criticalPath !== undefined &&
                          criticalPath !== undefined ? (
                            this.renderCriticalPath(
                              pert.criticalPath,
                              criticalPath
                            )
                          ) : (
                            <></>
                          )}
                        </div> */}
                      </div>
                      <div className="row">
                        <div className="col-md-4">
                          <div className="d-flex align-items-center mb-9 bg-light-primary rounded p-5">
                            <div className="d-flex flex-column flex-grow-1 mr-2">
                              <div className="font-weight-bold text-dark-100 font-size-lg mb-1">
                                Start Date:
                              </div>
                            </div>
                            <span className="font-weight-bolder text-primary py-1 font-size-lg">
                              {/* {moment(project.created).format("DD-MM-YYYY")} */}
                              {typeof projectStats.firstLayer.startDate ===
                                "string"
                                ? projectStats.firstLayer.startDate
                                : moment(
                                  projectStats.firstLayer.startDate
                                ).format("DD-MM-YYYY")}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="d-flex align-items-center mb-9 bg-light-warning rounded p-5">
                            <div className="d-flex flex-column flex-grow-1 mr-2">
                              <div className="font-weight-bold text-dark-100 font-size-lg mb-1">
                                Days Left:{" "}
                              </div>
                            </div>
                            <span className="font-weight-bolder text-warning py-1 font-size-lg">
                              {/* {duration} */}
                              {projectStats.firstLayer.daysLeft < 0 ? (
                                <>
                                  <span className="btn btn-light-danger btn-sm font-weight-bold btn-upper btn-text">
                                    {Math.abs(projectStats.firstLayer.daysLeft)}{" "}
                                    Days Overdue
                                  </span>
                                </>
                              ) : (
                                projectStats.firstLayer.daysLeft
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="d-flex align-items-center mb-9 bg-light-danger rounded p-5">
                            <div className="d-flex flex-column flex-grow-1 mr-2">
                              <div className="font-weight-bold text-dark-100 font-size-lg mb-1">
                                End Date:{" "}
                              </div>
                            </div>
                            <span className="font-weight-bolder text-danger py-1 font-size-lg">
                              {/* {expectedDate.format("DD-MM-YYYY")} */}
                              {typeof projectStats.firstLayer.endDate ===
                                "string"
                                ? projectStats.firstLayer.endDate
                                : moment(
                                  projectStats.firstLayer.endDate
                                ).format("DD-MM-YYYY")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-3">
                          <div className="d-flex align-items-center mb-9 bg-light-primary rounded p-5">
                            <div className="d-flex flex-column flex-grow-1 mr-2">
                              <div className="font-weight-bold text-dark-100 font-size-lg mb-1">
                                To Do Tasks:{" "}
                              </div>
                            </div>
                            <span className="font-weight-bolder text-primary py-1 font-size-lg">
                              {/* {this.state.count1} */}
                              {projectStats.firstLayer.toDoTasks}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="d-flex align-items-center mb-9 bg-light-info rounded p-5">
                            <div className="d-flex flex-column flex-grow-1 mr-2">
                              <div className="font-weight-bold text-dark-100 font-size-lg mb-1">
                                Ongoing Tasks:{" "}
                              </div>
                            </div>
                            <span className="font-weight-bolder text-info py-1 font-size-lg">
                              {/* {this.state.count2} */}
                              {projectStats.firstLayer.onGoingTasks}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="d-flex align-items-center mb-9 bg-light-warning rounded p-5">
                            <div className="d-flex flex-column flex-grow-1 mr-2">
                              <div className="font-weight-bold text-dark-100 font-size-lg mb-1">
                                Reviewing Tasks:{" "}
                              </div>
                            </div>
                            <span className="font-weight-bolder text-warning py-1 font-size-lg">
                              {/* {this.state.count3} */}
                              {projectStats.firstLayer.reviewingTasks}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="d-flex align-items-center mb-9 bg-light-success rounded p-5">
                            <div className="d-flex flex-column flex-grow-1 mr-2">
                              <div className="font-weight-bold text-dark-100 font-size-lg mb-1">
                                Completed Tasks:{" "}
                              </div>
                            </div>
                            <span className="font-weight-bolder text-success py-1 font-size-lg">
                              {/* {this.state.count4} */}
                              {projectStats.firstLayer.completedTasks}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="border-top my-5"></div>
                      <h4>Tasks of high priority</h4>
                      <p className="text-muted">
                        These tasks have to be competed within due date to
                        ensure that the project gets completed on time
                      </p>
                      <div className="row row-cols-1 row-cols-md-3">
                        {pert.criticalPath !== undefined &&
                          criticalPath !== undefined ? (
                          this.renderCriticalPath(
                            pert.criticalPath,
                            criticalPath
                          )
                        ) : (
                          <></>
                        )}
                      </div>
                      <div className="border-top my-5"></div>
                      <h4>Tasks that have Slack Time</h4>
                      <p className="text-muted">
                        The following tasks have more time than initially
                        assigned
                      </p>
                      <div className="row row-cols-1 row-cols-md-3">
                        {this.renderSlacks(slacks)}
                      </div>
                    </div>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="netDiagram">
                  <div className="card card-stretch">
                    <div className="card-header">
                      <div className="card-title align-items-start flex-column">
                        <h4 className="card-label font-weight-bolder text-dark">
                          Network Diagram
                        </h4>
                        <span className="text-muted font-weight-bold font-size-sm mt-1">
                          Task dependency diagram.
                        </span>
                      </div>
                    </div>
                    <div className="card-body">
                      <LayoutComponent project={project} />
                    </div>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="allTasks">
                  <div className="card card-stretch">
                    <div className="card-header">
                      <div className="card-title align-items-start flex-column">
                        <h4 className="card-label font-weight-bolder text-dark">
                          Tasks Board
                        </h4>
                        <span className="text-muted font-weight-bold font-size-sm mt-1">
                          Complete allocated tasks.
                        </span>
                      </div>
                    </div>
                    <div className="card-body">
                      <TrelloTask
                        projectId={project._id}
                        status={project.status}
                      />
                    </div>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="addTask">
                  <div className="card card-stretch">
                    <div className="card-header">
                      <div className="card-title align-items-start flex-column">
                        <h4 className="card-label font-weight-bolder text-dark">
                          Create Task
                        </h4>
                        <span className="text-muted font-weight-bold font-size-sm mt-1">
                          Add Tasks and allocate to memebers.
                        </span>
                      </div>
                    </div>
                    <div className="card-body">
                      <AddTask projectId={project._id} />
                    </div>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="Chat">
                  <div className="card card-stretch">
                    <div className="card-header">
                      <div className="card-title align-items-start flex-column">
                        <h4 className="card-label font-weight-bolder text-dark">
                          Group Chat
                        </h4>
                        <span className="text-muted font-weight-bold font-size-sm mt-1">
                          Interact with your Project-mates.
                        </span>
                      </div>
                    </div>
                    <div className="card-body">
                      <Chat projectId={project._id} status={project.status} />
                    </div>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="Posts">
                  <div className="card card-stretch">
                    <div className="card-header">
                      <div className="card-title align-items-start flex-column">
                        <h4 className="card-label font-weight-bolder text-dark">
                          Posts
                        </h4>
                        <span className="text-muted font-weight-bold font-size-sm mt-1">
                          News Feed (Posts) will be here
                        </span>
                      </div>
                    </div>
                    <div className="card-body">
                      {posts !== undefined &&
                        posts.map((post) => {
                          if (
                            post.project !== undefined &&
                            post.project.toString() === project._id.toString()
                          ) {
                            // console.log(post.project, project._id);
                            if (post.postType === "video")
                              return (
                                <VideoPost
                                  headerText={post.title}
                                  footerText={"by " + post.postedBy.name}
                                  cardText={post.video}
                                  videoUrl={post.video}
                                  liked_by={post.liked_by}
                                  _id={post._id}
                                  comments={post.comments}
                                  tags={post.tags}
                                  postedBy={post.postedBy}
                                />
                              );
                            if (post.postType === "image")
                              return (
                                <Post
                                  headerText={post.title}
                                  footerText={"by " + post.postedBy.name}
                                  cardText={post.photo}
                                  imageUrl={post.photo}
                                  liked_by={post.liked_by}
                                  _id={post._id}
                                  comments={post.comments}
                                  tags={post.tags}
                                  postedBy={post.postedBy}
                                />
                              );
                          }
                        })}
                    </div>
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </div>
    );
  }
}
const mapStateToProps = (state) => ({
  tasks: state.tasks.tasks,
  pert: state.cpm.pert,
  connections: state.cpm.connections,
  expectedTime: state.cpm.expectedTime,
  slacks: state.cpm.slacks,
  criticalPath: state.cpm.criticalPath,
  projectStats: state.projectStats,
  allIdPertData: state.cpm.allIdPertData,
  idFromKeyObject: state.cpm.idFromKeyObject,
});

const mapDispatchToProps = (dispatch) => ({
  updateTasks: (params) => dispatch(updateTasks(params)),
  clearAll: () => dispatch(clearAll()),
  setFirstLayer: (params) => dispatch(setFirstLayer(params)),
  clearFirstLayer: () => dispatch(clearFirstLayer()),
  setSecondLayer: (params) => dispatch(setSecondLayer(params)),
  clearSecondLayer: () => dispatch(clearSecondLayer()),
  setThirdLayer: (params) => dispatch(setThirdLayer(params)),
  clearThirdLayer: () => dispatch(clearThirdLayer()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectDashboard);
