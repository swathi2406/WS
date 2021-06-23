import React, { Component } from "react";
import { isAuthenticated } from "./../auth/index";
import { Redirect } from "react-router-dom";
import { finish } from "./apiProject";
import { Button, OverlayTrigger, Tooltip, Modal } from "react-bootstrap";
import PublishTwoToneIcon from "@material-ui/icons/PublishTwoTone";
import socket from "./../utils/Socket";
import RatingComponent from "./RatingComponent";
import { getUserById, setRating } from "../user/apiUser";
class SubmitProject extends Component {
  state = {
    show: false,
    rating: {},
  };
  componentDidMount() {
    const { projectTeam } = this.props;
    let team = [];
    projectTeam.map((member, index) => {
      getUserById(member).then((val) => {
        // let rating = this.state.rating;
        // rating[val.user._id] = 4;
        // this.setState({ rating });
        team.push(val.user);
        this.setState({ team });
        // setRating(val.user._id, rating[val.user._id]).then((val) =>
        //   console.log(val)
        // );
      });
      // console.log(user);
    });
  }

  submitproject = () => {
    const token = isAuthenticated().token;
    const userId = isAuthenticated().user._id;
    const { rating } = this.state;
    const { projectId, projectTeam } = this.props;
    socket.emit("addFeedbackForm", { rating, projectId });
    // socket.emit("getOnlineUsers");
    // socket.on("onlineUsers", (users) => {
    //   Object.values(users.users).map((user) => {
    //     console.log(user);
    //   });
    // });
    setRating(userId, rating).then((data) => {
      if (data.message === "Updated Ratings") {
        finish(projectId, token).then((data) => {
          if (data.error) {
            console.log(data.error);
          } else {
            alert("Project marked as completed :) ");
            window.location.reload();
          }
        });
      }
    });
  };
  setRatingObject = (rating) => {
    this.setState({ rating });
    // console.log(this.state.rating);
  };
  handleClose = () => {
    this.setState({ show: false });
  };
  submitConfirmed = () => {
    let answer = window.confirm(
      "Are you sure you want to submit this project? (Note : If submitted, project cannot be modified)"
    );
    if (answer) {
      this.setState({ show: true });
    }
  };

  render() {
    if (this.state.redirect) {
      return <Redirect to="/" />;
    }
    const { show, team } = this.state;
    // console.log(team);
    if (team === undefined) return null;

    return (
      <>
        {show ? (
          <Modal
            show={show}
            onHide={this.handleClose}
            backdrop="static"
            keyboard={false}
          >
            <Modal.Header closeButton>
              <Modal.Title>
                Lets Give your amazing team some Feedback!
              </Modal.Title>
            </Modal.Header>
            <Modal.Body scrollable="true">
              {team.length === 1 ? (
                <>
                  <h1>Oh wait. You've one man armied this? RESPECT! :O </h1>
                  <Button
                    onClick={() => {
                      this.submitproject();
                    }}
                  >
                    Continue...
                  </Button>
                </>
              ) : (
                <>
                  <RatingComponent
                    team={team}
                    rating={this.state.rating}
                    // handleValueChange={this.handleValueChange}
                  />
                  <Button
                    onClick={() => {
                      const { rating } = this.state;
                      // console.log(rating);
                      this.submitproject();
                      this.setState({ show: false });
                    }}
                  >
                    Submit
                  </Button>
                </>
              )}
            </Modal.Body>
          </Modal>
        ) : (
          <></>
        )}
        <div>
          <OverlayTrigger
            key="top"
            placement="top"
            overlay={<Tooltip id="top">Finalize Project</Tooltip>}
          >
            <Button
              onClick={this.submitConfirmed}
              className="ml-2"
              variant="success"
            >
              <PublishTwoToneIcon />
            </Button>
          </OverlayTrigger>
        </div>
      </>
    );
  }
}

export default SubmitProject;
