import React, { Component } from "react";
import { isAuthenticated } from "./../auth/index";
import { Redirect } from "react-router-dom";
import { abandon } from "./apiProject";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import DeleteForeverTwoToneIcon from "@material-ui/icons/DeleteForeverTwoTone";

class DeleteProject extends Component {
  state = {};

  deleteAccount = () => {
    const token = isAuthenticated().token;
    const { projectId } = this.props;
    abandon(projectId, token).then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        alert("Project is deleted");
        // // redirect
        // this.setState({ redirect: true });
        window.location.reload();
      }
    });
  };

  deleteConfirmed = () => {
    let answer = window.confirm(
      "Are you sure you want to delete this project?"
    );
    if (answer) {
      this.deleteAccount();
    }
  };

  render() {
    if (this.state.redirect) {
      return <Redirect to="/" />;
    }
    return (
      <div>
        <OverlayTrigger
          key="top"
          placement="top"
          overlay={<Tooltip id="top">Delete Project</Tooltip>}
        >
          <Button onClick={this.deleteConfirmed} variant="danger">
            <DeleteForeverTwoToneIcon />
          </Button>
        </OverlayTrigger>
      </div>
    );
  }
}

export default DeleteProject;
