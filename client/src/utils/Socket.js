import { io } from "socket.io-client";
import { isAuthenticated } from "../auth";
import { updateActiveUsers } from "../store/socket";
import store from "../store/store";
const storeObj = store();
// import { updateActiveUsersFunc } from "./../store/socket";
var options = {
  rememberUpgrade: true,
  transports: ["websocket"],
  secure: true,
  rejectUnauthorized: false,
};
const broadcastEventTypes = {
  ACTIVE_USERS: "ACTIVE_USERS",
  GROUP_CALL_ROOMS: "GROUP_CALL_ROOMS",
};
const socket = io("http://localhost:8081", options);
socket.on("connection", () => {
  console.log("succesfully connected with server");
  console.log(socket.id);
  if (isAuthenticated()) {
    const userId = isAuthenticated().user._id;
    registerUser(userId);
  }
});
socket.on("broadcast", (data) => {
  handleBroadcastEvents(data);
});
// let checkSocketIdPresenceInArray = (arr, socketId) =>
//   arr.some((obj) => Object.values(obj).includes(socketId));
const activeUsersArray = async (data) => {
  const userId = isAuthenticated().user._id;
  const activeUsers = await data.activeUsers.filter(
    (activeUser) => activeUser.userId !== userId
  );
  return activeUsers;
};
const handleBroadcastEvents = async (data) => {
  switch (data.event) {
    case broadcastEventTypes.ACTIVE_USERS:
      // console.log(checkSocketIdPresenceInArray(data.activeUsers, socket.id));
      if (isAuthenticated()) {
        activeUsersArray(data).then((activeUsers) => {
          console.log("active users:", activeUsers);
          // const dispatch = useDispatch();
          storeObj.dispatch(updateActiveUsers({ activeUsers }));
        });
        // store.dispatch(socket.updateActiveUsers({ activeUsers }))
        // updateActiveUsersFunc(activeUsers);
      }
      break;
    default:
      break;
  }
};
export const registerUser = (userId) => {
  let obj = { userId };
  socket.emit("register", obj);
};

export default socket;
