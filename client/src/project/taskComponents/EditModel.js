import { Modal, Button } from "react-bootstrap";
import React, { Component } from "react";
import { updateTask } from "./../apiProject";
import AssignPerson from "./../../utils/signupbutton/Tagify/AssignPerson";
import { getUserById } from "./../../user/apiUser";
class EditModel extends Component {
  state = {
    title: "",
    description: "",
    laneId: "",
    pessimisticTime: 0,
    optimisticTime: 0,
    mostLikelyTime: 0,
    task_responsible: [],
    task_responsible_string: "",
    assigned: [],
  };
  componentDidMount() {
    this.setState({
      title: this.props.task.taskName,
      description: this.props.task.taskDescription,
      pessimisticTime: this.props.task.pessimisticTime,
      optimisticTime: this.props.task.optimisticTime,
      mostLikelyTime: this.props.task.mostLikelyTime,
      id: this.props.task._id,
      laneId: this.props.task.status,
      assigned: this.props.task.assignedTo,
    });
    const assignedToMembs = this.props.task.assignedTo;
    let string = "";
    assignedToMembs.map((memb) => {
      getUserById(memb).then((user) => {
        let { task_responsible } = this.state;
        task_responsible.push(user.user.name);
        string += user.user.name + ",";
        this.setState({
          task_responsible: task_responsible,
          task_responsible_string: string,
        });
      });
    });
  }
  assignTo = (members) => {
    this.setState({ task_responsible: members });
  };
  assignIds = (ids) => {
    this.setState({ assigned: ids });
  };
  render() {
    let task = this.props.task;
    if (task === {}) return;
    let show = this.props.show;
    console.log(this.props.task);

    // if (tasks === undefined) return;
    // tasks.map((task) => {
    //   if (this.props.id.toString() === task._id) console.log(task);
    // });
    // console.log(this.props.id);
    return (
      <Modal show={show} onHide={() => this.props.hideMe()}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label>Name:</label>
            <input
              type={"text"}
              defaultValue={task.taskName}
              onChange={(e) => this.setState({ title: e.target.value })}
              className="form-control"
            ></input>
          </div>
          <div className="form-group">
            <label>Description:</label>
            <input
              type={"text"}
              defaultValue={task.taskDescription}
              className="form-control"
              onChange={(e) => this.setState({ description: e.target.value })}
            ></input>
          </div>
          <div className="form-group">
            <label>Optimistic Time:</label>
            <input
              type={"number"}
              defaultValue={task.optimisticTime}
              className="form-control"
              onChange={(e) =>
                this.setState({ optimisticTime: e.target.value })
              }
            ></input>
          </div>

          <div className="form-group">
            <label>Most Likely Time:</label>
            <input
              type={"number"}
              defaultValue={task.mostLikelyTime}
              className="form-control"
              onChange={(e) =>
                this.setState({ mostLikelyTime: e.target.value })
              }
            ></input>
          </div>

          <div className="form-group">
            <label>Pessimistic Time:</label>
            <input
              type={"number"}
              defaultValue={task.pessimisticTime}
              className="form-control"
              onChange={(e) =>
                this.setState({ pessimisticTime: e.target.value })
              }
            ></input>
          </div>
          <AssignPerson
            projectId={this.props.projectId}
            assignTo={this.assignTo}
            assignIds={this.assignIds}
            label={"Assigned to"}
            value={this.state.task_responsible_string}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() =>
              updateTask(this.state, this.props.projectId)
                .then((data) => console.log(data))
                .then(() => window.location.reload())
            }
          >
            Submit
          </Button>
          <Button onClick={() => this.props.hideMe()}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default EditModel;
