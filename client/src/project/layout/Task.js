import React, { Component } from "react";

export class Task extends Component {
  render() {
    const tasks = this.props.tasks;
    return (
      <>
        {Object.values(tasks).map((task) => {
          if (task.id !== "1" && task.id !== "2") {
            return (
              <>
                <div>
                  <strong>ID: {task.id}</strong>
                </div>
                <div>
                  {" "}
                  {task.mostLikelyTime} {task.optimisticTime}{" "}
                  {task.pessimisticTime}
                </div>
                <hr />
              </>
            );
          }
        })}
      </>
    );
  }
}

export default Task;
