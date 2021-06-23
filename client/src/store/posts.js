import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getLikesOfPost, getpost } from "./../posts/apiPosts";

export const getPosts = createAsyncThunk("posts/getPosts", async () => {
  return fetch(`http://localhost:3000/posts`)
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);
      return data.posts.reverse();
    });
});
const replace = async (posts, postId, newPost) => {
  let arr = [...posts];
  let setofarr = await arr.map((post, index) => {
    if (post._id === postId) {
      arr[index] = newPost;
      // console.log("final arr:", arr);
    }
    return arr;
  });
  return setofarr[setofarr.length - 1];
  // console.log("final arr:", arr);
};
const replacePosts = (postId, spreadPosts) => {
  return getpost(postId).then(async (data) => {
    // spreadPosts.forEach((post) => (post._id === postId ? data.post : post));
    // console.log("final posts:", spreadPosts);
    let finalarr = await replace(spreadPosts, postId, data.post);
    // console.log("final posts:", finalarr);
    return finalarr;
  });
};
export const changePosts = createAsyncThunk(
  "posts/changePosts",
  async (postId, { getState }) => {
    const { posts } = getState();
    let oldposts = posts.posts;
    let spreadPosts = [...oldposts];
    let finalArr = await replacePosts(postId, spreadPosts);
    console.log(finalArr);
    return finalArr;
  }
);
const slice = createSlice({
  name: "posts",
  initialState: {
    posts: [],
  },
  reducers: {
    updatePosts: (state, action) => {
      const posts = action.payload.posts;
      void (state.posts = posts);
    },
  },
  extraReducers: {
    [getPosts.fulfilled]: (state, action) => {
      void (state.posts = action.payload);
    },
    [changePosts.fulfilled]: (state, action) => {
      void (state.posts = action.payload);
    },
  },
});
export const { updatePosts } = slice.actions;
export default slice.reducer;
