import React, { Component } from "react";
import { updateProject, leaveProject } from "./apiProject";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { isAuthenticated } from "./../auth/index";
import { getCurrentUser } from "./../user/apiUser";
import ExitToAppTwoToneIcon from "@material-ui/icons/ExitToAppTwoTone";
class LeaveProject extends Component {
  state = {};
  leaveproject = () => {
    const project = this.props.project;
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
        if (memb === getCurrentUser()._id) f_taskmembs.push(project.leader);
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
      if (user !== getCurrentUser()._id) final_team.push(user);
      console.log(final_team);
    });

    let roles = project.roles;
    roles.map((role) => {
      let r = role;
      if (r.assignedTo === getCurrentUser()._id) r.assignedTo = undefined;
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
        leaveProject(getCurrentUser()._id, project._id, token).then((data) => {
          if (data.error) {
            console.log(data.error);
          }
        });
        alert("You left this project");
        window.location.reload(false);
      }
    });
  };

  leaveConfirmed = () => {
    let answer = window.confirm("Are you sure you want to leave this project?");
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
          overlay={<Tooltip id="top2">Leave Project</Tooltip>}
        >
          <Button onClick={this.leaveConfirmed} variant="danger">
            <ExitToAppTwoToneIcon />
          </Button>
        </OverlayTrigger>
      </div>
    );
  }
}

export default LeaveProject;
