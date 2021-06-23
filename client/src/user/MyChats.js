import React, { useEffect, useRef, useState } from "react";
import {
  getCurrentUser,
  getfriends,
  getUserById,
  updatePersonalChat,
  clearChat,
  blockUser,
  unblockUser,
} from "./apiUser";
import DefaultProfile from "./../images/avatar.png";
import { useDispatch, useSelector } from "react-redux";
import { Row, Tab, Col, Nav } from "react-bootstrap";
import TextField from "@material-ui/core/TextField";
import { clearFriends, friendAdded } from "../store/user";
import SendIcon from "@material-ui/icons/Send";
import io from "socket.io-client";
import moment from "moment";
import { isAuthenticated } from "../auth";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import BlockIcon from "@material-ui/icons/Block";
import ClearAllIcon from "@material-ui/icons/ClearAll";

var options = {
  rememberUpgrade: true,
  transports: ["websocket"],
  secure: true,
  rejectUnauthorized: false,
};

const MyChats = () => {
  const dispatch = useDispatch();
  const friends = useSelector((state) => state.user.friends);
  const [user, setUser] = useState({});
  const [touser_id, settouser_id] = useState(String);
  const [toname, settoname] = useState(String);
  const [state, setState] = useState({
    message: "",
    from_name: getCurrentUser().name,
    created: new Date(),
  });
  const [blocked_users, set_blocked_user] = useState([]);
  const [isblocked, set_isblocked] = useState(Boolean);
  const [blocked_by, set_blocked_by] = useState([]);
  const [isblocked_by, set_isblocked_by] = useState(Boolean);
  const [chat, setChat] = useState([]);

  const divRef = useRef(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef();

  useEffect(async () => {
    dispatch(clearFriends());
    await getfriends(getCurrentUser()._id).then(async (data) => {
      await data.map(async (userid) => {
        await getUserById(userid).then((u) => {
          if (u.user._id !== getCurrentUser()._id)
            dispatch(friendAdded({ user: u.user }));
        });
      });
    });
  }, []);

  // console.log(friends);

  function fun(user) {
    let userid = getCurrentUser()._id;
    socketRef.current = io.connect("http://localhost:8081", options);
    socketRef.current.emit("getPersonalChat", {
      userid,
      touser: user._id,
      client_chat_length: chat.length,
    });
    socketRef.current.on("personalchat" + userid, (data) => {
      setChat(data);
    });
  }

  useEffect(() => {
    let userid = getCurrentUser()._id;

    getUserById(userid).then((data) => {
      set_blocked_user(data.user.blocked_users);
      set_blocked_by(data.user.blocked_by);
    });

    socketRef.current = io.connect("http://localhost:8081", options);
    socketRef.current.emit("getPersonalChat", {
      userid,
      touser: user._id,
      client_chat_length: chat.length,
    });

    socketRef.current.on(
      "personal_message" + userid,
      ({ from_name, toname, message, created, touser_id, fromuser }) => {
        let chats = [...chat];
        chats.push({
          from_name,
          toname,
          message,
          created,
          touser_id,
          fromuser,
        });
        setChat(chats);
      }
    );
  }, []);

  useEffect(() => {
    let userid = getCurrentUser()._id;
    socketRef.current = io.connect("http://localhost:8081", options);
    socketRef.current.emit("getPersonalChat", {
      userid,
      touser: user._id,
      client_chat_length: chat.length,
    });
    socketRef.current.on("personalchat" + userid, (data) => {
      setChat(data);
    });
    socketRef.current.on(
      "personal_message" + userid,
      ({ from_name, toname, message, created, touser_id, fromuser }) => {
        let chats = [...chat];
        chats.push({
          from_name,
          toname,
          message,
          created,
          touser_id,
          fromuser,
        });
        setChat(chats);
      }
    );
    return () => socketRef.current.disconnect();
  }, [chat]);

  const onMessageSubmit = (e) => {
    const { from_name, message, created } = state;
    let fromuser = getCurrentUser()._id;
    if (message.trim() !== "") {
      socketRef.current.emit("personal_message", {
        from_name,
        toname,
        message,
        created,
        touser_id,
        fromuser,
      });
      let chat_msg = {
        from_name,
        toname,
        message,
        created,
        touser_id,
        fromuser,
      };
      updatePersonalChat(chat_msg).then((data) => {
        let chats = [...chat];
        chats.push(chat_msg);
        setChat(chats);
      });
    }
    e.preventDefault();
    setState({ message: "", from_name });
  };

  const onTextChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const onClearChat = (e) => {
    let current_user_id = getCurrentUser()._id;
    let client_user_id = user._id;
    clearChat(current_user_id, client_user_id).then((data) => {
      let chats = [];
      setChat(chats);
      console.log(data);
    });
    e.preventDefault();
  };

  const onBlockUser = (e) => {
    let current_user_id = getCurrentUser()._id;
    let client_user_id = user._id;
    blockUser(current_user_id, client_user_id).then((data) => {
      console.log(data);
    });
    e.preventDefault();
  };

  const onUnBlockUser = (e) => {
    let current_user_id = getCurrentUser()._id;
    let client_user_id = user._id;
    unblockUser(current_user_id, client_user_id).then((data) => {
      console.log(data);
    });
    e.preventDefault();
  };

  var d = new Date();
  var f = 0;
  function setdate(dd) {
    d = dd;
    return moment(dd).format("DD-MM-YYYY");
  }
  function settoday(dd) {
    d = dd;
    f = 1;
  }
  const renderChat = () => {
    f = 0;
    return chat.map(({ from_name, message, created }, index) => (
      <div>
        <div className="d-flex flex-column m-3 align-items-center">
          {moment(created).format("DD-MM-YYYY") !==
          moment(d).format("DD-MM-YYYY") ? (
            moment(created).format("DD-MM-YYYY") ===
            moment(new Date()).format("DD-MM-YYYY") ? (
              <span className="text-dark-75 font-weight-bold font-size-sm bubble-date">
                Today{settoday(created)}
              </span>
            ) : (
              <span className="text-dark-75 font-weight-bold font-size-sm bubble-date">
                {setdate(created)}
              </span>
            )
          ) : moment(created).format("DD-MM-YYYY") ===
              moment(new Date()).format("DD-MM-YYYY") && f === 0 ? (
            <span className="text-dark-75 font-weight-bold font-size-sm bubble-date">
              Today{settoday(created)}
            </span>
          ) : (
            <div></div>
          )}
        </div>
        {isAuthenticated().user.name === from_name ? (
          <div className="d-flex flex-column m-3 align-items-end " key={index}>
            <div className="d-flex align-items-center">
              <div>
                <span className="text-muted font-size-sm">
                  {moment(created).format("h:mm a")}
                </span>
              </div>
            </div>
            <div className="mt-2 text-dark font-weight-bold font-size-lg  text-left bubble-alt">
              {message}
            </div>
          </div>
        ) : (
          <div
            className="d-flex flex-column m-3 align-items-start "
            key={index}
          >
            <div className="d-flex align-items-center">
              <div>
                <span className="text-muted font-size-sm">
                  {moment(created).format("h:mm a")}
                </span>
              </div>
            </div>
            <div className="mt-2 text-dark font-weight-bold font-size-lg  text-left  bubble">
              {message}
            </div>
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="pt-5">
      <Tab.Container id="left-tabs-example" defaultActiveKey="empty">
        <Row>
          <Col sm={3}>
            <div className="card card-custom card-stretch">
              <div className="card-body pt-4">
                <Nav variant="pills" className="flex-column mt-3">
                  {friends.map((user, i) => (
                    <Nav.Item>
                      {/* {console.log(user)} */}

                      <Nav.Link
                        eventKey={i}
                        onClick={() => {
                          setUser(user);
                          settouser_id(user._id);
                          settoname(user.name);
                          fun(user);
                          set_isblocked(blocked_users.indexOf(user._id) > -1);
                          set_isblocked_by(blocked_by.indexOf(user._id) > -1);
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <div className="mr-3">
                            <img
                              src={DefaultProfile}
                              style={{ width: "40px" }}
                            />
                          </div>
                          <div>{user.name}</div>
                        </div>
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>
              </div>
            </div>
          </Col>
          <Col sm={9}>
            <Tab.Content>
              <Tab.Pane eventKey="empty">
                <div className="card card-stretch">
                  <div className="card-header">
                    <div className="card-title align-items-start flex-column">
                      <h4 className="card-label font-weight-bolder text-dark">
                        Click on a chat.
                      </h4>
                    </div>
                  </div>
                </div>
              </Tab.Pane>
              {friends.map((user, i) => {
                let comp = [];
                comp.push(
                  <Tab.Pane eventKey={i}>
                    <div className="card card-stretch">
                      <div className="card-header">
                        <div className="card-title">
                          <div className="d-flex align-items-center justify-content-between flex-wrap">
                            <div className="d-flex align-items-center text-dark font-size-h5 font-weight-bold mr-3">
                              {user.name}
                            </div>
                            <div className="d-flex flex-wrap my-2">
                              <button
                                className="btn btn-light-warning"
                                onClick={onClearChat}
                              >
                                Clear
                                <ClearAllIcon />
                              </button>

                              {!isblocked ? (
                                <button
                                  className="btn btn-light-danger ml-5"
                                  onClick={onBlockUser}
                                >
                                  Block
                                  <BlockIcon />
                                </button>
                              ) : (
                                <button
                                  className="btn btn-light-danger"
                                  onClick={onUnBlockUser}
                                >
                                  UnBlock
                                  <CheckCircleOutlineIcon />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card-body">
                        <div>
                          <div ref={divRef} className="render-chat">
                            {renderChat()}
                            <div ref={messagesEndRef} />
                          </div>

                          {!isblocked ? (
                            !isblocked_by ? (
                              <form onSubmit={onMessageSubmit}>
                                <div className="row pt-5">
                                  <Col sm={10}>
                                    <TextField
                                      name="message"
                                      onChange={(e) => {
                                        onTextChange(e);
                                      }}
                                      value={state.message}
                                      id="outlined-multiline-static"
                                      variant="outlined"
                                      label="Message"
                                      fullWidth
                                    />
                                  </Col>
                                  <Col>
                                    <button className="btn btn-primary">
                                      Send Message <SendIcon />
                                    </button>
                                  </Col>
                                </div>
                              </form>
                            ) : (
                              <h4 className="card-label font-weight-bolder text-dark">
                                You have been blocked by the user
                              </h4>
                            )
                          ) : (
                            <h4 className="card-label font-weight-bolder text-dark">
                              You won't recieve any messages unless you unblock
                              the user
                            </h4>
                          )}
                        </div>
                      </div>
                    </div>
                  </Tab.Pane>
                );
                return comp;
              })}
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </div>
  );
};

export default MyChats;
