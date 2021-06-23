import React, { Component } from "react";
import { getUserById } from "../user/apiUser";
import { Button } from "react-bootstrap";
import { acceptRequest, declineRequest } from "./apiProject";
import { getCurrentUser } from "./../user/apiUser";
import { connect } from "react-redux";
import { notificationAdded } from "../store/notifications";
class Requests extends Component {
  state = {};
  componentDidMount() {
    const { reqId } = this.props;
    getUserById(reqId).then((res) => {
      this.setState({ user: res.user });
    });
  }
  render() {
    const { user } = this.state;
    const { projectId, roleId } = this.props;
    if (user === undefined) return null;
    const url = "http://localhost:3000/user/" + user._id.toString();
    return (
      <>
        <div className="row">
          <div className="ml-2 mt-2">
            {user.name}
            <small className="text-mute">(@{user.username})</small>
          </div>
          {/* <div className="ml-2">
            <Button
              onClick={() => {
                console.log(url);
              }}
            >
              View Profile
            </Button>
          </div> */}
          <div className="ml-1">
            <Button
              onClick={() => {
                acceptRequest(getCurrentUser()._id, projectId, user._id, roleId)
                  .then((res) => {
                    console.log(res);
                    this.props.notificationAdded({
                      userId: user._id,
                      message: `New Role Accepted by ${
                        getCurrentUser().name
                      }, Time to show off my skills B)`,
                      type: "RoleAccepted",
                      projectId: projectId,
                    });
                    this.props.notificationAdded({
                      userId: getCurrentUser()._id,
                      message: `@${user.username} added to project! Welcome the new Member`,
                      type: "NewMember",
                      projectId: projectId,
                    });
                  })
                  .then(() => window.location.reload());
              }}
            >
              Accept
            </Button>
          </div>
          <div className="ml-1">
            <Button
              onClick={() => {
                declineRequest(
                  getCurrentUser()._id,
                  projectId,
                  user._id,
                  roleId
                )
                  .then((res) => {
                    console.log(res);
                    this.props.notificationAdded({
                      userId: user._id,
                      message: `Role Declined by ${getCurrentUser().name} :(`,
                      type: "RoleDeclined",
                      projectId: projectId,
                    });
                  })
                  .then(() => window.location.reload());
              }}
            >
              Decline
            </Button>
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
export default connect(mapStateToProps, mapDispatchToProps)(Requests);
