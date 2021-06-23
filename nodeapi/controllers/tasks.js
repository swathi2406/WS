const e = require("express");
const { connections } = require("mongoose");
const Project = require("../models/project");
const { allProjects } = require("./project");
const User = require("../models/user");
const { use } = require("../routes/post");
exports.addTasks = (req, res) => {
  if (req.profile._id.toString() === req.projectObject.leader.toString()) {
    const project = req.projectObject;
    const tasks = req.body;
    project.tasks.push(tasks);
    // console.log(project);
    // project.tasks = tasks;
    proj_completion(project);
    return res.status(200).json({ tasks: project.tasks });
  } else {
    return res.status(400).json({ message: "Not Leader" });
  }
};

exports.getTasks = (req, res) => {
  // console.log(req);
  let user = req.profile;
  let project = req.projectObject;
  console.log(project.tasks);
  if (project.tasks !== undefined)
    return res.status(200).json({ tasks: project.tasks });
  else {
    if (project.tasks.length === 0) {
      return res.status(401).json({ err: "No tasks found" });
    }
    if (project.tasks === undefined) {
      return res.status(400).json({ err: "tasks not available" });
    }
  }
};
exports.getTask = (req, res) => {
  // console.log(req);
  let user = req.profile;
  let project = req.projectObject;
  let taskId = req.body.taskId;
  let sent = false;
  project.tasks.map((task) => {
    if (task._id.toString() === taskId) {
      sent = true;
      return res.status(200).json({ task });
    }
  });
  if (sent === false) {
    // console.log("not sent");
    return res.status(400).json({ err: "Task not found" });
  }
};

exports.updatePredecessors = (req, res) => {
  let user = req.profile;
  let project = req.projectObject;
  let taskId = req.body.taskId;
  let connectId = req.body.connectId;
  let sent = false;
  // if (user._id === project.leader) {
  project.tasks.map((task) => {
    if (task._id.toString() === taskId) {
      sent = true;
      if (task.predecessors === undefined) {
        task["predecessors"] = [];
      }
      // console.log(task);
      if (!task.predecessors.includes(connectId));
      {
        try {
          task.predecessors.push(connectId);
        } catch (err) {
          console.log(err);
        }
      }
      project.save((err) => {
        if (err) {
          return res.status(400).json({ err });
        }
      });
      return res.status(200).json({ task });
    }
    // console.log(task);
  });
  // }
  if (sent === false) {
    // console.log("not sent");
    return res.status(400).json({ err: "Task not found" });
  }
};

exports.addConnection = (req, res) => {
  try {
    let user = req.profile;
    let project = req.projectObject;
    // let connections = project.connections;
    if (project.connections === undefined) {
      project.connections = [];
      project.save();
    }
    let Obj = {
      from: req.body.from,
      to: req.body.to,
    };
    project.connections.push(Obj);
    console.log(project.connections);
    project.save((err) => {
      if (err) return res.status(400).json({ err });
    });
    return res.status(200).json({ project });
  } catch (err) {
    console.log(err);
  }
};

exports.getAllConnections = (req, res) => {
  let user = req.profile;
  let project = req.projectObject;
  // console.log(project.connections);
  let connections = project.connections;
  if (connections.length > 0) {
    return res.status(200).json({ connections });
  } else if (connections.length === 0) {
    connections = [];
    return res.status(200).json({ connections });
  } else {
    return res.status(400).json({ err: "No Connections established" });
  }
};

exports.putPosition = (req, res) => {
  let user = req.profile;
  let project = req.projectObject;
  let position = req.body.position;
  let taskId = req.body.taskId;
  project.tasks.map((task) => {
    if (task._id.toString() === taskId.toString()) {
      task.position = position;
      // console.log(task);
    }
  });
  project.save((err) => {
    if (err)
      return res.status(400).json({ err: "task not saved with position" });
  });
  return res.status(200).json({ project });
};
// const sumItUp = async (project, sum) => {
//   console.log(project);
//   await Project.findById(project, (err, result) => {
//     console.log(result.completion_percentage);
//     sum += result.completion_percentage;
//     console.log(result.title + " " + sum);
//   });
//   return sum;
// };
const sumItUp = async (project, sum) => {
  // console.log(project);
  // console.log("sumItUp:", sum);
  try {
    const { completion_percentage } = await Project.findById(project).exec();
    // console.log(completion_percentage);
    sum += completion_percentage;
    // console.log(sum);
    return sum;
  } catch (err) {
    console.log(err);
  }
  // console.log(`completion_percentage is ${completion_percentage}, updated sum is ${sum}`);
};
const updateUserCompletion = async (user) => {
  // console.log(user);
  let sum = 0;
  for (var i = 0; i < user.projects.length; i++) {
    sum = await sumItUp(user.projects[i], sum);
    if (i === user.projects.length - 1) {
      // console.log(
      //   "Start:",
      //   user.completion_percentage_of_all_projects,
      //   user.projects.length
      // );
      user.completion_percentage_of_all_projects = 0;
      if (user.projects.length !== 0 && sum !== NaN) {
        // console.log("sum:", sum);
        user.completion_percentage_of_all_projects = sum / user.projects.length;
        // console.log(
        //   "End:",
        //   user.completion_percentage_of_all_projects,
        //   user.projects.length
        // );
      }
      user.save();
    }
    // console.log(user.name + " " + user.project[i].title + " " + sum);
  }
  // console.log(sum);
};

async function proj_completion(project) {
  let planned = 0,
    wip = 0,
    review = 0,
    completed = 0;
  // console.log(project);
  await project.tasks.map((task) => {
    if (task.status === "PLANNED") planned++;
    else if (task.status === "WIP") wip++;
    else if (task.status === "Review") review++;
    else if (task.status === "COMPLETED") completed++;
  });

  // console.log(planned, wip, review , completed )
  let total_task = planned + wip + review + completed;
  // console.log(total_task);
  let comp_percentage = 0;
  if (total_task !== 0)
    comp_percentage =
      (planned * 0 + wip * 0.33 + review * 0.66 + completed) / total_task;
  // console.log(comp_percentage*100);
  // console.log(request.body);

  project.completion_percentage = comp_percentage * 100;
  // console.log("completion percentage:", project.completion_percentage);
  project.save();
}

exports.updateTasks = async (request, res) => {
  let id = request.body.id;
  let project = request.projectObject;
  project.tasks.map(async (task) => {
    if (
      task._id.toString() === id.toString() &&
      id !== undefined &&
      task._id !== undefined
    ) {
      task.taskName = request.body.taskName;
      task.taskDescription = request.body.taskDescription;
      task.pessimisticTime = request.body.pessimisticTime;
      task.optimisticTime = request.body.optimisticTime;
      task.mostLikelyTime = request.body.mostLikelyTime;
      task.status = request.body.status;
      task.assignedTo = request.body.assignedTo;
    }
  });
  proj_completion(project);

  await project.team.forEach((user) => {
    User.findById(user, (err, res) => {
      if (err) {
        res.status(400).json({ err: err });
      } else {
        updateUserCompletion(res);
      }
    });
  });
  // console.log(users);
  // console.log(request.body);
  return res.status(200).json({ project });
};

function removeItemOnce(arr, index) {
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

exports.deleteTasks = async (req, res) => {
  let project = req.projectObject;
  let id = req.body.id;
  // console.log("from delete tasks");
  // console.log(project.tasks, id);
  project.tasks.map((task, index) => {
    if (task.predecessors.includes(id)) {
      task.predecessors.pull(id);
      // console.log(
      //   "task name ",
      //   task.taskName,
      //   "new predecessors:",
      //   task.predecessors
      // );
    }
    if (task._id.toString() === id.toString()) {
      project.tasks = removeItemOnce(project.tasks, index);
    }
  });
  let cons = project.connections;
  let newcons = [];
  // console.log(cons);
  cons.forEach((con) => {
    if (
      con.from.toString() !== id.toString() &&
      con.to.toString() !== id.toString()
    )
      newcons.push(con);
  });
  // console.log(newcons);
  project.connections = newcons;
  // project.save();
  await proj_completion(project);
  return res.status(200).json({ project });
};

exports.deleteConnections = (req, res) => {
  // console.log(req.body);
  let project = req.projectObject;
  let cons = project.connections;
  let newcons = [];
  let tasks = project.tasks;
  // console.log(req.body.Id);
  let to = "",
    from = "";
  cons.forEach((con) => {
    if (con._id.toString() !== req.body.Id.toString()) {
      newcons.push(con);
    } else {
      to = con.to;
      from = con.from;
    }
  });
  tasks.map((task) => {
    if (task._id.toString() === to.toString()) {
      const index = task.predecessors.indexOf(from.toString());
      if (index > -1) {
        task.predecessors.splice(index, 1);
      }
    }
  });
  console.log(newcons);
  project.connections = newcons;
  project.save();
  return res.status(200).json({ project });
};
