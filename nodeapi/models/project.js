const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

var projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  academic: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    required: true,
  },
  skills: [String],
  leader: {
    type: ObjectId,
    ref: "User",
  },
  team: [
    {
      type: ObjectId,
      ref: "User",
    },
  ],
  status: {
    type: String,
    default: "In Progress",
  },
  completion_percentage: {
    type: Number,
    required: true,
    default: 0,
  },
  created: {
    type: String,
    default: Date,
  },
  feedback: [
    {
      projectId: { type: ObjectId, ref: "Project" },
      team: [
        {
          type: ObjectId,
          ref: "User",
        },
      ],
    },
  ],
  chat: [
    {
      name: {
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
    },
  ],
  roles: [
    {
      roleName: {
        type: String,
        required: true,
      },
      roleSkills: {
        type: [String],
        required: true,
      },
      assignedTo: {
        type: ObjectId,
        ref: "User",
      },
      requestBy: [
        {
          type: ObjectId,
          ref: "User",
        },
      ],
    },
  ],
  tasks: [
    {
      position: {
        x: 0,
        y: 0,
      },
      taskName: {
        type: String,
      },
      taskDescription: {
        type: String,
      },
      assignedTo: [
        {
          type: ObjectId,
          ref: "User",
        },
      ],
      status: {
        type: String,
      },
      created: {
        type: String,
        default: Date,
      },
      pessimisticTime: {
        type: Number,
      },
      mostLikelyTime: {
        type: Number,
      },
      optimisticTime: {
        type: Number,
      },
      predecessors: [ObjectId], // taskIds
    },
  ],
  connections: [
    {
      from: ObjectId, // taskIds
      to: ObjectId, // taskIds
    },
  ],
  overdueCounter: {
    type: Object,
    default: {},
  },
  estimatedTime: {
    type: Number,
  },
  //Academic
  mentors: [
    {
      // type: String,
      label: String,
      id: ObjectId,
    },
  ],
  mentors_requested: [
    {
      // type: String,
      label: String,
      id: ObjectId,
    },
  ],
  subject: {
    type: String,
  },
  semester: {
    type: String,
  },
  teamMates: [
    { type: String },
    // {
    //   type: ObjectId,
    //   ref: "User",
    // },
  ],
});

module.exports = mongoose.model("Project", projectSchema);
