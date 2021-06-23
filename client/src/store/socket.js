import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "socket",
  initialState: {
    activeUsers: [],
  },
  reducers: {
    updateActiveUsers: (state, action) => {
      const activeUsers = action.payload.activeUsers;
      void (state.activeUsers = activeUsers);
    },
  },
});
// export const updateActiveUsersFunc = (activeUsers) => (dispatch) => {
//   // value = getState().socket.activeUsers;
//   // dispatch(slice.reducers.updateActiveUsers({ activeUsers }));
//   console.log("yooo:", activeUsers, dispatch, slice);
// };
export const { updateActiveUsers } = slice.actions;
export default slice.reducer;
