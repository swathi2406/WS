const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const expressValidator = require("express-validator");
const fs = require("fs");
const cors = require("cors");
const dotenv = require("dotenv");
var socket = require("socket.io");
dotenv.config();
const { getChat, addFeedbackNotification } = require("./controllers/project");
const { getPersonalChat, getBlockedUsers } = require("./controllers/user");

// "mongodb://localhost/nodeapi"
// process.env.MONGO_URI
mongoose
  .connect("mongodb://localhost/nodeapi", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connected!!!");
  });

mongoose.connection.on("error", (err) => {
  console.log(`DB Connection error: ${err.message}`);
});

//bring in routes
const postRoutes = require("./routes/post");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const projectRoutes = require("./routes/project");
const utilRoutes = require("./routes/utils");
const tasksRoutes = require("./routes/tasks");
const notifRoutes = require("./routes/notifications");
// api docs
app.get("/", (req, res) => {
  fs.readFile("docs/apiDocs.json", (err, data) => {
    if (err) {
      res.status(400).json({
        error: err,
      });
    }
    const docs = JSON.parse(data);
    res.json(docs);
  });
});

//middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());
app.use("/", postRoutes);
app.use("/", projectRoutes);
app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", tasksRoutes);
app.use("/", utilRoutes);
app.use("/", notifRoutes);
app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ error: "Unauthorized!" });
  }
});
require("./prod")(app);
const port = process.env.PORT || 8081;
const server = app.listen(port, () => {
  console.log(`A Node JS API is listening on port: ${port}`);
});

const sio = require("socket.io")(server, {
  handlePreflightRequest: (req, res) => {
    const headers = {
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
      "Access-Control-Allow-Credentials": true,
    };
    res.writeHead(200, headers);
    res.end();
  },
});

let users = {};
let rating = {};
let peers = [];
const broadcastEventTypes = {
  ACTIVE_USERS: "ACTIVE_USERS",
  GROUP_CALL_ROOMS: "GROUP_CALL_ROOMS",
};
sio.sockets.emit("broadcast", {
  event: broadcastEventTypes.ACTIVE_USERS,
  activeUsers: peers,
});
sio.on("connection", (socket) => {
  console.log("Connected!");
  socket.emit("connection", null);

  socket.on("addFeedbackForm", ({ rating, projectId }) => {
    addFeedbackNotification(rating, projectId);
  });
  socket.on("getChat", async ({ project_id, client_chat_length }) => {
    const chats = await getChat(project_id);
    if (client_chat_length !== chats.length)
      sio.emit("chat" + project_id, chats);
  });

  socket.on("message", ({ name, message, created, project_id }) => {
    console.log("message");
    sio.emit("message" + project_id, { name, message, created });
  });

  socket.on("login", function (data) {
    console.log("a user " + data.userId + " connected", socket.id);
    // saving userId to array with socket ID
    users[socket.id] = data.userId;
    console.log(users);
  });

  socket.on("signout", function (data) {
    // remove saved socket from users object
    delete users[socket.id];
    console.log("onlineUsers:", users);
  });

  socket.on("getOnlineUsers", () => {
    sio.sockets.emit("onlineUsers", {
      users,
    });
  });
  socket.on("register", async (data) => {
    let user = { userId: data.userId, socketId: socket.id };
    let val = false;
    await peers.map((peer, index) => {
      if (peer.userId.toString() === user.userId.toString()) {
        val = true;
        console.log("check val1:", val);
        peers.splice(index);
      }
    });
    console.log(val);
    // if (val === false) {
    peers.push(user);
    console.log(peers);
    // } else {
    // }
    // console.log(peers);
  });
  socket.on(
    "getPersonalChat",
    async ({ userid, touser, client_chat_length }) => {
      let chats = await getPersonalChat(userid);
      chats = chats.filter(
        (x) =>
          x.fromuser + "" === touser + "" || x.touser_id + "" === touser + ""
      );
      if (client_chat_length !== chats.length) {
        sio.emit("personalchat" + userid, chats);
      }
    }
  );

  socket.on(
    "personal_message",
    async ({ from_name, toname, message, created, touser_id, fromuser }) => {
      let blocked_users = await getBlockedUsers(touser_id.toString());
      if (blocked_users.indexOf(fromuser.toString()) < 0) {
        sio.emit("personal_message" + touser_id.toString(), {
          from_name,
          toname,
          message,
          created,
          touser_id,
          fromuser,
        });
      }
      sio.emit("personal_message" + fromuser.toString(), {
        from_name,
        toname,
        message,
        created,
        touser_id,
        fromuser,
      });
    }
  );
});
