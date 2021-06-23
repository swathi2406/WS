import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "user",
  initialState: {
    following: [],
    followers: [],
    friends: [],
    profilePic: "",
  },
  reducers: {
    updateFollowing: (state, action) => {
      const tasks = action.payload.following;
      void (state.following = tasks);
    },
    updateFollowers: (state, action) => {
      const tasks = action.payload.followers;
      void (state.followers = tasks);
    },
    friendAdded: (state, action) => {
      const user = action.payload.user;
      let obj = {};
      let canAdd = true;
      Object.keys(state).map((key) => {
        if (key.toString() !== "profilePic")
          state[key].map((val) => {
            let userObj = { ...val };
            if (userObj._id === user._id) {
              canAdd = false;
            }
          });
      });
      if (canAdd) state.friends.push(user);
    },
    clearFriends: (state, action) => {
      void (state.friends = []);
    },
    setProfilePic: (state, action) => {
      const profilePic = action.payload.profilePic;
      void (state.profilePic = profilePic);
    },
  },
});
export const {
  updateFollowing,
  updateFollowers,
  friendAdded,
  clearFriends,
  setProfilePic,
} = slice.actions;
export default slice.reducer;
