import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { addNotification, getNotifications } from "./../apiNotifications";
import { toast } from "react-toastify";
import { isAuthenticated } from "../auth";

const slice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
    segregatedNotifications: {},
  },
  reducers: {
    notificationAdded: (state, action) => {
      console.log("payload:", action.payload);
      addNotification(
        action.payload.userId,
        action.payload.message,
        action.payload.type,
        action.payload.projectId !== undefined
          ? action.payload.projectId
          : undefined,
        action.payload.postId !== undefined ? action.payload.postId : undefined,
        action.payload.userObjId !== undefined
          ? action.payload.userObjId
          : undefined,
        action.payload.sentBy !== undefined ? action.payload.sentBy : undefined,
        action.payload.sentTo !== undefined ? action.payload.sentTo : undefined,
        action.payload.roleId !== undefined ? action.payload.roleId : undefined,
        action.payload.project !== undefined
          ? action.payload.project
          : undefined
      )
        .then((response) => {
          return response.json();
        })
        .then((user) => {
          if (user.user !== undefined) {
            console.log(user);
            let notifications = user.user.notifications;
            if (action.payload.userId === isAuthenticated().user._id) {
              toast.dark(action.payload.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
            }
            console.log(notifications);
          }
        });
    },
    getNotified: (state, action) => {
      state.notifications.push({
        id: action.payload.id,
        message: action.payload.message,
        read: action.payload.read,
        type: action.payload.type,
        projectId: action.payload.projectId,
      });
    },
    clearNotifications: (state, action) => {
      state.notifications = [];
    },
    setSegregatedNotifications: (state, action) => {
      const segregatedNotificationsObj = action.payload.segregatedNotifications;
      void (state.segregatedNotifications = segregatedNotificationsObj);
    },
    setNotifications: (state, action) => {
      const notifications = action.payload.notifications;
      void (state.notifications = notifications);
    },
  },
});
export const {
  notificationAdded,
  getNotified,
  clearNotifications,
  setSegregatedNotifications,
  setNotifications,
} = slice.actions;
export default slice.reducer;
