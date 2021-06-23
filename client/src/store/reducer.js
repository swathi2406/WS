import cpmReducer from "./cpm";
import notificationReducer from "./notifications";
import tasksReducer from "./tasks";
import userReducer from "./user";
import postsReducer from "./posts";
import projectStatsReducer from "./projectStats";
import socketReducer from "./socket";
import { combineReducers } from "redux";
console.log(socketReducer);
export default combineReducers({
  cpm: cpmReducer,
  notifications: notificationReducer,
  tasks: tasksReducer,
  user: userReducer,
  posts: postsReducer,
  projectStats: projectStatsReducer,
  socket: socketReducer,
});
