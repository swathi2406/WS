const express = require("express");
const {
  userById,
  allUsers,
  getUser,
  getUserInfo,
  updateUser,
  deleteUser,
  followRequest,
  unfollowRequest,
  setRating,
  getfollowers,
  getfollowing,
  getfriends,
  updatePersonalChat,
  clearchat,
  blockuser,
  unblockuser,
  addProfilePic,
  blockfollower,
  processResumes,
  removeProfilePic,
  getProfilePic,
  getMentors,
  getStudents,
} = require("../controllers/user");
const { requireSignin } = require("../controllers/auth");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(null, "IMAGE-" + Date.now() + path.extname(file.originalname));
  },
});
const storagePdfs = multer.diskStorage({
  destination: "./public/uploads/resume/",
  filename: function (req, file, cb) {
    cb(null, "PDF-" + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 },
}).single("myProfilePicture");
const uploadPdfs = multer({
  storage: storagePdfs,
}).single("myFile");
router.use(bodyParser.json());

router.get("/users", allUsers);
router.get("/user/:userId", requireSignin, getUser);
router.put("/user/:userId", requireSignin, updateUser);
router.delete("/user/:userId", requireSignin, deleteUser);
router.get("/userInfo/:userId", getUserInfo);
router.put("/follow/:userId", requireSignin, followRequest);
router.put("/unfollow/:userId", requireSignin, unfollowRequest);
router.put("/user/rating/:userId", requireSignin, setRating);
router.put("/updatechat", updatePersonalChat);
router.get("/followers/:userId", requireSignin, getfollowers);
router.get("/following/:userId", requireSignin, getfollowing);
router.get("/friends/:userId", requireSignin, getfriends);
router.put("/clearchat", requireSignin, clearchat);
router.put("/blockuser", requireSignin, blockuser);
router.put("/unblockuser", requireSignin, unblockuser);
router.put("/blockfollower", requireSignin, blockfollower);
router.put(
  "/user/profilePicture/:userId",
  requireSignin,
  upload,
  addProfilePic
);
router.put("/processResumes", uploadPdfs, processResumes);
router.put("/user/profilePicture/remove/:userId", removeProfilePic);
router.get("/user/profilePic/:userId", getProfilePic);
// any route containing: userId, our app will first excute userById()
router.get("/mentors", getMentors);
router.get("/students", getStudents);
router.param("userId", userById);

module.exports = router;
