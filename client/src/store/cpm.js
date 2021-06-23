import { createSlice } from "@reduxjs/toolkit";
import { getTasks } from "../project/apiProject";

let lastNodeId = 0;
let lastConnectionId = 0;

const slice = createSlice({
  name: "cpm",
  initialState: {
    nodes: [],
    connections: [],
    elements: [],
    pert: {},
    expectedTime: 0,
    slacks: {},
    criticalPath: {},
    allIdPertData: {},
    idFromKeyObject: {},
  },
  reducers: {
    nodeAdded: (state, action) => {
      state.nodes.push(action.payload.node);
      //   console.log(action);
      //   console.log(state, action.payload);
    },
    connectionAdded: (state, action) => {
      // console.log(action.payload);
      state.connections.push(action.payload.connection);
      //   console.log(action);
      //   console.log(state, action.payload);
    },
    replaceNodes: (state, action) => {
      const nodes = action.payload.nodes;
      void (state.nodes = nodes);
    },
    replaceConnections: (state, action) => {
      const connections = action.payload.connections;
      void (state.connections = connections);
    },
    replaceElements: (state, action) => {
      const elements = action.payload.elements;
      void (state.elements = elements);
    },
    setPert: (state, action) => {
      const pert = action.payload.pert;
      void (state.pert = pert);
    },
    setExpectedTime: (state, action) => {
      const expectedTime = action.payload.expectedTime;
      // console.log(expectedTime);
      void (state.expectedTime = expectedTime);
    },
    setAllIdPertData: (state, action) => {
      const pertData = action.payload.pertData;
      void (state.allIdPertData = pertData);
    },
    setIdFromKey: (state, action) => {
      const idFromKeyObject = action.payload.idFromKeyObject;
      void (state.idFromKeyObject = idFromKeyObject);
    },
    clearAll: (state, action) => {
      state.nodes = [];
      state.connections = [];
      state.elements = [];
      state.pert = {};
      state.expectedTime = 0;
      state.slacks = {};
      state.criticalPath = {};
    },
    setSlacks: (state, action) => {
      const slackObject = action.payload.slackObject;
      void (state.slacks = slackObject);
    },
    setCriticalPath: (state, action) => {
      const criticalPath = action.payload.criticalPath;
      void (state.criticalPath = criticalPath);
    },
  },
});
export const {
  nodeAdded,
  connectionAdded,
  replaceNodes,
  replaceConnections,
  replaceElements,
  setPert,
  setExpectedTime,
  clearAll,
  setSlacks,
  setCriticalPath,
  setAllIdPertData,
  setIdFromKey,
} = slice.actions;
export default slice.reducer;
