import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Modal } from "react-bootstrap";
import { connect } from "react-redux";
import Pert from "./Pert";
import Task from "./Task";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  removeElements,
} from "react-flow-renderer";
import {
  addTask,
  getTasks,
  putConnections,
  deleteConnections,
  getConnections,
  putPredecessors,
  putPosition,
  putExpectedTime,
  addToKickOutCounter,
} from "../apiProject";
import jsPERT from "js-pert";
import { Button } from "@material-ui/core";
import {
  nodeAdded,
  connectionAdded,
  replaceNodes,
  replaceConnections,
  replaceElements,
  setPert,
  setExpectedTime,
  setSlacks,
  setCriticalPath,
  setAllIdPertData,
  setIdFromKey,
} from "../../store/cpm";
import { notificationAdded } from "../../store/notifications";
import { updateTasks } from "../../store/tasks";
import { getCurrentUser, getUserById } from "./../../user/apiUser";
import moment from "moment";
import { toast, ToastContainer } from "react-toastify";
const styles = (theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 3, 3),
  },
});
class LayoutComponent extends Component {
  state = {
    elements: [],
    tasks: [],
    nodes: [],
    kickoutusers: [],
    pert: {},
    task: {},
    show: false,
    checked: false,
    bleh: 1,
  };

  onElementsRemove = (elementsToRemove) => {
    if (this.props.project.leader.toString() === getCurrentUser()._id) {
      let cons = this.props.connections;
      const filteredConnections = cons.filter(
        (con) => con.id !== elementsToRemove[0].id
      );
      this.props.replaceConnections({ connections: filteredConnections });
      cons.map((con) => {
        if (con.id === elementsToRemove[0].id) {
          // console.log(con.id, elementsToRemove[0].id);
          deleteConnections(this.props.project._id, con._id).then((data) => {
            console.log("connection deleted");
            // this.pertCalc();
          });
          return;
        }
      });
    }
  };
  onLoad = (reactFlowInstance) => {
    reactFlowInstance.fitView();
  };
  onNodeDragStop = (e, node) => {
    // console.log(node.position, node.data._id);
    putPosition(this.props.project._id, node.data._id, node.position).then(
      () => {
        console.log(node.position + " is saved");
      }
    );
  };
  edgeInElements(elements, edge) {
    let inside = false;
    elements.map((elem) => {
      if (elem.id.toString() === edge.id.toString()) {
        inside = true;
      }
      return "done";
    });
    return inside;
  }
  onConnect = (params) => {
    if (this.props.project.leader.toString() === getCurrentUser()._id) {
      let source = params.source;
      let target = params.target;
      if (source !== undefined && target !== undefined) {
        let edge = {
          id:
            "reactflow__edge-" +
            source.toString() +
            "null-" +
            target.toString() +
            "null",
          source: source.toString(),
          sourceHandle: null,
          target: target.toString(),
          targetHandle: null,
        };
        // console.log(this.state.elements);
        let sourceId = "";
        let targetId = "";
        // console.log(this.props.nodes);
        this.props.nodes.map((elem) => {
          if (elem.id === source) {
            sourceId = elem.key;
          }
          if (elem.id === target) {
            targetId = elem.key;
          }
        });
        putPredecessors(this.props.project._id, targetId, sourceId).then(() => {
          console.log(sourceId + " has new Predecessor " + targetId);
        });
        // let ele = [...this.state.elements];
        // if (!this.edgeInElements(ele, edge)) {
        //   ele.push(edge);
        putConnections(this.props.project._id, sourceId, targetId).then(() => {
          console.log("connection " + sourceId + "to " + targetId + "added");
        });
        // }
        this.props.connectionAdded({ connection: edge });
        // this.setState({ elements: ele });
        // console.log(this.state.elements);
        this.pertCalc();
      }
    }
  };
  getIdOfObjectId = (elemId) => {
    let id = {};
    const { nodes } = this.props;
    id = nodes.map((elem) => {
      if (elem.data !== undefined)
        if (elem.data._id.toString() === elemId) {
          id = elem.id;
        }
      return id;
    });
    return id[id.length - 1];
  };
  // handleClose = () => {
  //   this.setState({ show: false });
  // };
  pertCalc = async () => {
    // this.setState({ show: true });
    // console.log("inside pertCalc:", tasksObject);
    let nodes = this.props.nodes.map((elem) => ({
      ...elem,
    }));
    // let connections = this.props.connections.map((elem) => ({
    //   ...elem,
    // }));
    // console.log(connections);
    // let { connections } = this.props;
    // console.log("props:", this.props.connections);
    // console.log("connections:");
    let ids = [];
    let promises = await this.props.connections.map((connection) => {
      // console.log(connection.source, connection.target);
      if (connection.source.toString() === "1") ids.push("1");
      console.log(ids);
      if (ids.includes(connection.source.toString())) {
        if (!ids.includes(connection.source.toString())) {
          ids.push(connection.source.toString());
        }
        if (!ids.includes(connection.target.toString())) {
          ids.push(connection.target.toString());
        }
      }
      return ids;
    });

    let result = await Promise.all(promises);
    // console.log(result, this.props.connections);
    // console.log("nodes:");
    let newNodes = [];
    nodes.map((node) => {
      if (ids.includes(node.id)) newNodes.push(node);
    });
    console.log(newNodes);
    let tasksObject = ids.includes("1")
      ? {
        1: {
          id: "1",
          mostLikelyTime: 0,
          optimisticTime: 0,
          pessimisticTime: 0,
          predecessors: [],
        },
      }
      : {};
    // console.log("TasksObject before node addition:", tasksObject);
    // console.log(ids);
    // console.log("nodes sent for pertcalc:", newNodes);
    newNodes.map((elem) => {
      if (
        elem.data.predecessors.length === 0 ||
        elem.data.predecessors === undefined
      )
        return;
      elem.data.predecessors.map((pre, index) => {
        let id = this.getIdOfObjectId(pre.toString());
        // console.log(id);
        let predecessors = [...elem.data.predecessors];
        predecessors[index] = id.toString();
        elem.data = { ...elem.data, predecessors };
      });
    });
    // console.log(nodes);
    tasksObject = newNodes.map((elem) => {
      // console.log("tasksObject node:", elem);
      tasksObject[elem.id.toString()] = {
        id: elem.id.toString(),
        optimisticTime: elem.data.optimistic,
        mostLikelyTime: elem.data.time,
        pessimisticTime: elem.data.pessimistic,
        predecessors: elem.data.predecessors,
      };
      return tasksObject;
    });
    let tasksObjectFinal = tasksObject[tasksObject.length - 1];
    // console.log("TasksObject:");
    // console.log("taskObject:", tasksObjectFinal);
    // console.log("Pert:");
    let pert = {};
    // console.log("gonna set pert");
    try {
      // if (tasksObject[1] !== undefined) {
      // console.log(tasksObject[1]);
      console.log(tasksObjectFinal);
      pert = jsPERT(tasksObjectFinal);
      this.props.setPert({ pert });
      console.log(this.props.pert);
      // this.props.setSlacks({ slackObject: this.props.pert.slack });
      // console.log("slacks:");
      console.log("Newnodes for slack:", newNodes);
      let slackObject = {};
      slackObject = newNodes.map((elem, index) => {
        // console.log(elem.id, pert.slack[elem.id]);
        if (index !== 0 && index !== 1) {
          // console.log("Slack elem:", elem);                           // Website design layout
          console.log("index:", index);
          console.log("task:", elem.data.label);
          let created = elem.data.created;

          // let earliestFinish = new Date(
          //   pert.earliestFinishTimes[index] + created
          // ); // 23/5 + 3
          let createdDate = new Date(created);
          let earliestFinish = moment(createdDate, "DD-MM-YYYY").add(
            pert.earliestFinishTimes[index + 1],
            "days"
          );
          earliestFinish = earliestFinish._d;
          // let slack = new Date(pert.slack[elem.id]);
          const diffTime = Math.abs(earliestFinish - createdDate);
          const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          // console.log(duration);
          let today = new Date();
          let todayDate = new Date(today.toUTCString()); // 25/5
          let earliestStart = moment(createdDate, "DD-MM-YYYY").add(
            +pert.earliestStartTimes[index + 1],
            "days"
          );
          earliestStart = earliestStart._d;
          // console.log(todayDate, startTime._d);
          const diffTime2 = Math.abs(todayDate - earliestStart);
          let daysDone = Math.ceil(diffTime2 / (1000 * 60 * 60 * 24));
          // console.log(daysDone);
          let finaldiff = Math.abs(duration - daysDone);
          let days = Math.round(
            (earliestFinish - todayDate) / (1000 * 60 * 60 * 24)
          );
          console.log(earliestStart, todayDate, earliestFinish);
          console.log(
            "no. of days done:",
            Math.round(todayDate - earliestStart) / (1000 * 60 * 60 * 24)
          );
          console.log(
            "no. of days left:",
            Math.round((earliestFinish - todayDate) / (1000 * 60 * 60 * 24))
          );
          days = pert.slack[elem.id] !== 0 ? days + pert.slack[elem.id] : days;
          // 23/5 25/5 26/5
          // console.log("slack:", pert.slack[elem.id]);
          // console.log("day1:", duration);
          // console.log("day2:", daysDone);
          // console.log("days left:", days);
          // console.log("Overdue", days >= 0 ? false : true);
          // console.log(elem.data.label + " " + days + " " + pert.slack[elem.id]);
          // console.log(days < 0 ? "overdue" : "not");
          if (days < 0) {
            // console.log("overdue:", days);
            elem.data.assignedTo.map((person, i) => {
              addToKickOutCounter(
                elem.key,
                person,
                this.props.project._id
              ).then((data) => {
                if (i === elem.data.assignedTo.length - 1) {
                  // console.log(data.result.overdueCounter);
                  let overdues = data.result.overdueCounter;
                  console.log(overdues);
                  let { kickoutusers } = this.state;
                  Object.keys(overdues).map(async (user) => {
                    if (
                      overdues[user].length === 3 &&
                      user !== this.props.project.leader &&
                      !kickoutusers.includes(user)
                    ) {
                      console.log("time to kick out +_+");
                      let userObj = await getUserById(user);
                      // console.log(userObj);
                      let username = userObj.user.name;
                      // console.log();
                      kickoutusers.push(user);
                      this.setState({ kickoutusers });
                      this.props.notificationAdded({
                        userId: getCurrentUser()._id,
                        message: `3 hits, time to kick out ${username} in ${this.props.project.title}`,
                        type: "KickOutUser",
                        userObjId: user,
                        project: this.props.project,
                      });
                      toast.error(`Warning : 3 overdues by ${username}`);
                    }
                  });
                }
              });
            });
          }
          slackObject[elem.data.label] = {
            id: elem.data._id,
            slack: pert.slack[elem.id],
            days: days,
            daysPassed: Math.round(
              (todayDate - earliestStart) / (1000 * 60 * 60 * 24)
            ),
            earliestStartDate: earliestStart,
            todayDate: todayDate,
            earliestFinishDate: earliestFinish,
            overdue: days >= 0 ? false : true,
          };
          return slackObject;
        }
      });
      console.log("slacks Object:", slackObject[slackObject.length - 1]);
      let obj = slackObject[slackObject.length - 1];
      this.props.setSlacks({ slackObject: obj });

      let newNodesKeyObject = {};
      newNodesKeyObject = newNodes.map((node) => {
        newNodesKeyObject[node.key] = node.id;
        return newNodesKeyObject;
      });
      newNodesKeyObject = newNodesKeyObject[newNodesKeyObject.length - 1];
      // console.log("newNodesKeysObject:", newNodesKeyObject);
      this.props.setIdFromKey({ idFromKeyObject: newNodesKeyObject });

      let newNodesIdObject = {};
      newNodesIdObject = newNodes.map((node) => {
        newNodesIdObject[node.id] = node.data;
        return newNodesIdObject;
      });
      newNodesIdObject = newNodesIdObject[newNodesIdObject.length - 1];
      // console.log("newNodes:", newNodes);
      // console.log("newNodesObject:", newNodesObject);
      let criticalPathData = {};
      criticalPathData = pert.criticalPath.map((id) => {
        criticalPathData[id] = newNodesIdObject[id];
        return criticalPathData;
      });
      criticalPathData = criticalPathData[criticalPathData.length - 1];
      console.log("Objects available:", newNodesIdObject, newNodesKeyObject);
      // console.log("criticalPathDataObject:", criticalPathData);

      // let pertValues = {};
      // const promises = pert.criticalPath.map((id) => {
      //   let obj = {
      //     earliestStart: pert.earliestStartTimes[id],
      //     earliestFinish: pert.earliestFinishTimes[id],
      //     latestStart: pert.latestStartTimes[id],
      //     latestFinish: pert.latestFinishTimes[id],
      //     slack: pert.slack[id],
      //     expectedTime: pert.activityParams[id].expectedTime,
      //     variance: pert.activityParams[id].variance,
      //   };
      //   pertValues[newNodesIdObject[id]._id] = obj;
      //   return pertValues;
      // });
      // pertValues = await Promise.all(promises);
      let pertValues = {};
      pertValues["criticalPath"] = pert.criticalPath;
      let promises = await Object.keys(pert.network).map((key, index) => {
        if (key !== "__start" && key !== "__end") {
          // console.log(key);
          // console.log(pert.earliestFinishTimes);
          pertValues[key] = {
            expectedTime: pert.activitiesParams[key].expectedTime,
            variance: pert.activitiesParams[key].variance,
            earliestFinish: pert.earliestFinishTimes[key],
            earliestStart: pert.earliestStartTimes[key],
            latestFinish: pert.latestFinishTimes[key],
            latestStart: pert.latestStartTimes[key],
            network: pert.network[key],
            slack: pert.slack[key],
          };
          // if (index === Object.keys(pert.network).length - 3) return pertValues;
        }
        return pertValues;
      });
      let data = promises[promises.length - 1];
      // console.log("all pert:", pert);
      this.props.setCriticalPath({ criticalPath: criticalPathData });

      this.props.setExpectedTime({
        expectedTime: Math.floor(this.props.pert.latestFinishTimes.__end),
      });

      this.props.setAllIdPertData({ pertData: data });
      putExpectedTime(
        this.props.project._id,
        Math.floor(this.props.pert.latestFinishTimes.__end)
      );
      // }
    } catch (err) {
      // console.log(err);
      this.props.setPert({ pert: {} });
      // console.log(this.props.pert);
      this.props.setExpectedTime({
        expectedTime: 0,
      });
      putExpectedTime(this.props.project._id, 0);
    }
    // this.setState({ pert });
  };
  onElementClick = (event, element) => {
    console.log(element);
  };
  componentDidMount() {
    let newNodes = [];

    getTasks(this.props.project._id).then((data) => {
      // console.log(data.tasks);
      const tasks = data.tasks;
      let newTasks = [];
      if (tasks === undefined)
        return;
      tasks.map((task) => {
        newTasks.push({ ...task });
      });
      newTasks.map((task) => {
        task["label"] = task.taskName;
        task["description"] = task.description;
        task["time"] = task.mostLikelyTime;
        task["optimistic"] = task.optimisticTime;
        task["pessimistic"] = task.pessimisticTime;
        if (
          task.taskName !== "Completed!!" &&
          task.taskName !== "Lets Start Working"
        ) {
          let newNode = {
            key: task._id,
            id: (newNodes.length + 1).toString(),
            data: task,
            sourcePosition: "right",
            targetPosition: "left",
            position:
              task.position !== undefined
                ? task.position
                : {
                  x: (Math.random() * window.innerWidth) / 2,
                  y: (Math.random() * window.innerHeight) / 2,
                },
          };
          newNodes.push(newNode);
        }
        if (task.taskName === "Lets Start Working") {
          let ele = [...this.state.elements];
          let newNode = {
            key: task._id,
            id: "1",
            type: "input",
            data: {
              label: "Lets Start Working",
              description: "Start working on tasks to complete project on time",
              pessimistic: 0,
              time: 0,
              optimistic: 0,
              predecessors: [],
              _id: task._id,
            },
            sourcePosition: "right",
            position:
              task.position !== undefined ? task.position : { x: 0, y: 0 },
          };
          newNodes.push(newNode);
        }
        if (task.taskName === "Completed!!") {
          let ele = [...this.state.elements];
          let newNode = {
            key: task._id,
            id: "2",
            type: "output",
            data: {
              label: "Completed!!",
              description: "Yaaayy you gus have completed the project",
              pessimistic: 0,
              time: 0,
              optimistic: 0,
              predecessors: task.predecessors,
              _id: task._id,
            },
            targetPosition: "left",
            position:
              task.position !== undefined ? task.position : { x: 500, y: 0 },
          };
          newNodes.push(newNode);
        }
      });
      this.props.replaceNodes({ nodes: newNodes });
      // console.log("Mount nodes:", this.props.nodes);
    });
    getConnections(this.props.project._id)
      .then((data) => {
        let connections = [];
        data.connections.map((link) => {
          newNodes.map((elem) => {
            if (elem.key !== undefined) {
              if (link.from.toString() === elem.key.toString()) {
                this.setState({ source: elem });
              }
              if (link.to.toString() === elem.key.toString()) {
                this.setState({ target: elem });
              }
            }
          });
          let source = this.state.source;
          let target = this.state.target;
          if (source !== undefined && target !== undefined) {
            let edge = {
              id:
                "reactflow__edge-" +
                source.id.toString() +
                "null-" +
                target.id.toString() +
                "null",
              source: source.id.toString(),
              sourceHandle: null,
              target: target.id.toString(),
              targetHandle: null,
              _id: link._id,
            };
            connections.push(edge);
          }
          return "done";
        });
        // console.log(connections);
        this.props.replaceConnections({ connections: connections });
      })
      .then(() => {
        this.pertCalc();
      });
  }
  componentDidUpdate(prevState, prevProps) {
    if (this.props.connections.length !== prevState.connections.length) {
      this.pertCalc();
      // console.log(prevState.connections.length, this.props.connections.length);
      // console.log("Pert from comp update:", this.props.pert);
      // console.log("Pert calculation nodes:", this.props.nodes);
    }
    if (prevState.tasks !== undefined && this.props.tasks !== undefined && prevState.tasks.length !== this.props.tasks.length) {
      const { tasks } = this.props;
      let newTasks = [];
      tasks.map((task) => {
        newTasks.push({ ...task });
      });
      let newNodes = [];
      newTasks.map((task) => {
        task["label"] = task.taskName;
        task["description"] = task.description;
        task["time"] = task.mostLikelyTime;
        task["optimistic"] = task.optimisticTime;
        task["pessimistic"] = task.pessimisticTime;
        if (
          task.taskName !== "Completed!!" &&
          task.taskName !== "Lets Start Working"
        ) {
          let newNode = {
            key: task._id,
            id: (newNodes.length + 1).toString(),
            data: task,
            sourcePosition: "right",
            targetPosition: "left",
            position:
              task.position !== undefined
                ? task.position
                : {
                  x: (Math.random() * window.innerWidth) / 2,
                  y: (Math.random() * window.innerHeight) / 2,
                },
          };
          newNodes.push(newNode);
        }
        if (task.taskName === "Lets Start Working") {
          let ele = [...this.state.elements];
          let newNode = {
            key: task._id,
            id: "1",
            type: "input",
            data: {
              label: "Lets Start Working",
              description: "Start working on tasks to complete project on time",
              pessimistic: 0,
              time: 0,
              optimistic: 0,
              predecessors: [],
              _id: task._id,
            },
            sourcePosition: "right",
            position:
              task.position !== undefined ? task.position : { x: 0, y: 0 },
          };
          newNodes.push(newNode);
        }
        if (task.taskName === "Completed!!") {
          let ele = [...this.state.elements];
          let newNode = {
            key: task._id,
            id: "2",
            type: "output",
            data: {
              label: "Completed!!",
              description: "Yaaayy you gus have completed the project",
              pessimistic: 0,
              time: 0,
              optimistic: 0,
              predecessors: task.predecessors,
              _id: task._id,
            },
            targetPosition: "left",
            position:
              task.position !== undefined ? task.position : { x: 500, y: 0 },
          };
          newNodes.push(newNode);
        }
      });
      this.props.replaceNodes({ nodes: newNodes });
      if (this.props.connections.length === 0) {
        getConnections(this.props.project._id)
          .then((data) => {
            let connections = [];
            data.connections.map((link) => {
              newNodes.map((elem) => {
                if (elem.key !== undefined) {
                  if (link.from.toString() === elem.key.toString()) {
                    this.setState({ source: elem });
                  }
                  if (link.to.toString() === elem.key.toString()) {
                    this.setState({ target: elem });
                  }
                }
              });
              let source = this.state.source;
              let target = this.state.target;
              let edge = {
                id:
                  "reactflow__edge-" +
                  source.id.toString() +
                  "null-" +
                  target.id.toString() +
                  "null",
                source: source.id.toString(),
                sourceHandle: null,
                target: target.id.toString(),
                targetHandle: null,
                _id: link._id,
              };
              connections.push(edge);

              return "done";
            });
            // console.log(connections);
            this.props.replaceConnections({ connections: connections });
          })
          .then(() => {
            this.pertCalc();
          });
      }
    }
  }
  render() {
    if (this.props.tasks === undefined || this.props.tasks.length === 0) return <div>No tasks</div>;
    const { nodes, connections, tasks } = this.props;
    const { status } = this.props.project;
    let connectCheck = status === "Completed" ? false : true;
    const elements = [];
    nodes.map((node) => {
      elements.push({ ...node });
    });
    connections.map((connection) => {
      elements.push({ ...connection });
    });
    // console.log("nodes:", nodes);
    return (
      <div>
        {/* <ToastContainer /> */}
        <div className="container-fluid">
          <ReactFlow
            elements={elements}
            onLoad={this.onLoad}
            style={{
              width: "100%",
              height: "65vh",
              backgroundColor: "#1A192B",
            }}
            onNodeDragStop={this.onNodeDragStop}
            onConnect={this.onConnect}
            onElementClick={this.onElementClick}
            onElementsRemove={this.onElementsRemove}
            connectionLineStyle={{ stroke: "#ddd", strokeWidth: 2 }}
            connectionLineType="bezier"
            snapToGrid={true}
            snapGrid={[16, 16]}
            nodesConnectable={connectCheck}
            nodesDraggable={connectCheck}
            defaultZoom={1}
          >
            <Background color="#888" gap={16} />
            <MiniMap
              nodeColor={(n) => {
                if (n.type === "input") return "#DC143C";
                if (n.type === "output") return "#90ee90";
                return "cyan";
              }}
            />
            <Controls />
          </ReactFlow>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  nodes: state.cpm.nodes,
  connections: state.cpm.connections,
  state: state,
  notifications: state.notifications.notifications,
  tasks: state.tasks.tasks,
  elements: state.cpm.elements,
  pert: state.cpm.pert,
  slacks: state.cpm.slacks,
  criticalPath: state.cpm.criticalPath,
});

const mapDispatchToProps = (dispatch) => ({
  nodeAdded: (params) => dispatch(nodeAdded(params)),
  connectionAdded: (params) => dispatch(connectionAdded(params)),
  updateTasks: (params) => dispatch(updateTasks(params)),
  replaceNodes: (params) => dispatch(replaceNodes(params)),
  replaceConnections: (params) => dispatch(replaceConnections(params)),
  replaceElements: (params) => dispatch(replaceElements(params)),
  setPert: (params) => dispatch(setPert(params)),
  setExpectedTime: (params) => dispatch(setExpectedTime(params)),
  setSlacks: (params) => dispatch(setSlacks(params)),
  setCriticalPath: (params) => dispatch(setCriticalPath(params)),
  notificationAdded: (params) => dispatch(notificationAdded(params)),
  setAllIdPertData: (params) => dispatch(setAllIdPertData(params)),
  setIdFromKey: (params) => dispatch(setIdFromKey(params)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(LayoutComponent));
