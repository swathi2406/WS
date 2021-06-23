import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "tasks",
  initialState: {
    tasks: [],
    updateTrelloBoard: false,
  },
  reducers: {
    updateTasks: (state, action) => {
      const tasks = action.payload.tasks;
      void (state.tasks = tasks);
    },
    updateTrello: (state, action) => {
      const update = action.payload.update;
      void (state.updateTrelloBoard = update);
    },
  },
});
export const { updateTasks, updateTrello } = slice.actions;
export default slice.reducer;
