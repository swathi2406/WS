export const addNotification = (
  userId,
  message,
  type,
  projectId,
  postId,
  userObjId,
  sentBy,
  sentTo,
  roleId,
  project
) => {
  let token = JSON.parse(localStorage.getItem("jwt")).token;
  let obj = {
    notification: message,
    type,
  };
  if (projectId !== undefined) {
    obj["projectId"] = projectId;
  }
  if (postId !== undefined) {
    obj["postId"] = postId;
  }
  if (userId !== undefined) {
    obj["userObjId"] = userObjId;
  }
  if (sentBy !== undefined) {
    obj["sentBy"] = sentBy;
  }
  if (sentTo !== undefined) {
    obj["sentTo"] = sentTo;
  }
  if (roleId !== undefined) {
    obj["roleId"] = roleId;
  }
  if (project !== undefined) {
    obj["project"] = project;
  }
  console.log("Obj:", obj);
  let settings = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(obj),
  };
  //   console.log(settings);
  return fetch(
    `http://localhost:8081/notifications/addNotification/${userId}`,
    settings
  );
};
export const getNotifications = () => {
  let userId = JSON.parse(localStorage.getItem("jwt")).user._id;
  let token = JSON.parse(localStorage.getItem("jwt")).token;
  let requestObj = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  return fetch(`http://localhost:8081/notifications/${userId}`, requestObj);
};

export const removeNotificationId = (userId, notifId) => {
  let token = JSON.parse(localStorage.getItem("jwt")).token;
  let requestObj = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ notifId }),
  };
  console.log(userId, notifId, requestObj);
  return fetch(
    `http://localhost:3000/notifications/remove/${userId}`,
    requestObj
  )
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);
      return data;
    });
};
