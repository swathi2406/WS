import React, { Component } from "react";
import { getCurrentUser, list } from "./../user/apiUser";
import { Accordion, Card, Button, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import RoleList from "./../project/newProjectForm/RoleCreate";
import { Bar } from "react-chartjs-2";
const similarity = require("sentence-similarity");
const similarityScore = require("similarity-score");

class UserRecommender extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roleDetails: [
        {
          roleName: "",
          roleSkills: [],
        },
      ],
      users: [],
      final_users: [],
      show: false,
      showGraph: false,
      error: "",
    };
  }

  componentDidMount() {
    list().then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        this.setState({ users: data });
      }
    });
  }

  handleRoleChange = (name) => (e) => {
    let id = parseInt(e.target.attributes.idx.value);
    const roleDetails = this.state.roleDetails;
    roleDetails[id][name] = e.target.value;
    this.setState({ roleDetails });
  };

  addNewRow = (e) => {
    this.setState((prevState) => ({
      roleDetails: [
        ...prevState.roleDetails,
        {
          roleName: "",
          roleSkills: "",
        },
      ],
    }));
  };

  clickOnDelete(record) {
    this.setState({
      roleDetails: this.state.roleDetails.filter((r) => r !== record),
    });
  }

  handleClose() {
    this.setState({ show: false });
  }

  handleShow() {
    this.setState({ show: true });
  }

  calculate = async (e) => {
    e.preventDefault();
    let { roleDetails, users } = this.state;
    this.setState({ error: "" });
    await roleDetails.map((role, i) => {
      if (role.roleSkills.length === 0)
        this.setState({ error: "Pls enter Role Skills of Role " + (i + 1) });
      if (role.roleName === "")
        this.setState({ error: "Pls enter Role Name at " + (i + 1) });
    });
    if (this.state.error === "" && this.state.error !== undefined) {
      let final_users = [];
      roleDetails.map((role) => {
        let final_out = [];
        let role_skills = role.roleSkills;
        users.sort(function (a, b) {
          return (
            b.projects.length +
            b.completed_projects.length -
            (a.projects.length + a.completed_projects.length)
          );
        });

        let max_proj = 1;
        if (users.length > 0)
          max_proj =
            users[0].projects.length + users[0].completed_projects.length;
        let winkOpts = {
          f: similarityScore.winklerMetaphone,
          options: { threshold: 0 },
        };
        if (role_skills !== undefined) {
          users.forEach((user) => {
            let out = {};
            let score = similarity(user.skills, role_skills, winkOpts);
            out = user;
            let total_projects =
              user.projects.length + user.completed_projects.length;
            let final_value =
              ((total_projects / max_proj) * user.rating) / 10 +
              score.exact / role_skills.length +
              -0.04 * user.projects.length +
              0.01 * user.completion_percentage_of_all_projects;
            out["exact"] = score.exact;
            out["final_value"] = final_value;
            final_out.push(out);
          });
          final_out.sort(function (a, b) {
            return b.final_value - a.final_value;
          });
          // final_out = final_out.filter((x) => x.exact != 0);
          final_out = final_out.slice(0, 5);
        }
        let obj = { role: role, users: final_out };
        final_users.push(obj);
      });
      this.setState({ final_users: final_users, show: true });
    }
  };

  renderUsers(users) {
    console.log(users);
    const { showGraph } = this.state;
    let names = [];
    users.map((user) => {
      names.push(user.name);
    });
    console.log(names);
    let exacts = [];
    users.map((user) => {
      exacts.push(user.exact);
    });
    console.log(exacts);

    const dataset = {
      labels: names,
      datasets: [
        {
          label: "My First Dataset",
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
          data: exacts,
        },
      ],
    };
    if (showGraph === true) {
      return (
        <div>
          <Bar
            data={dataset}
            options={{
              title: {
                display: true,
                text: "Matching Skills",
                fontSize: 20,
              },
              legend: {
                display: true,
                position: "right",
              },
            }}
          />
        </div>
      );
    }
    return users.map((user, i) => (
      <div className="col">
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">{user.name}</h5>
            <p className="card-text">{user.email}</p>
            <p className="card-text">{user.bio}</p>
            <Link
              to={`/user/${user._id}`}
              className="btn btn-raised btn-small btn-primary"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>
    ));
  }

  renderRole(users, role, i) {
    return (
      <Accordion>
        <Card>
          <Card.Header>
            <Accordion.Toggle as={Button} variant="link" eventKey="0">
              {role.roleName}
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey="0">
            <Card.Body>{this.renderUsers(users)}</Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    );
  }

  render() {
    const { roleDetails, error } = this.state;
    const users = this.state.final_users;
    let { showGraph } = this.state;
    // console.log(this.state.final_users);
    return (
      <div>
        <div
          className="alert alert-danger"
          style={{ display: error ? "" : "none" }}
        >
          {error}
        </div>
        <form className="mt-5">
          <div className="form-group">
            <RoleList
              add={this.addNewRow}
              delete={this.clickOnDelete.bind(this)}
              roleDetails={roleDetails}
              onChange={this.handleRoleChange}
              dontShow={true}
            />
            <div className="row">
              <button
                onClick={this.calculate}
                className="btn btn-raised btn-primary mx-auto mt-3 mb-2 col-sm-3"
              >
                Find
              </button>
            </div>
          </div>
        </form>
        <Modal show={this.state.show} onHide={this.handleClose.bind(this)}>
          <Modal.Header>
            <Modal.Title>Best People for your Roles</Modal.Title>
            <Button onClick={this.handleClose.bind(this)}>x</Button>
          </Modal.Header>
          <Modal.Body>
            <Button
              onClick={() => {
                showGraph = !showGraph;
                this.setState({ showGraph });
              }}
            >
              View Graphs
            </Button>
            {users.map((user, i) => {
              return this.renderRole(user.users, user.role, i);
            })}
          </Modal.Body>
          <Modal.Footer></Modal.Footer>
        </Modal>
      </div>
    );
  }
}
export default UserRecommender;
