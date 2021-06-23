const express = require("express");
const {
  createProject,
  allProjects,
  projectById,
  requestRole,
  roleById,
  acceptRequest,
  declineRequest,
  getRequests,
  getRoles,
  getProjectsOfUser,
  updateProject,
  deleteProject,
  leaveProject,
  getTeam,
  submitProject,
  updateChat,
  checkIfProjectExists,
  checkIfProjectExiststeacher,
  getProject,
  updateEstimatedTime,
  kickOutCounterUpdate,
  newAcademicProject,
  acceptProject,
  declineProject
} = require("../controllers/project");
const { requireSignin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const { createProjectValidator } = require("../validator");
const router = express.Router();

router.get("/projects", allProjects);
router.get("/project/:projectId", getProject);
router.get("/projects/user/:userId", requireSignin, getProjectsOfUser);
router.delete("/project/delete/:projectId", requireSignin, deleteProject);
router.put("/project/finish/:projectId", requireSignin, submitProject);
router.post(
  "/project/new/:userId",
  requireSignin,
  createProjectValidator,
  createProject
);

router.post(
  "/recommendation/check/",
  requireSignin,
  checkIfProjectExiststeacher
);

router.put("/project/edit/:userId/:projectId", requireSignin, updateProject);
router.put("/project/chat/:projectId", requireSignin, updateChat);
router.put("/project/leave/:userId/:projectId", requireSignin, leaveProject);
router.put("/project/request/:userId/:projectId", requireSignin, requestRole);
router.get("/roles/:projectId", requireSignin, getRoles);
router.get("/project/team/:projectId", requireSignin, getTeam);
router.get("/requests/:projectId", requireSignin, getRequests);
router.put("/requests/accept/:userId/:projectId", requireSignin, acceptRequest);
router.put(
  "/requests/decline/:userId/:projectId",
  requireSignin,
  declineRequest
);
router.post("/project/check", requireSignin, checkIfProjectExists);
router.put(
  "/project/estimatedTime/:userId/:projectId",
  requireSignin,
  updateEstimatedTime
);
router.put(
  "/project/kickoutCounter/:userId/:projectId",
  requireSignin,
  kickOutCounterUpdate
);
router.put("/project/accept/:projectId/:userId", requireSignin, acceptProject)
router.put("/project/decline/:projectId/:userId", requireSignin, declineProject)
// router.put("/project/addFeedbackNotification/:userId",requireSignin,)
// any route containing: userId, our app will first excute userById()

// Academic Routes
router.post("/academicProject/new/:userId", requireSignin, newAcademicProject);
router.param("userId", userById);
router.param("projectId", projectById);

module.exports = router;
