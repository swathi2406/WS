exports.addNotification = (req, res) => {
  let user = req.profile;
  console.log(req.body);
  if (
    req.body.postId === undefined &&
    req.body.projectId === undefined &&
    req.body.userObjId === undefined &&
    req.body.sentBy === undefined &&
    req.body.sentTo === undefined &&
    req.body.roleId === undefined &&
    req.body.project === undefined &&
    req.body.role === undefined
  ) {
    user.notifications.push({
      message: req.body.notification,
      read: false,
      notifType: req.body.type ? req.body.type : "request",
    });
    // console.log(user.notifications);
    user.newNotification = true;
    // console.log(user.notifications);
    user.save(); //(err) => {
    return res.status !== undefined
      ? res.status(200).json({ user })
      : console.log("Notification added");
  } else {
    if (req.body.project !== undefined) {
      user.notifications.push({
        message: req.body.notification,
        read: false,
        notifType: req.body.type ? req.body.type : "request",
        project: req.body.project,
        userObjId: req.body.userObjId,
      });
      user.newNotification = true;
      // console.log(user.notifications);
      user.save(); //(err) => {
      return res.status !== undefined
        ? res.status(200).json({ user })
        : console.log("Notification added");
    }
    if (req.body.userObjId !== undefined) {
      user.notifications.push({
        message: req.body.notification,
        read: false,
        notifType: req.body.type ? req.body.type : "request",
        userObjId: req.body.userObjId,
      });
      // console.log(user.notifications);
      user.newNotification = true;
      // console.log(user.notifications);
      user.save(); //(err) => {
      return res.status !== undefined
        ? res.status(200).json({ user })
        : console.log("Notification added");
    }
    if (req.body.projectId !== undefined) {
      if (req.body.sentBy !== undefined && req.body.sentTo !== undefined) {
        if (req.body.roleId !== undefined) {
          user.notifications.push({
            message: req.body.notification,
            read: false,
            notifType: req.body.type ? req.body.type : "request",
            projectId: req.body.projectId,
            sentBy: req.body.sentBy,
            sentTo: req.body.sentTo,
            roleId: req.body.roleId,
          });
          // console.log(user.notifications);
          user.newNotification = true;
          // console.log(user.notifications);
          user.save(); //(err) => {
          return res.status !== undefined
            ? res.status(200).json({ user })
            : console.log("Notification added");
        }
        user.notifications.push({
          message: req.body.notification,
          read: false,
          notifType: req.body.type ? req.body.type : "request",
          projectId: req.body.projectId,
          sentBy: req.body.sentBy,
          sentTo: req.body.sentTo,
        });
        // console.log(user.notifications);
        user.newNotification = true;
        // console.log(user.notifications);
        user.save(); //(err) => {
        return res.status !== undefined
          ? res.status(200).json({ user })
          : console.log("Notification added");
      }
      user.notifications.push({
        message: req.body.notification,
        read: false,
        notifType: req.body.type ? req.body.type : "request",
        projectId: req.body.projectId,
      });
      // console.log(user.notifications);
      user.newNotification = true;
      // console.log(user.notifications);
      user.save(); //(err) => {
      return res.status !== undefined
        ? res.status(200).json({ user })
        : console.log("Notification added");
    }
    if (req.body.postId !== undefined) {
      user.notifications.push({
        message: req.body.notification,
        read: false,
        notifType: req.body.type ? req.body.type : "request",
        postId: req.body.postId,
      });
      // console.log(user.notifications);
      user.newNotification = true;
      // console.log(user.notifications);
      user.save(); //(err) => {
      return res.status !== undefined
        ? res.status(200).json({ user })
        : console.log("Notification added");
    }
  }
  //   if (err)
  //     return res.status !== undefined
  //       ? res.status(400).json({ error: "Notification cannot be added" })
  //       : console.log("Notification not added");
  // });
  return res.status !== undefined
    ? res.status(200).json({ user })
    : console.log("Notification added");
};

exports.getNotifications = (req, res) => {
  let user = req.profile;
  if (user.notifications) {
    let notifs = user.notifications;
    // if (user.newNotification) {
    //   user.newNotification = false;
    //   user.save((err) => {
    //     if (err) return res.status(400).json({ error: "new Notif error" });
    //   });
    // }
    return res.status(200).json({ notifications: notifs });
  }
  return res.status(200).json({ notifications: [] });
};
function removeNotificationFunc(notifications, notifId) {
  let arr = [];
  notifications.map((notif) => {
    if (notif._id.toString() !== notifId.toString()) arr.push(notif);
    // console.log(notif._id.toString() === notifId.toString());
    // else {
    //   console.log(notif.message, "not added");
    // }
  });
  console.log(arr);
  return arr;
}
exports.removeNotification = (req, res) => {
  let user = req.profile;
  // console.log(user.name, req.body);
  let notifications = user.notifications;
  console.log(req.body.notifId);
  console.log("Before:", notifications.length);
  // notifications.filter((x) => x._id.toString() !== req.body.notifId.toString());
  let newNotifications = removeNotificationFunc(
    notifications,
    req.body.notifId
  );
  console.log("After:", newNotifications.length);
  user.notifications = newNotifications;
  console.log("Finally after:", user.notifications.length);
  user.save((err) => {
    if (err)
      return res.status(400).json({ error: "cannot remove notification" });
    return res.status(200).json({ user });
  });
  // console.log(user.notifications, req.body.notifId);
};
