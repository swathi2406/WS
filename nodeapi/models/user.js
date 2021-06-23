const mongoose = require("mongoose");
const { v1: uuidv1 } = require("uuid");
const crypto = require("crypto");
const { ObjectId } = mongoose.Schema;

var userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  username: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
  },
  hashed_password: {
    type: String,
    required: true,
  },
  salt: String,
  created: {
    type: Date,
    default: Date.now,
  },
  projects: [
    {
      type: ObjectId,
      ref: "Project",
    },
  ],
  completed_projects: [
    {
      type: ObjectId,
      ref: "Project",
    },
  ],
  completion_percentage_of_all_projects: {
    type: Number,
    default: 0,
  },
  teacher: {
    type: Boolean,
    default: false,
  },
  ratings: [
    {
      type: Number,
    },
  ],
  rating: {
    type: Number,
    default: 0,
  },
  updated: Date,
  dob: {
    type: Date,
  },
  location: {
    type: String,
  },
  skills: {
    type: [String],
    required: true,
  },
  bio: {
    type: String,
  },
  newNotification: {
    type: Boolean,
    default: false,
  },
  blocked_users: [
    {
      type: ObjectId,
      ref: "User",
    },
  ],
  blocked_by: [
    {
      type: ObjectId,
      ref: "User",
    },
  ],
  chat: [
    {
      from_name: {
        type: String,
        required: true,
      },
      toname: {
        type: String,
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      created: {
        type: Date,
        default: Date.now,
      },
      touser_id: {
        type: ObjectId,
        ref: "User",
      },
      fromuser: {
        type: ObjectId,
        ref: "User",
      },
    },
  ],
  notifications: [
    {
      message: {
        type: String,
      },
      read: {
        type: Boolean,
      },
      notifType: {
        type: String,
      },
      projectId: {
        type: ObjectId,
        ref: "Project",
      },
      postId: {
        type: ObjectId,
        ref: "Post",
      },
      userObjId: {
        type: ObjectId,
        ref: "User",
      },
      sentBy: {
        type: ObjectId,
        ref: "User",
      },
      sentTo: {
        type: ObjectId,
        ref: "User",
      },
      roleId: {
        type: ObjectId,
      },
      project: {},
    },
  ],
  social: {
    website: {
      type: String,
    },
    facebook: {
      type: String,
    },
    instagram: {
      type: String,
    },
    youtube: {
      type: String,
    },
    linkedin: {
      type: String,
    },
    twitter: {
      type: String,
    },
  },
  followers: [
    {
      type: ObjectId,
      ref: "User",
    },
  ],
  following: [
    {
      type: ObjectId,
      ref: "User",
    },
  ],
  profilePictures: [
    {
      type: String,
      default:
        "http://res.cloudinary.com/workshaketrial/image/upload/v1622131040/DefaultProfile.png",
    },
  ],
});

userSchema
  .virtual("password")
  .set(function (password) {
    // create temporary variable called _password
    this._password = password;
    // generate a timestap
    this.salt = uuidv1();
    // encryptPassword()
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

// methods
userSchema.methods = {
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) == this.hashed_password;
  },

  encryptPassword: function (password) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
};

module.exports = mongoose.model("User", userSchema);
