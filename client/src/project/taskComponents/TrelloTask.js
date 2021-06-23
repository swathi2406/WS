import React, { Component } from "react";
import { getConnections, listmytasks, getTasks } from "../apiProject";
import { getCurrentUser } from "./../../user/apiUser";
import { updateTask } from "./../apiProject";
import Board from "react-trello";
import { deleteTask } from "../apiProject";
import { connect } from "react-redux";
import { updateTasks, updateTrello } from "./../../store/tasks";
import { toast, ToastContainer } from "react-toastify";
import EditModel from "./EditModel";
import moment from "moment";
import { replaceConnections, replaceNodes } from "../../store/cpm";

let data = {};
let projleader = "";
let tasks = [];
let projectId = "";

class TrelloTask extends Component {
  state = {
    mytasks: [],
    boardData: { lanes: [] },
    editable: true,
    isleader: false,
    show: false,
    alltasks: [],
    elements: [],
    cardId: "",
    currentTask: {},
    flag: false,
  };
  setEventBus = (eventBus) => {
    this.setState({ eventBus });
  };
  handleDragStart = (cardId, laneId) => {
    this.setState({
      flag: false,
    });
    console.log("drag started");
    if (tasks === {}) return;
    tasks.forEach((task) => {
      if (task.id === cardId) {
        // console.log(getCurrentUser()._id)
        task.assigned.forEach((user) => {
          // console.log(user)
          if (user === getCurrentUser()._id)
            this.setState({
              flag: true,
            });
        });
      }
    });
    console.log(laneId);
    if (
      projleader === getCurrentUser()._id &&
      (laneId === "Review" || laneId === "COMPLETED")
    )
      this.setState({
        flag: true,
      });
  };
  handleDragEnd = (cardId, sourceLaneId, targetLaneId) => {
    console.log("drag ended");
    // this.updateBoard();
    if (sourceLaneId === targetLaneId) this.setState({ flag: true });

    if (this.state.flag === false) {
      alert(
        "Sry.. You are not allowed to do this operation.. Changes made will be resetted"
      );
      window.location.reload(false);
    }
  };
  onCardDelete = async (cardId, laneId) => {
    if (projleader === getCurrentUser()._id) {
      let response = window.confirm("Are you Sure?");
      if (response) {
        await deleteTask(cardId, projectId);
        // connections get from project

        await getTasks(projectId).then((data) => {
          this.props.updateTasks({ tasks: data.tasks });
          // console.log(data);
        });
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
        const { nodes } = this.props;
        let newNodes = [];
        nodes.map((node) => {
          if (ids.includes(node.id)) newNodes.push(node);
        });
        console.log(newNodes);
        await getConnections(projectId).then((data) => {
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
            console.log("source:", source);
            console.log("target:", target);
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
              connections.push({ ...edge });
              console.log("new Connections:", connections);
            }
            return "done";
          });
          // console.log(connections);
          this.props.replaceConnections({ connections: connections });
        });
        // this.updateBoard();
      } else {
        // toast.error("Gimme a second...", {
        //   position: "top-right",
        //   autoClose: 5000,
        //   hideProgressBar: false,
        //   closeOnClick: true,
        //   pauseOnHover: true,
        //   draggable: true,
        //   progress: undefined,
        // });
        window.location.reload();
      }
    } else {
      toast.warning(
        "You are not allowed to delete tasks.. Your action will be reverted.."
      );
      window.location.reload();
    }
  };
  async componentDidMount() {
    projectId = this.props.projectId;
    if (this.props.status === "Completed") {
      this.setState({
        editable: false,
      });
    }

    await listmytasks().then((data) => {
      let allproj = data.userProjects;
      allproj.forEach((proj) => {
        if (proj._id === this.props.projectId) {
          projleader = proj.leader;
          // this.setState({
          //   mytasks: proj.tasks,
          // });
          // console.log(this.state.mytasks)
        }
      });
    });
    getTasks(this.props.projectId).then((val) => {
      val.tasks.shift();
      val.tasks.shift();
      this.setState({ mytasks: val.tasks, alltasks: val.tasks });
      this.updateBoard();
    });
    if (getCurrentUser()._id === projleader)
      this.setState({
        isleader: true,
      });
  }
  showMe = () => {
    this.setState({ show: true });
  };
  hideMe = () => {
    this.setState({ show: false });
  };

  onCardClick = (cardId, metadata, laneId) => {
    const currentTask = this.props.tasks.find(({ _id }) => _id === cardId);
    this.setState({
      cardId: cardId,
      currentTask,
    });
    // console.log(this.state.currentTask);
    this.showMe();
  };

  get_card_label = (slackObject, task) => {
    let card_label = "";
    if (slackObject !== undefined && slackObject[task.taskName] !== undefined) {
      if (slackObject[task.taskName].days >= 0)
        card_label = slackObject[task.taskName].days + " days left";
      else {
        card_label =
          Math.abs(slackObject[task.taskName].days) + " days overdue";
      }
    } else card_label = task.mostLikelyTime + " days left";

    if (task.status === "COMPLETED") card_label = "Completed";
    if (task.status === "Review") card_label = "Reviewing";
    return card_label;
  };

  get_card_style = (slackObject, task) => {
    let color = "";
    // console.log(task.taskName, "Object:", slackObject[task.taskName]);
    if (
      slackObject !== undefined &&
      slackObject[task.taskName] !== undefined &&
      slackObject[task.taskName].overdue &&
      (task.status === "PLANNED" || task.status === "WIP")
    )
      color = "#ED2939";
    return color;
  };

  updateBoard = () => {
    const mytasks = this.state.mytasks;
    // console.log("slackObject:", this.props.slackObject);
    const { slackObject } = this.props;
    // console.log(mytasks);
    // console.log("mytasks:" + mytasks);
    let cards_planned = [];
    let cards_wip = [];
    let cards_review = [];
    let cards_completed = [];
    mytasks.forEach((task) => {
      // if (slackObject[task.taskName] !== undefined)
      //   console.log("Overdue:", slackObject[task.taskName].overdue);
      // let cardDescription =
      var card = {
        id: task._id,
        title: task.taskName,
        // label: this.get_card_label(slackObject, task),
        task_description: task.taskDescription,
        description: (
          <>
            <div className="lead">{task.taskDescription}</div>
            <p>{this.get_card_label(slackObject, task)}</p>
            {/* {slackObject[task.taskName].map((startDate) => (
              <p>{startDate.earliestStartDate}</p>
            ))} */}
            {/* <p>
              Start By:{" "}
              {moment(slackObject[task.taskName].earliestStartDate).format(
                "DD-MM-YYYY"
              )}
            </p>
            <p>
              Finish By:{" "}
              {moment(slackObject[task.taskName].earliestFinishDate).format(
                "DD-MM-YYYY"
              )}
            </p> */}
          </>
        ),
        pessimisticTime: task.pessimisticTime,
        optimisticTime: task.optimisticTime,
        assigned: task.assignedTo,
        mostLikelyTime: task.mostLikelyTime,
        status: task.status,
        style: {
          backgroundColor: this.get_card_style(slackObject, task),
        },
      };
      if (task.status === "PLANNED") cards_planned.push(card);
      else if (task.status === "WIP") cards_wip.push(card);
      else if (task.status === "Review") cards_review.push(card);
      else if (task.status === "COMPLETED") cards_completed.push(card);
    });
    data = {
      lanes: [
        {
          id: "PLANNED",
          title: "Todo Tasks",
          label: "1/4",
          droppable: this.state.editable,
          cards: cards_planned,
          style: {
            backgroundColor: "#3179ba",
            boxShadow: "2px 2px 4px 0px rgba(0,0,0,0.75)",
            color: "#fff",
            width: "23.5%",
            maxHeight: "60vh",
          },
        },
        {
          id: "WIP",
          title: "Work In Progress",
          label: "2/4",
          droppable: this.state.editable,
          cards: cards_wip,
          style: {
            backgroundColor: "#FFCC33",
            boxShadow: "2px 2px 4px 0px rgba(0,0,0,0.75)",
            color: "#fff",
            width: "23.5%",
            maxHeight: "60vh",
          },
        },
        {
          id: "Review",
          title: "Review",
          label: "3/4",
          droppable: this.state.editable,
          cards: cards_review,
          style: {
            backgroundColor: "#FF9900",
            boxShadow: "2px 2px 4px 0px rgba(0,0,0,0.75)",
            color: "#fff",
            width: "23.5%",
            maxHeight: "60vh",
          },
        },
        {
          id: "COMPLETED",
          title: "Completed",
          label: "4/4",
          droppable: this.state.editable && this.state.isleader,
          cards: cards_completed,
          style: {
            backgroundColor: "#00CC00",
            boxShadow: "2px 2px 4px 0px rgba(0,0,0,0.75)",
            color: "#fff",
            width: "23.5%",
            maxHeight: "60vh",
          },
        },
      ],
    };
    this.setState({ boardData: data });
  };
  shouldReceiveNewData = (nextData) => {
    let cards = [];
    //  await getTasks(projectId).then((data) => {
    //    this.props.updateTasks({ tasks: data.tasks });
    //    // console.log(data);
    //  });
    const { mytasks } = this.state;
    const { slackObject } = this.props;
    nextData.lanes.forEach((data) => {
      data.cards.forEach((card) => {
        if (this.state.flag === true) card.status = card.laneId;
        else card.laneId = card.status;
        cards.push(card);
        // console.log("new cards:", cards, "old cards:", mytasks);
      });
    });
    tasks = cards;
    cards.forEach((card) => {
      updateTask(card, this.props.projectId);
    });
    cards.forEach((card, i) => {
      // console.log(
      //   "card:",
      //   cards[i].description,
      //   "mytasks:",
      //   mytasks[i].description
      // );
      // console.log(mytasks[i].description === cards[i].description);
      if (mytasks[i].status !== cards[i].status) {
        cards[i].description = (
          <>
            <div className="lead">{cards.taskDescription}</div>
            <p>{this.get_card_label(slackObject, cards[i])}</p>
            {/* {slackObject[task.taskName].map((startDate) => (
              <p>{startDate.earliestStartDate}</p>
            ))} */}
            {/* <p>
              Start By:{" "}
              {moment(slackObject[task.taskName].earliestStartDate).format(
                "DD-MM-YYYY"
              )}
            </p>
            <p>
              Finish By:{" "}
              {moment(slackObject[task.taskName].earliestFinishDate).format(
                "DD-MM-YYYY"
              )}
            </p> */}
          </>
        );
      }
    });
    this.setState({ mytasks: cards });
  };
  // componentWillReceiveProps() {
  //   if (
  //     this.state.mytasks.length < this.props.tasks.length &&
  //     this.state.mytasks.length !== this.props.tasks.length
  //   ) {
  //     this.setState({ mytasks: this.props.tasks });
  //     console.log("new Tasks:", this.state.tasks);
  //     // this.updateBoard();
  //   }
  // }
  componentDidUpdate(prevProps, prevState) {
    const tasks = [...this.props.tasks];
    tasks.shift();
    tasks.shift();
    // if(prevState.mytasks.length)
    if (prevState.mytasks.length !== tasks.length) {
      if (this.props.updateTrelloBoard) {
        // console.log(this.props.updateTrelloBoard);
        getTasks(this.props.projectId)
          .then((data) => {
            this.setState({ mytasks: data.tasks });
            this.updateBoard();
          })
          .then(() => this.props.updateTrello({ update: false }));
        // console.log(prevState.mytasks, tasks);
      }
      // this.setState({ mytasks: tasks });
    }
    // console.log(prevState.mytasks.length, tasks.length);
  }
  render() {
    // console.log(this.state.mytasks);
    // console.log(this.state.currentTask);
    return (
      <div>
        {this.state.show && this.state.isleader ? (
          <EditModel
            projectId={projectId}
            task={this.state.currentTask}
            id={this.state.cardId}
            show={this.state.show}
            showMe={this.showMe}
            hideMe={this.hideMe}
          />
        ) : (
          <div></div>
        )}
        <ToastContainer />
        <div>
          <h3>Task List</h3>
        </div>
        <div>
          <Board
            // editable
            // editLaneTitle
            data={this.state.boardData}
            onDataChange={this.shouldReceiveNewData}
            eventBusHandle={this.setEventBus}
            handleDragStart={this.handleDragStart}
            handleDragEnd={this.handleDragEnd}
            onCardDelete={this.onCardDelete}
            onCardClick={this.onCardClick}
            hideCardDeleteIcon={!this.state.isleader}
            style={{
              backgroundColor: "#eee",
              height: "65vh",
            }}
            cardStyle={{
              overflow: "hidden",
              width: "90%",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  tasks: state.tasks.tasks,
  updateTrelloBoard: state.tasks.updateTrelloBoard,
  slackObject: state.cpm.slacks,
  connections: state.cpm.connections,
  nodes: state.cpm.nodes,
});

const mapDispatchToProps = (dispatch) => ({
  updateTasks: (params) => dispatch(updateTasks(params)),
  updateTrello: (params) => dispatch(updateTrello(params)),
  replaceNodes: (params) => dispatch(replaceNodes(params)),
  replaceConnections: (params) => dispatch(replaceConnections(params)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TrelloTask);
