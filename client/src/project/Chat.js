import TextField from "@material-ui/core/TextField";
import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import useStayScrolled from "react-stay-scrolled";
import io from "socket.io-client";
import { getCurrentUser } from "./../user/apiUser";
import { updateChat } from "./apiProject";
import { Col } from "react-bootstrap";
import SendIcon from "@material-ui/icons/Send";
import DefaultProfile from "../images/avatar.png";
import { read } from "../user/apiUser";
import { isAuthenticated } from "../auth";
import moment from "moment";

var options = {
  rememberUpgrade: true,
  transports: ["websocket"],
  secure: true,
  rejectUnauthorized: false,
};

function Chat(props) {
  const project_id = props.projectId;
  const status = props.status;
  const [state, setState] = useState({
    message: "",
    name: getCurrentUser().name,
    created: new Date(),
  });
  const [chat, setChat] = useState([]);
  const socketRef = useRef();

  const divRef = useRef(null);
  const { stayScrolled } = useStayScrolled(divRef);

  useEffect(() => {
    socketRef.current = io.connect("http://localhost:8081", options);
    socketRef.current.emit("getChat", {
      project_id,
      client_chat_length: chat.length,
    });
    socketRef.current.on("chat", (data) => {
      setChat(data);
    });
  }, []);

  useEffect(() => {
    socketRef.current = io.connect("http://localhost:8081", options);
    socketRef.current.emit("getChat", {
      project_id,
      client_chat_length: chat.length,
    });
    socketRef.current.on("chat" + project_id, (data) => {
      setChat(data);
      console.log(data);
    });
    socketRef.current.on(
      "message" + project_id,
      ({ name, message, created }) => {
        console.log(chat);
        setChat([...chat, { name, message, created }]);
      }
    );
    return () => socketRef.current.disconnect();
  }, [chat]);

  const onTextChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const onMessageSubmit = (e) => {
    const { name, message, created } = state;
    if (message.trim() !== "") {
      socketRef.current.emit("message", { name, message, created, project_id });
      let chat_msg = { name, message, created };
      updateChat(chat_msg, project_id).then((data) => {
        if (data.error) {
          console.log(data.error);
        } else {
          console.log(data.message);
        }
      });
    }
    e.preventDefault();
    setState({ message: "", name });
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [chat]);

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
    return chat.map(({ name, message, created }, index) => (
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
            <></>
          )}
        </div>
        {isAuthenticated().user.name === name ? (
          <div className="d-flex flex-column m-3 align-items-end " key={index}>
            <div className="d-flex align-items-center">
              <div className="symbol symbol-circle symbol-40 mr-3">
                <img
                  src={DefaultProfile}
                  alt={name}
                  style={{ width: "40px" }}
                />
              </div>
              <div>
                <p className="text-dark-75 text-hover-primary font-weight-bold font-size-h6 m-0">
                  {name}
                </p>
                <span className="text-muted font-size-sm">
                  {moment(created).format("h:mm a")}
                </span>
              </div>
            </div>
            <div className="mt-2 text-dark-100 font-weight-bold font-size-lg  text-left bubble-alt">
              {message}
            </div>
          </div>
        ) : (
          <div
            className="d-flex flex-column m-3 align-items-start "
            key={index}
          >
            <div className="d-flex align-items-center">
              <div className="symbol symbol-circle symbol-40 mr-3">
                <img
                  src={DefaultProfile}
                  alt={name}
                  style={{ width: "40px" }}
                />
              </div>
              <div>
                <p className="text-dark-75 text-hover-primary font-weight-bold font-size-h6 m-0">
                  {name}
                </p>
                <span className="text-muted font-size-sm">
                  {moment(created).format("h:mm a")}
                </span>
              </div>
            </div>
            <div className="mt-2 text-dark-100 font-weight-bold font-size-lg  text-left  bubble">
              {message}
            </div>
          </div>
        )}
      </div>
    ));
  };

  useLayoutEffect(() => {
    stayScrolled();
  }, [chat]);

  return (
    <div>
      <div ref={divRef} className="render-chat">
        {renderChat()}
        <div ref={messagesEndRef} />
      </div>
      {status !== "Completed" ? (
        <form onSubmit={onMessageSubmit}>
          <div className="row pt-5">
            <Col sm={10}>
              <TextField
                name="message"
                onChange={(e) => onTextChange(e)}
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
        <div> Chat has been disabled</div>
      )}
    </div>
  );
}

export default Chat;
