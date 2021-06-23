import React, { Component } from "react";
import RoleList from "./RoleCreate";

class RoleView extends Component {
  constructor() {
    super();
    this.state = {
      roleDetails: [
        {
          index: Math.random(),
          roleName: "",
          roleSkills: "",
        },
      ],
    };
  }

  handleChange = (e) => {
    if (["roleName", "roleSkills"].includes(e.target.name)) {
      let roleDetails = [...this.state.roleDetails];
      roleDetails[e.target.dataset.id][e.target.name] = e.target.value;
    } else {
      this.setState({ [e.target.name]: e.target.value });
    }
  };
  addNewRow = (e) => {
    this.setState((prevState) => ({
      roleDetails: [
        ...prevState.roleDetails,
        {
          index: Math.random(),
          roleName: "",
          roleSkills: "",
        },
      ],
    }));
  };

  deteteRow = (index) => {
    this.setState({
      roleDetails: this.state.roleDetails.filter(
        (s, sindex) => index !== sindex
      ),
    });
  };

  clickOnDelete(record) {
    this.setState({
      roleDetails: this.state.roleDetails.filter((r) => r !== record),
    });
  }

  render() {
    let { roleDetails } = this.state;
    return (
      <RoleList
        add={this.addNewRow}
        delete={this.clickOnDelete.bind(this)}
        roleDetails={roleDetails}
      />
    );
  }
}

export default RoleView;
      