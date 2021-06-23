const _ = require("lodash");
const User = require("../models/user");
const fs = require("fs");
const sharp = require("sharp");
const PDFParser = require("pdf2json");
exports.userById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    req.profile = user; // Adds profile object in req with user info
    next();
  });
};
function getUserById(id) {
  User.findOne({ _id: id }, (err, res) => {
    if (err) return "User Not Found";
    return res;
  });
}

exports.getUserInfo = (req, res) => {
  let user = req.profile;
  if (user) {
    res.status(200).json({ user });
  } else {
    res.status(200).json({ err: "Could not fetch user" });
  }
};
exports.hasAuthorization = (req, res, next) => {
  const authorized =
    req.profile && req.auth && req.profile._id === req.auth._id;
  if (!authorized) {
    return res
      .status(403)
      .json({ error: "User is not authorized to perform this action." });
  }
};

exports.allUsers = (req, res) => {
  User.find((err, users) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.json(users);
  }).select(
    "name email updated created username bio social location skills dob projects completed_projects rating completion_percentage_of_all_projects followers following"
  );
};

exports.getUser = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};

exports.updateUser = (req, res, next) => {
  let user = req.profile;
  user = _.extend(user, req.body); //extend - mutates the source object
  user.updated = Date.now();
  user.save((err) => {
    if (err) {
      return res
        .status(400)
        .json({ err: "You are not authorized to perform this action" });
    }
    user.hashed_password = undefined;
    user.salt = undefined;
    res.json({ user });
  });
};

exports.deleteUser = (req, res, next) => {
  let user = req.profile;
  user.remove((err, user) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.json({ message: "User deleted successfully!" });
  });
};
exports.setRating = (req, res) => {
  let user = req.profile;
  let rating = req.body.rating;
  console.log("Before:");
  console.log(user.ratings, user.rating, rating);
  console.log("On Process:");
  Object.keys(rating).map((key) => {
    User.findById(key, (err, userObj) => {
      // console.log(userObj.ratings, userObj.rating);
      userObj.ratings.push(rating[key]);
      let sum = 0;
      userObj.ratings.map((rat) => {
        sum += rat;
      });
      userObj.rating = sum / userObj.ratings.length;
      console.log(`after(${userObj.name}):`);
      console.log(userObj.ratings, userObj.rating);
      userObj.save((err) => {
        if (err) res.status(400).json({ err });
      });
    });
  });
  return res.status(200).json({ message: "Updated Ratings" });
};

exports.followRequest = (req, res) => {
  let user = req.profile;
  console.log(user);
  user.following.push(req.body.followId);
  user.save();
  User.findById(req.body.followId, (err, result) => {
    result.followers.push(user._id);
    result.save();
  });
  return res.status(200).json({ user });
};

exports.unfollowRequest = (req, res) => {
  let user = req.profile;
  user.following.pull(req.body.followId);
  user.save();
  User.findById(req.body.followId, (err, result) => {
    result.followers.pull(user._id);
    result.save();
  });
  return res.status(200).json({ user });
};

exports.getfollowers = (req, res) => {
  let user = req.profile;
  User.findById(user._id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    return res.json(user.followers);
  });
};

exports.getfollowing = (req, res) => {
  let user = req.profile;
  User.findById(user._id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    return res.json(user.following);
  });
};

exports.getfriends = (req, res) => {
  let user = req.profile;
  User.findById(user._id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    let final = user.following.filter((value) =>
      user.followers.includes(value)
    );
    return res.json(final);
  });
};

exports.updatePersonalChat = (req, res) => {
  let chat_msg = req.body.chat;
  console.log(chat_msg);
  User.findById(req.body.chat.touser_id).exec((err, user) => {
    if (err || !user) console.log("user not found");
    else {
      if (user.blocked_users.indexOf(req.body.chat.fromuser) < 0)
        user.chat.push(chat_msg);
      user.save();
    }
  });
  User.findById(req.body.chat.fromuser).exec((err, user) => {
    if (err || !user) console.log("user not found");
    else {
      user.chat.push(chat_msg);
      user.save();
    }
  });
  return res.status(200).json("personal chat updated");
};

exports.getPersonalChat = async (id) => {
  const { chat } = await User.findById(id).exec();
  return chat;
};

exports.clearchat = async (req, res) => {
  User.findById(req.body.current_user_id).exec((err, user) => {
    if (err || !user) console.log("user not found");
    else {
      let chat = user.chat;
      let new_chats = [];
      chat.map((c) => {
        if (
          c.touser_id.toString() !== req.body.client_user_id.toString() &&
          c.fromuser.toString() !== req.body.client_user_id.toString()
        )
          new_chats.push(c);
      });
      user.chat = new_chats;
      user.save();
    }
  });
  return res.status(200).json("chat cleared");
};

exports.blockuser = (req, res) => {
  User.findById(req.body.current_user_id).exec((err, user) => {
    if (err || !user) console.log("user not found");
    else {
      user.blocked_users.push(req.body.client_user_id);
      user.save();
    }
  });
  User.findById(req.body.client_user_id).exec((err, user) => {
    if (err || !user) console.log("user not found");
    else {
      user.blocked_by.push(req.body.current_user_id);
      user.save();
    }
  });
  return res.status(200).json("User blocked");
};

exports.unblockuser = (req, res) => {
  User.findById(req.body.current_user_id).exec((err, user) => {
    if (err || !user) console.log("user not found");
    else {
      user.blocked_users.pull(req.body.client_user_id);
      user.save();
    }
  });
  User.findById(req.body.client_user_id).exec((err, user) => {
    if (err || !user) console.log("user not found");
    else {
      user.blocked_by.pull(req.body.current_user_id);
      user.save();
    }
  });
  return res.status(200).json("User unBlocked");
};

exports.getBlockedUsers = async (id) => {
  const { blocked_users } = await User.findById(id).exec();
  return blocked_users;
};

exports.addProfilePic = (req, res) => {
  let file = req.file;
  const cloudinary = require("cloudinary").v2;
  cloudinary.config({
    cloud_name: "workshaketrial",
    api_key: "141328859214936",
    api_secret: "ped5_kvwuwzIV2YJxxkFkDKmKHw",
  });
  sharp(file.destination + file.filename)
    .resize(1000, 1000)
    .webp()
    .toFile(file.destination + file.filename + " edited.webp", (data) => {
      console.log(data);
      cloudinary.uploader.upload(
        file.destination + file.filename + " edited.webp",
        (err, result) => {
          if (err) {
            console.log("error:", err);
            return res.status(400).json({ err });
          }
          console.log("result:", result);
          fs.unlink(
            file.destination + file.filename + " edited.webp",
            function (err) {
              if (err && err.code == "ENOENT") {
                // file doens't exist
                console.info("File doesn't exist, won't remove it.");
              } else if (err) {
                // other errors, e.g. maybe we don't have enough permission
                console.error("Error occurred while trying to remove file");
              } else {
                console.info(`removed`);
              }
            }
          );
          let user = req.profile;
          user.profilePictures.push(result.url);
          user.save((err, result) => {
            if (err) return res.status(400).json({ error: "cannot save dp" });
            return res.status(200).json({ user: result });
          });
        }
      );
    });
};

exports.blockfollower = (req, res) => {
  User.findById(req.body.currentUser).exec((err, user) => {
    if (err || !user) console.log("user not found");
    else {
      user.followers.pull(req.body.follower);
      if (user.following.includes(req.body.follower))
        user.following.pull(req.body.follower);
      user.blocked_users.push(req.body.follower);
      user.save();
    }
  });
  User.findById(req.body.follower).exec((err, user) => {
    if (err || !user) console.log("user not found");
    else {
      user.following.pull(req.body.currentUser);
      if (user.followers.includes(req.body.currentUser))
        user.followers.pull(req.body.currentUser);
      user.blocked_by.push(req.body.currentUser);
      user.save();
    }
  });
  User.findById(req.body.currentUser).exec((err, user) => {
    if (err || !user) return res.status(400).json({ error: "user not found" });
    return res.status(200).json({ user });
  });
  // return res.status(200).json("User Blocked");
};

exports.processResumes = (req, res) => {
  let pdfParser = new PDFParser();
  // console.log(req.file);
  // console.log("HIII");
  let file = req.file;
  // console.log(files);
  // files.map((file) => {
  // [ {akshay:{name: "akshay", skills: "html, css", score: 83, experience: 5 (no. of years)}}]
  let filepath = file.destination + file.filename;
  let k = 0;
  let obj = {};
  let arr = [];
  pdfParser.loadPDF(filepath);
  pdfParser.on("pdfParser_dataReady", (pdfData) => {
    // console.log(pdfData);
    let newObject = {};
    newObject = pdfData.formImage.Pages.map((page) => {
      // page.Texts.map((val) =>
      //   val.R.map((obj) => console.log(obj.T.split("%")))
      // );
      page.Fields.map((val) => (obj[k++] = val.V));
      // console.log(obj["0"], obj["1"], obj["2"], obj["3"]);
      let newObj = {
        name: obj["0"],
        experience: obj["1"],
        cgpa: obj["2"],
        skills: obj["3"].split(","),
        college: obj["4"],
        projects: [obj["5"], obj["6"], obj["7"]],
        publications: [obj["8"], obj["9"], obj["10"]],
      };
      return newObj;
    });
    let finalObj = newObject[newObject.length - 1];
    fs.unlink(filepath, function (err) {
      if (err && err.code == "ENOENT") {
        // file doens't exist
        console.info("File doesn't exist, won't remove it.");
      } else if (err) {
        // other errors, e.g. maybe we don't have enough permission
        console.error("Error occurred while trying to remove file");
      } else {
        console.info(`removed`);
      }
    });
    return res.status(200).json({ pdfData: finalObj });
  });
};
// return res.status(400).json({ error: "Cannot parse pdf" });
// console.log(pdfData.PdfParser.PDFJs);
// });
exports.removeProfilePic = (req, res) => {
  let user = req.profile;
  user.profilePictures.push(
    "http://res.cloudinary.com/workshaketrial/image/upload/v1622131040/DefaultProfile.png"
  );
  user.save((err, result) => {
    if (err) return res.status(400).json({ error: "cannot save dp" });
    return res.status(200).json({ user: result });
  });
};

exports.getProfilePic = (req, res) => {
  let profilePictures = req.profile.profilePictures;
  if (profilePictures.length !== 0) {
    return res
      .status(200)
      .json({ profilePic: profilePictures[profilePictures.length - 1] });
  }
  return res.status(400).json({ profilePic: undefined });
};

// Academic

exports.getMentors = (req, res) => {
  User.find({ teacher: true }, (err, result) => {
    if (err) return res.status(400).json({ error: "No teachers" });
    return res.status(200).json({ teachers: result });
  });
};
exports.getStudents = (req, res) => {
  User.find({ teacher: false }, (err, result) => {
    if (err) return res.status(400).json({ error: "No Students" });
    return res.status(200).json({ students: result });
  });
};
