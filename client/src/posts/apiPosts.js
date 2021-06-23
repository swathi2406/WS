import axios from "axios";
export const getAllPosts = () => {
  let userId = JSON.parse(localStorage.getItem("jwt")).user._id;
  let token = JSON.parse(localStorage.getItem("jwt")).token;
  let requestObj = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  return fetch(`http://localhost:3000/posts/`, requestObj);
};
export const getPostsOfUser = (userId) => {
  let token = JSON.parse(localStorage.getItem("jwt")).token;
  let requestObj = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  return fetch(`http://localhost:3000/posts/by/${userId}`, requestObj);
};
export const uploadPicture2 = (data) => {
  axios.post(`http://localhost:3000/convertToWebp`, data);
};
export const uploadVideo = (data) => {
  console.log(data);
};
export const uploadPicture = async (base64Data, fileName) => {
  // var imageBuffer = new Buffer(base64Data, "base64"); //console = <Buffer 75 ab 5a 8a ...
  // fs.writeFile("test.jpg", imageBuffer, function (err) {
  //   //...
  //   console.log(imageBuffer);
  // });
  // base64Data = base64Data.split(",").pop();
  // console.log(base64Data);
  // const blob = b64toBlob(base64Data, contentType);
  // const blobUrl = URL.createObjectURL(blob);
  // // console.log("blob:", blob);
  // // console.log("blobURL:", blobUrl);
  // console.log(blobUrl);
  let object = {
    method: "POST",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: base64Data, fileName: fileName }),
  };
  console.log("Object:", object);
  return fetch(`http://localhost:3000/convertToWebp`, object)
    .then((data) => {
      console.log(data);
      return data.json();
    })
    .then((response) => {
      // console.log("url:", response.result.url);
      // return response.result.url;
      const data = response.result;
      let token = JSON.parse(localStorage.getItem("jwt")).token;
      let userId = JSON.parse(localStorage.getItem("jwt")).user._id;
      if (data.url) {
        let url = data.url;
        return fetch(`http://localhost:3000/post/new/${userId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token.toString(),
          },
          body: JSON.stringify({
            pic: url,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log(data);
            return data;
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
};
export const createVideoPost = async (video, title, tags, project) => {
  const data = new FormData();
  let token = JSON.parse(localStorage.getItem("jwt")).token;
  let userId = JSON.parse(localStorage.getItem("jwt")).user._id;
  data.append("myVideo", video);
  let settings = {
    headers: {
      "content-type": "multipart/form-data",
    },
  };
  let response = await axios.post(
    `http://localhost:3000/postVideo`,
    data,
    settings
  );
  console.log(response);
  if (response.data.error !== undefined) return response.data;
  let result = response.data.result;
  if (result.url) {
    let url = result.url;
    let settings =
      project !== "Personal"
        ? {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token.toString(),
            },
            body: JSON.stringify({
              video: url,
              title: title,
              tags: tags,
              project: project,
            }),
          }
        : {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token.toString(),
            },
            body: JSON.stringify({
              video: url,
              title: title,
              tags: tags,
            }),
          };
    return fetch(`/post/new/video/${userId}`, settings)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        return data;
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

export const createPost = async (final_url, title, tags, project) => {
  console.log(final_url);
  let token = JSON.parse(localStorage.getItem("jwt")).token;
  let userId = JSON.parse(localStorage.getItem("jwt")).user._id;
  let settings =
    project !== "Personal"
      ? {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token.toString(),
          },
          body: JSON.stringify({
            pic: final_url,
            title: title,
            tags: tags,
            project,
          }),
        }
      : {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token.toString(),
          },
          body: JSON.stringify({
            pic: final_url,
            title: title,
            tags: tags,
          }),
        };
  return fetch(`/post/new/${userId}`, settings)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      return data;
    })
    .catch((err) => {
      console.log(err);
    });
};

export const likepost = (post_id) => {
  let userId = JSON.parse(localStorage.getItem("jwt")).user._id;
  let token = JSON.parse(localStorage.getItem("jwt")).token;
  let obj = {
    userId: userId,
    postId: post_id,
  };
  let settings = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(obj),
  };
  // console.log(settings.body);
  return fetch(`http://localhost:3000/post/like/${post_id}`, settings)
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const dislikepost = (post_id) => {
  let userId = JSON.parse(localStorage.getItem("jwt")).user._id;
  let token = JSON.parse(localStorage.getItem("jwt")).token;
  let obj = {
    userId: userId,
    postId: post_id,
  };
  let settings = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(obj),
  };
  // console.log(settings.body);
  return fetch(`http://localhost:3000/post/dislike/${post_id}`, settings)
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const reportpost = (post_id) => {
  let userId = JSON.parse(localStorage.getItem("jwt")).user._id;
  let token = JSON.parse(localStorage.getItem("jwt")).token;

  let settings = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  return fetch(
    `http://localhost:3000/post/report/${userId}/${post_id}`,
    settings
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};
export const addcomment = (post_id, comment) => {
  let userId = JSON.parse(localStorage.getItem("jwt")).user._id;
  let userName = JSON.parse(localStorage.getItem("jwt")).user.name;
  let token = JSON.parse(localStorage.getItem("jwt")).token;
  let obj = {
    userId: userId,
    userName: userName,
    postId: post_id,
    comment: comment,
  };
  let settings = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(obj),
  };
  // console.log(settings.body);
  return fetch(`http://localhost:3000/post/addcomment/${post_id}`, settings)
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const getpost = (post_id) => {
  let settings = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };
  // console.log(settings.body);
  return fetch(`http://localhost:3000/post/${post_id}`, settings)
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const createTextPost = (text) => {
  let userId = JSON.parse(localStorage.getItem("jwt")).user._id;
  let token = JSON.parse(localStorage.getItem("jwt")).token;
  let settings = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  };
  return fetch(`post/new/text/${userId}`, settings)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      return data;
    });
};

export const createYoutubePost = (videolink, title, metadata) => {
  let userId = JSON.parse(localStorage.getItem("jwt")).user._id;
  let token = JSON.parse(localStorage.getItem("jwt")).token;
  let metadataObj = {
    title: metadata.title,
    author_name: metadata.author_name,
    author_url: metadata.author_url,
    type: metadata.type,
    height: metadata.height,
    width: metadata.width,
    version: metadata.version,
    provider_name: metadata.provider_name,
    provider_url: metadata.provider_url,
    thumbnail_height: metadata.thumbnail_height,
    thumbnail_width: metadata.thumbnail_width,
    thumbnail_url: metadata.thumbnail_url,
  };
  let settings = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      videolink,
      title,
      metadataAuthor: metadataObj.author_name,
      metadataTitle: metadataObj.title,
    }),
  };
  return fetch(`post/new/youtube/${userId}`, settings)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      return data;
    });
};

export const deletePost = (postId, token) => {
  return fetch("http://localhost:3000/post/delete/" + `${postId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      console.log("done");
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const getLikesOfPost = (postId) => {
  let arr = [];
  return fetch(`http://localhost:3000/post/likes/${postId}`)
    .then((response) => response.json())
    .then((data) => {
      data.liked_by.map((id) => {
        arr.push(id["_id"]);
      });
      return arr;
    });
};

export const editPost = (postId, title) => {
  let token = JSON.parse(localStorage.getItem("jwt")).token;
  let obj = {
    postId: postId,
    title: title,
  };
  let settings = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(obj),
  };
  // console.log(settings.body);
  return fetch(`http://localhost:3000/post/edit/${postId}`, settings)
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const deleteComment = (commentId, postId) => {
  let token = JSON.parse(localStorage.getItem("jwt")).token;
  let obj = {
    postId: postId,
    commentId: commentId,
  };
  let settings = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(obj),
  };
  // console.log(settings.body);
  return fetch(`http://localhost:3000/post/deleteComment/${postId}`, settings)
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};
export const postProfilePic = async (image) => {
  console.log(image);
  let userId = JSON.parse(localStorage.getItem("jwt")).user._id;
  let token = JSON.parse(localStorage.getItem("jwt")).token;
  const data = new FormData();
  data.append("myProfilePicture", image);
  let settings = {
    headers: {
      "content-type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  };
  let response = await axios.put(
    `http://localhost:3000/user/profilePicture/${userId}`,
    data,
    settings
  );
  let profilePictures = response.data.user.profilePictures;
  return profilePictures[profilePictures.length - 1];
};

export const removeProfilePic = async () => {
  let userId = JSON.parse(localStorage.getItem("jwt")).user._id;
  let token = JSON.parse(localStorage.getItem("jwt")).token;
  let settings = {
    headers: {
      "content-type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  };
  let response = await axios.put(
    `http://localhost:3000/user/profilePicture/remove/${userId}`,
    settings
  );
  let profilePictures = response.data.user.profilePictures;
  return profilePictures[profilePictures.length - 1];
};
