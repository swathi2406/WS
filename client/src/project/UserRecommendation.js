import React, { Component } from "react";
import { getCurrentUser, list } from "./../user/apiUser";
import { Accordion, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { notificationAdded } from "../store/notifications";
import { toast } from "react-toastify";
const similarity = require("sentence-similarity");
const similarityScore = require("similarity-score");
class UserRecommendation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
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

  renderUsers = (final_out, project) => (
    <Accordion>
      <Card>
        <Card.Header>
          <Accordion.Toggle as={Button} variant="link" eventKey="0">
            Best people for the project
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse eventKey="0">
          <Card.Body>
            <div className="row row-cols-1 row-cols-md-2">
              {final_out.map((user, i) => (
                <div className="col">
                  <div className="card mb-3" key={i}>
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
                      <Button
                        onClick={() => {
                          //params
                          //getCurrentUser()._id,
                          // projectId,
                          // user._id,
                          // roleId
                          // console.log(getCurrentUser().name);
                          this.props.notificationAdded({
                            userId: user._id,
                            message: `You are invited to project ${
                              project.title
                            } by ${getCurrentUser().name}`,
                            type: "InviteToProject",
                            projectId: project._id,
                            sentBy: getCurrentUser()._id,
                            sentTo: user._id,
                          });
                          // .then(() =>
                          toast.success(
                            `Invited ${user.name} to project ${project.title}.`
                          );
                          // );
                        }}
                      >
                        Invite
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion>
  );

  render() {
    let users = [];
    const project = this.props.project;
    users = this.state.users;
    // console.log(project);
    let final_out = [];
    let proj_skills = project.skills;
    users.sort(function (a, b) {
      return (
        b.projects.length +
        b.completed_projects.length -
        (a.projects.length + a.completed_projects.length)
      );
    });

    let max_proj = 1;
    if (users.length > 0)
      max_proj = users[0].projects.length + users[0].completed_projects.length;
    let winkOpts = {
      f: similarityScore.winklerMetaphone,
      options: { threshold: 0 },
    };
    users.forEach((user) => {
      let out = {};
      let score = similarity(user.skills, proj_skills, winkOpts);
      out = user;
      // console.log(score,user.skills,proj_skills)
      let total_projects =
        user.projects.length + user.completed_projects.length;
      let final_value =
        ((total_projects / max_proj) * user.rating) / 10 +
        score.exact / proj_skills.length +
        -0.04 * user.projects.length +
        0.01 * user.completion_percentage_of_all_projects;
      out["exact"] = score.exact;
      out["final_value"] = final_value;
      final_out.push(out);
    });

    final_out = final_out.filter((x) => !project.team.includes(x._id));
    final_out.sort(function (a, b) {
      return b.final_value - a.final_value;
    });
    // final_out = final_out.filter(x => x.exact !=0);
    final_out = final_out.slice(0, 5);
    return (
      <div className="container">
        {final_out.length === 0 ? (
          <></>
        ) : (
          <>{this.renderUsers(final_out, project)}</>
        )}
      </div>
    );
  }
}
const mapDispatchToProps = (dispatch) => ({
  notificationAdded: (params) => dispatch(notificationAdded(params)),
});
export default connect(null, mapDispatchToProps)(UserRecommendation);
