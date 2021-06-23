const { isBuffer } = require("lodash");
const Project = require("../models/project");
const User = require("../models/user");
const similarity = require("string-cosine-similarity");
const { addNotification } = require("./notifications");

const sumItUp = async (project, sum) => {
  // console.log(project);
  let proj_completion_percentage = 0;
  try {
    const { completion_percentage } = await Project.findById(project).exec();
    proj_completion_percentage = completion_percentage;
  } catch (err) {
    console.log(err);
  }
  sum += proj_completion_percentage;
  console.log(
    `completion_percentage is ${proj_completion_percentage}, updated sum is ${sum}`
  );
  return sum;
};
const updateUserCompletion = async (user) => {
  console.log(user);
  let sum = 0;
  for (var i = 0; i < user.projects.length; i++) {
    try {
      sum = await sumItUp(user.projects[i], sum);
    } catch (err) {
      console.log(err);
    }
    // console.log(user.name + " " + user.project[i].title + " " + sum);
  }
  console.log("sum : ", sum);
  console.log("project length : ", user.projects.length);
  user.completion_percentage_of_all_projects = 0;
  if (user.projects.length !== 0)
    user.completion_percentage_of_all_projects = sum / user.projects.length;
  user.save();
};
exports.createProject = (req, res) => {
  // console.log(req);
  const project = new Project(req.body);
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  project.leader = req.profile;
  project.completion_percentage = 0;
  project.team.push(req.profile._id);
  project.tasks.push({
    id: "1",
    key: "start",
    type: "input",
    taskName: "Lets Start Working",
    taskDescription: "Start working on tasks to complete project on time",
    pessimisticTime: 0,
    mostLikelyTime: 0,
    optimisticTime: 0,
    predecessors: [],
    sourcePosition: "right",
    position: { x: 0, y: 0 },
  });
  project.tasks.push({
    id: "2",
    key: "end",
    type: "output",
    taskName: "Completed!!",
    taskDescription: "Yaaayy you gus have completed the project",
    pessimisticTime: 0,
    mostLikelyTime: 0,
    optimisticTime: 0,
    predecessors: [],
    targetPosition: "left",
    position: { x: 500, y: 0 },
  });
  // project.created = new Date();
  console.log(project.leader._id);
  project.save((err, result) => {
    if (err) return res.status(400).json({ error: err });
    User.findById(project.leader._id).exec(async (err, user) => {
      if (err || !user) return;
      user.projects.push(project._id);
      user.save();
      await updateUserCompletion(user);
    });
  });
  return res.status(200).json({ project });
};

exports.updateProject = (req, res) => {
  // console.log(req.body);
  let editedProject = req.body;
  let project = req.projectObject;
  let editedRoleProject = new Project(editedProject);
  // console.log(editedRoleProject, project);
  project.title = editedRoleProject.title;
  project.skills = editedRoleProject.skills;
  project.description = editedRoleProject.description;
  project.roles = editedRoleProject.roles;
  project.team = editedRoleProject.team;
  project.tasks = editedRoleProject.tasks;
  console.log(project, editedRoleProject.roles);
  project.save((err) => {
    console.log(project.roles);
    if (err) res.status(400).json({ err });
    res.status(200).json({ message: "project updated" });
  });
};

exports.leaveProject = (req, res) => {
  project_id = req.projectObject._id;
  user_id = req.profile._id;
  User.findById(user_id).exec((err, user) => {
    if (err || !user) {
      return;
    }
    let index = user.projects.indexOf(project_id);
    if (index > -1) {
      user.projects.splice(index, 1);
    }
    // user.save();
    updateUserCompletion(user);
    res.status(200).json({ message: "leaved the project" });
  });
};

exports.deleteProject = (req, res) => {
  let project = req.projectObject;
  try {
    let team = [];
    if (project.academic) team = project.teamMates;
    else team = project.team;
    team.forEach((memb) => {
      User.findById(memb.toString()).exec((err, user) => {
        if (err || !user) {
          return;
        }
        let index = user.projects.indexOf(project._id);
        if (index > -1) {
          user.projects.splice(index, 1);
        }
        user.save((err) => {
          if (err) {
            return res.status(400).json({ error: err });
          }
          updateUserCompletion(user);
        });
      });
    });
    project.remove();
    res.status(200).json({ message: "Deleted project" });
  } catch (err) {
    res.status(400).json({ err });
  }
};
exports.allProjects = (req, res) => {
  Project.find((err, projects) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.json(projects);
  });
};

exports.projectById = (req, res, next, id) => {
  Project.findById(id).exec((err, project) => {
    if (err || !project) {
      return res.status(400).json({
        error: "Project not found",
      });
    }
    req.projectObject = project; // Adds project object in req with project info
    next();
  });
};
exports.getProject = (req, res) => {
  // console.log(req.projectObject);
  if (req.projectObject !== undefined) {
    return res.status(200).json({ project: req.projectObject });
  } else {
    return res.status(400).json({ error: "Project not found" });
  }
};
function userIsPresent(requestBy, userId) {
  for (let i = 0; i < requestBy.length; i++) {
    if (userId.toString() === requestBy[i].toString()) {
      return true;
    }
  }
  return false;
}
exports.getRoles = (req, res) => {
  let project = req.projectObject;
  return res.status(200).json({
    roles: project.roles,
  });
};
exports.acceptRequest = (req, res) => {
  let project = req.projectObject;
  let leader = req.profile._id;
  let acceptId = req.body.acceptUserId;
  let roleId = req.body.roleId;
  project.roles.map((role) => {
    if (leader.toString() === project.leader.toString()) {
      if (roleId.toString() === role._id.toString()) {
        role.assignedTo = acceptId;
        role.requestBy = [];
        project.team.push(acceptId);
        project.save((err) => {
          if (err) res.status(400).json({ err });
          User.findById(acceptId).exec((err, user) => {
            if (err || !user) {
              return;
            }
            user.projects.push(project._id);
            // user.save();
            updateUserCompletion(user);
          });
        });
        return res.status(200).json({ role });
      }
    } else {
      return res.status(400).json({
        err: "Not Authorized to Perform this action",
      });
    }
  });
};
function removeRequest(requestBy, value) {
  var index = requestBy.indexOf(value);
  if (index > -1) {
    requestBy.splice(index, 1);
  }
  return requestBy;
}

exports.declineRequest = (req, res) => {
  let project = req.projectObject;
  let leader = req.profile._id;
  let rejectId = req.body.rejectUserId;
  let roleId = req.body.roleId;
  // console.log(project._id, leader, rejectId, roleId);
  project.roles.map((role) => {
    if (leader.toString() === project.leader.toString()) {
      if (roleId.toString() === role._id.toString()) {
        if (role.requestBy.includes(rejectId)) {
          removeRequest(role.requestBy, rejectId);
          project.save((err) => {
            if (err) res.status(400).json({ err });
          });
        }
        console.log(role);
        return res.status(200).json({ role });
      }
    } else {
      return res.status(400).json({
        err: "Not Authorized to Perform this action",
      });
    }
  });
};

exports.getRequests = (req, res) => {
  let project = req.projectObject;
  let requests = [];
  project.roles.map((role) => {
    let tempObj = {
      roleId: role._id,
      roleName: role.roleName,
      requests: role.requestBy,
    };
    requests.push(tempObj);
  });
  res.status(200).json({
    requests,
  });
};
exports.getProjectsOfUser = (req, res) => {
  let user = req.profile;
  // console.log(user);
  Project.find((err, projects) => {
    if (err) {
      res.status(400).json({ err });
    }
    let userProjects = [];
    projects.map((project) => {
      if (project.academic && project.status !== "requested")
        project.mentors.map((mentor) => {
          if (
            mentor.id !== undefined &&
            user.id !== undefined &&
            mentor.id.toString() === user._id.toString()
          ) {
            userProjects.push(project);
            console.log(project);
          }
        });
      if (
        project.team.includes(user._id) ||
        project.teamMates.includes(user._id)
      ) {
        userProjects.push(project);
      }
    });
    res.status(200).json({ userProjects });
  });
};
exports.requestRole = (req, res, next) => {
  let project = req.projectObject;
  let roleId = req.body.roleId;
  let user = req.profile._id;
  project.roles.map((role) => {
    if (roleId == role._id) {
      if (userIsPresent(role.requestBy, user)) {
        return res.status(400).json({ err: "User already requested" });
      } else {
        role.requestBy.unshift(user);
        // res.status(200).json({ message: "User requested" });
        try {
          project.save();
          res.status(200).json({ message: "User requested" });
        } catch (err) {
          console.log("Not saved");
          return res.status(400).json({ err: "Not saved" });
        }
      }
    }
  });
};
exports.getTeam = async (req, res) => {
  let project = req.projectObject;
  await User.find({ _id: { $in: project.team } }).then((team) => {
    return res.status(200).json({ team });
  });
};

exports.checkIfProjectExists = async (req, res) => {
  final_out = [];
  try {
    var string1 = req.query["X"].toString();
    var string2 = req.query["X1"].toString();
    var string3 = req.query["Academic"];
    // console.log(string1, string2);
    // var string1 = "A";
    // var string2 = "A";
    // console.log(req);
    var f = 0,
      sim = 0;
    await Project.find(function (error, result) {
      for (i = 0; i < result.length; i++) {
        if (result[i].academic.toString() === string3) {
          out = {};
          var str1 = result[i].title;
          var str2 = result[i].description;

          var sim1 = similarity(string1, str1) * 100;
          var sim2 = similarity(string2, str2) * 100;

          if (isNaN(sim1)) sim1 = 0;
          if (isNaN(sim2)) sim2 = 0;
          sim1 = sim1 * 0.1;
          sim2 = sim2 * 0.9;
          sim = sim1 + sim2;
          if (isNaN(sim)) sim = 0;
          // console.log(
          //   "Similar project found with similarity :",
          //   sim,
          //   " title : ",
          //   str1,
          //   " Description : ",
          //   str2,
          //   "Sim1:",
          //   sim1 / 0.1,
          //   "Sim2:",
          //   sim2 / 0.9
          // );
          if (sim > 40) {
            out["title"] = str1;
            out["description"] = str2;
            out["similarity"] = sim;
            out["title_sim"] = sim1 / 0.1;
            out["desc_sim"] = sim2 / 0.9;
            f = 1;
            final_out.push(out);
          }
        }
      }
    });
    if (f !== 1) {
      // console.log("New Project Can be Added");
      // await Proj.create({ title: string1, description: string2 });
      // console.log("can be added");
      return res.status(200).json({ message: "Can be added!" });
    }
    // console.log("can be added");
    return res
      .status(200)
      .json({ data: final_out, message: "Similar Values Exist" });
  } catch (err) {
    if (err !== undefined) {
      console.log(err);
      return res.status(400).json({ err: err.toString() });
    }
  }
};

exports.checkIfProjectExiststeacher = async (req, res) => {
  final_out = [];
  try {
    var string1 = req.query["X"].toString();
    var string2 = req.query["X1"].toString();
    // console.log(string1, string2);
    // var string1 = "A";
    // var string2 = "A";
    // console.log(req);
    var f = 0,
      sim = 0;
    await Project.find(function (error, result) {
      for (i = 0; i < result.length; i++) {
        out = {};
        var str1 = result[i].title;
        var str2 = result[i].description;

        var sim1 = similarity(string1, str1) * 100;
        var sim2 = similarity(string2, str2) * 100;

        if (isNaN(sim1)) sim1 = 0;
        if (isNaN(sim2)) sim2 = 0;
        sim1 = sim1 * 0.1;
        sim2 = sim2 * 0.9;
        sim = sim1 + sim2;
        if (isNaN(sim)) sim = 0;
        // console.log(
        //   "Similar project found with similarity :",
        //   sim,
        //   " title : ",
        //   str1,
        //   " Description : ",
        //   str2,
        //   "Sim1:",
        //   sim1 / 0.1,
        //   "Sim2:",
        //   sim2 / 0.9
        // );
        if (sim > 40) {
          out["title"] = str1;
          out["description"] = str2;
          out["similarity"] = sim;
          out["title_sim"] = sim1 / 0.1;
          out["desc_sim"] = sim2 / 0.9;
          f = 1;
          final_out.push(out);
        }
      }
    });
    if (f !== 1) {
      // console.log("New Project Can be Added");
      // await Proj.create({ title: string1, description: string2 });
      // console.log("can be added");
      return res.status(200).json({ message: "Can be added!" });
    }
    // console.log("can be added");
    return res
      .status(200)
      .json({ data: final_out, message: "Similar Values Exist" });
  } catch (err) {}
  return res.status(200).json({ project });
};

exports.submitProject = (req, res) => {
  let project = req.projectObject;
  // console.log(project);
  let team = project.team;
  project.status = "Completed";
  project.save();
  try {
    team.map((user_id) => {
      User.findById(user_id).exec((err, user) => {
        if (err || !user) return;
        else {
          user.completed_projects.push(project._id);
          let index = user.projects.indexOf(project._id);
          if (index > -1) {
            user.projects.splice(index, 1);
          }
          updateUserCompletion(user);
        }
      });
    });
    return res.status(200).json({ message: "Project Completed!" });
  } catch (err) {
    if (err !== undefined) return res.status(400).json({ err: err.toString() });
  }
};

exports.getChat = async (id) => {
  const { chat } = await Project.findById(id).exec();
  return chat;
};

exports.updateChat = (req, res) => {
  let project = req.projectObject;
  let chat_msg = req.body;
  project.chat.push(chat_msg.chat);
  // console.log(project);
  try {
    project.save();
    res.status(200).json({ message: "Chat Updated" });
  } catch (err) {
    if (err !== undefined) return res.status(400).json({ err: err.toString() });
  }
};

exports.addFeedbackNotification = async (rating, projectId) => {
  let projectName = await Project.findById(projectId).select("title").exec();
  // console.log(projectName);
  Object.keys(rating).map((userId) => {
    User.findById(userId, (err, result) => {
      let req = {
        profile: result,
        body: {
          notification: `Congooo! ${projectName.title} is DONE! send some feedback to your team !`,
          type: "FeedbackForm",
          projectId,
        },
      };
      console.log(req);
      addNotification(req, {});
    });
  });
};

exports.updateEstimatedTime = (req, res) => {
  let project = req.projectObject;
  project.estimatedTime = req.body.estimatedTime;
  // console.log(project);
  project.save((err, result) => {
    if (err) return res.status(400).json({ error: err });
    return res.status(200).json({ result });
  });
};

exports.kickOutCounterUpdate = (req, res) => {
  const { taskId, userId } = req.body;
  // console.log(req.projectObject);
  // console.log(req.profile);
  let project = req.projectObject;
  let user = req.profile;
  if (project.leader.toString() === user._id.toString()) {
    // console.log(
    // );
    if (project.overdueCounter === undefined) {
      project.overdueCounter = {};
    }
    if (project.overdueCounter[userId] === undefined) {
      project.overdueCounter[userId] = [taskId];
    } else {
      if (!project.overdueCounter[userId].includes(taskId)) {
        project.overdueCounter[userId].push(taskId);
      }
    }
    console.log(project.overdueCounter);
    project.save((err, result) => {
      if (err) return res.status(400).json({ err });
      return res.status(200).json({ result });
    });
  }
};

//Academic Controls

exports.newAcademicProject = (req, res) => {
  // console.log(req.profile);
  // console.log(req.body);
  let user = req.profile;
  let body = req.body;
  let project = {
    title: body.titleAcademic,
    description: body.descriptionAcademic,
    skills: body.skillsAcademic,
    mentors_requested: [{ ...body.mentor }],
    subject: body.subject,
    semester: body.semester,
    teamMates: body.teamMates,
    academic: body.academic,
    leader: user,
    status: "requested",
  };
  // console.log(project);
  let projectObject = new Project(project);
  // console.log(projectObject);
  console.log(projectObject);
  projectObject.teamMates.push(user._id);
  projectObject.save((err, result) => {
    if (err) return res.status(400).json({ error: err });
    User.findById(project.leader._id).exec(async (err, user) => {
      if (err || !user) return;
      user.projects.push(projectObject._id);
      user.save();
      await updateUserCompletion(user);
    });
  });
  return res.status(200).json({ projectObject });
};

exports.acceptProject = (req, res) => {
  let project = req.projectObject;
  let user = req.profile;
  let obj = {
    label: user.name,
    id: user._id,
  };
  project.mentors.push(obj);
  project.mentors_requested = [];
  project.status = "In Progress";
  project.save((err) => {
    if (err) return res.status(400).json({ err });
    user.projects.push(project._id);
    user.save();
    return res.status(200).json({ project });
  });
};

exports.declineProject = (req, res) => {
  let project = req.projectObject;
  let user = req.profile;

  try {
    let team = project.teamMates;
    team.forEach((memb) => {
      User.findById(memb.toString()).exec((err, user) => {
        if (err || !user) {
          return;
        }
        let index = user.projects.indexOf(project._id);
        if (index > -1) {
          user.projects.splice(index, 1);
        }
        user.save((err) => {
          if (err) {
            return res.status(400).json({ error: err });
          }
          updateUserCompletion(user);
        });
      });
    });
    project.remove();
    res.status(200).json({ message: "Deleted project" });
  } catch (err) {
    res.status(400).json({ err });
  }

  // project.mentors_requested.pull(user._id);
  // project.save((err) => {
  //   if (err) return res.status(400).json({ err });
  //   return res.status(200).json({ project })
  // })
};
