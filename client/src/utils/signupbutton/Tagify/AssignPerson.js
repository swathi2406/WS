import React, { Component } from "react";
import { getTeam } from "../../../project/apiProject";
import Assigner from "./Assigner";
class AssignPerson extends Component {
  state = {};
  componentDidMount = async () => {
    let projectId = this.props.projectId;
    let response = await getTeam(projectId);
    this.setState({ team: response.team });
    let arr = [];
    response.team.map((member) => {
      arr.push(member.name);
    });
    this.setState({ teamNames: arr });
  };

  render() {
    if (!this.state.teamNames) return null;
    return (
      <>
        <Assigner
          suggestions={this.state.teamNames}
          team={this.state.team}
          assignTo={this.props.assignTo}
          label={this.props.label}
          assignIds={this.props.assignIds}
          value={this.props.value}
        />
      </>
    );
  }
}

export default AssignPerson;
