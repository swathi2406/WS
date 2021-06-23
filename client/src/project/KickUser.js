import React, { Component } from "react";
import { updateProject, leaveProject } from "./apiProject";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { isAuthenticated } from "./../auth/index";
import PersonAddDisabledIcon from "@material-ui/icons/PersonAddDisabled";
import { connect } from "react-redux";
import { notificationAdded } from "../store/notifications";
class LeaveProject extends Component {
  state = {};
  leaveproject = () => {
    const project = this.props.project;
    const userId = this.props.user;
    console.log(project);
    let final_team = [],
      final_tasks = [],
      final_roles = [];
    let tasks = project.tasks;
    tasks.forEach((task) => {
      let final_task = task;
      let taskmembs = task.assignedTo;
      let f_taskmembs = [];
      taskmembs.forEach((memb) => {
        if (memb === userId) f_taskmembs.push(project.leader);
        else f_taskmembs.push(memb);
      });
      f_taskmembs = [...new Set(f_taskmembs)];
      final_task.assignedTo = f_taskmembs;
      console.log(final_task);
      final_tasks.push(final_task);
    });
    console.log(final_tasks);

    let membs = project.team;
    membs.forEach((user) => {
      if (user !== userId) final_team.push(user);
      console.log(final_team);
    });

    let roles = project.roles;
    roles.map((role) => {
      let r = role;
      if (r.assignedTo === userId) r.assignedTo = undefined;
      final_roles.push(r);
    });

    let proj = {
      title: project.title,
      description: project.description,
      skills: project.skills,
      roleDetails: final_roles,
      team: final_team,
      tasks: final_tasks,
    };
    console.log(proj.roleDetails);
    updateProject(proj, project._id).then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        const token = isAuthenticated().token;
        leaveProject(userId, project._id, token)
          .then((data) => {
            if (data.error) {
              console.log(data.error);
            }
          })
          .then(() => {
            // this.props.notificationAdded({
            //   userId: val.sentBy,
            //   message: `Role (${res.role.roleName}) declined by ${
            //     getCurrentUser().name
            //   }`,
            //   type: "RoleDeclinedInNotif",
            //   projectId: val.projectId,
            // });
            this.props.notificationAdded({
              userId: userId,
              message: `You have been kicked out of ${project.title} :/`,
              type: "KickedOut",
              projectId: project._id,
            });
          })
          .then(() => {
            alert("kicked out..");
            window.location.reload(false);
          });
      }
    });
  };

  leaveConfirmed = () => {
    let answer = window.confirm(
      "Are you sure you want to Kick him/her out of your team"
    );
    if (answer) {
      this.leaveproject();
    }
  };

  render() {
    return (
      <div>
        <OverlayTrigger
          key="top"
          placement="top"
          overlay={<Tooltip id="top2">Kick out</Tooltip>}
        >
          <Button onClick={this.leaveConfirmed} variant="danger">
            <PersonAddDisabledIcon />
          </Button>
        </OverlayTrigger>
      </div>
    );
  }
}
const mapDispatchToProps = (dispatch) => ({
  notificationAdded: (params) => dispatch(notificationAdded(params)),
});
export default connect(null, mapDispatchToProps)(LeaveProject);
