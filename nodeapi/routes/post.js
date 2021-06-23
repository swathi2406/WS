const express = require("express");
const {
  getPosts,
  createPost,
  postsByUser,
  postById,
  isPoster,
  updatePost,
  deletePost,
  convertToWebp,
  likePost,
  dislikePost,
  addcomment,
  reportPost,
  getPost,
  postVideo,
  videoPostMongo,
  createTextPost,
  createYoutubePost,
  getLikesOfPost,
  getCommentsOfPost,
  editPost,
  deleteComment,
} = require("../controllers/post");
const { requireSignin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const multer = require("multer");
const router = express.Router();
const path = require("path");
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(null, "IMAGE-" + Date.now() + path.extname(file.originalname));
  },
});
const storageVideo = multer.diskStorage({
  destination: "./public/uploadVideos/",
  filename: function (req, file, cb) {
    cb(null, "VIDEO-" + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 },
}).single("myImage");
const uploadVideo = multer({
  storage: storageVideo,
  limits: { size: 524288000 },
}).single("myVideo");
router.get("/posts", getPosts);
router.post("/post/new/:userId", requireSignin, createPost);
router.post("/post/new/text/:userId", requireSignin, createTextPost);
router.post("/post/new/youtube/:userId", requireSignin, createYoutubePost);
router.post("/post/new/video/:userId", requireSignin, videoPostMongo);
router.get("/posts/by/:userId", requireSignin, postsByUser);
router.put("/post/:postId", requireSignin, isPoster, updatePost);
router.post("/convertToWebp", upload, convertToWebp);
router.post("/postVideo", uploadVideo, postVideo);
router.put("/post/like/:postId", requireSignin, likePost);
router.put("/post/edit/:postId", requireSignin, editPost);
router.put("/post/deleteComment/:postId", requireSignin, deleteComment);
router.put("/post/dislike/:postId", requireSignin, dislikePost);
router.put("/post/addcomment/:postId", requireSignin, addcomment);
router.get("/post/:postId", getPost);
router.put("/post/report/:userId/:postId", requireSignin, reportPost);
router.delete("/post/delete/:postId", requireSignin, deletePost);
router.get("/post/likes/:postId", getLikesOfPost);
router.get("/post/comments/:postId", getCommentsOfPost);
// any route containing: userId, our app will first excute userById()
router.param("userId", userById);
// any route containing: postId, our app will first excute postById()
router.param("postId", postById);

module.exports = router;
