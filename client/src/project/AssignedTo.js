import React, { Component } from "react";
import { getUserById } from "../user/apiUser";
class AssignedTo extends Component {
  state = { user: {} };
  componentDidMount() {
    const { id } = this.props;
    getUserById(id).then((response) => {
      this.setState({ user: response.user });
    });
  }
  render() {
    const { user } = this.state;
    if (user === undefined) return null;
    return (
      <>
        <div className="mt-2">
          {user.name}
          <small className="text-mute">(@{user.username})</small>
        </div>
      </>
    );
  }
}

export default AssignedTo;
