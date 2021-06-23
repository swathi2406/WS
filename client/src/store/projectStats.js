import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "projectStats",
  initialState: {
    firstLayer: {
      startDate: new Date(),
      daysLeft: "Not Calculated",
      endDate: new Date(),
      toDoTasks: 0,
      onGoingTasks: 0,
      reviewingTasks: 0,
      completedTasks: 0,
    },
    secondLayer: {},
    thirdLayer: {},
  },
  reducers: {
    clearFirstLayer: (state, action) => {
      state.firstLayer = {
        startDate: new Date(),
        daysLeft: "Not Calculated",
        endDate: new Date(),
        toDoTasks: 0,
        onGoingTasks: 0,
        reviewingTasks: 0,
        completedTasks: 0,
      };
    },
    setFirstLayer: (state, action) => {
      const firstLayer = action.payload.firstLayer;
      void (state.firstLayer = firstLayer);
    },
    clearSecondLayer: (state, action) => {
      state.secondLayer = {};
    },
    setSecondLayer: (state, action) => {
      const secondLayer = action.payload.secondLayer;
      void (state.secondLayer = secondLayer);
    },
    clearThirdLayer: (state, action) => {
      state.thirdLayer = {};
    },
    setThirdLayer: (state, action) => {
      const thirdLayer = action.payload.thirdLayer;
      void (state.thirdLayer = thirdLayer);
    },
  },
});
export const {
  clearFirstLayer,
  setFirstLayer,
  setSecondLayer,
  clearSecondLayer,
  setThirdLayer,
  clearThirdLayer,
} = slice.actions;
export default slice.reducer;
