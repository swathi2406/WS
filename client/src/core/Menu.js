import React, { useEffect, useState } from "react";
import { Link, withRouter } from "react-router-dom";
import { signout, isAuthenticated } from "../auth";
import { clearNotifications } from "../store/notifications";
import "../styles.css";
import { Nav, DropdownButton, Dropdown } from "react-bootstrap";
import Logo from "../images/logo5.png";
import PersonTwoToneIcon from "@material-ui/icons/PersonTwoTone";

import { useDispatch } from "react-redux";

import { getCurrentUser, getUserById } from "../user/apiUser";
import socket from "./../utils/Socket";

const isActive = (history, path) => {
  if (history.location.pathname === path)
    return { backgroundColor: "#3445E5", color: "#fff" };
  else return { color: "#7E8299" };
};

const Menu = ({ history }) => {
  const dispatch = useDispatch();
  const [teacher, setTeacher] = useState(false);
  useEffect(() => {
    if (isAuthenticated().user !== undefined)
      getUserById(isAuthenticated().user._id).then((data) => {
        let userType =
          data.user.teacher === undefined ? false : data.user.teacher;
        setTeacher(userType);
      });
  }, []);
  console.log(teacher);
  return (
    <>
      <div
        id="kt_header_mobile"
        className="header-mobile  header-mobile-fixed "
      >
        <div className="d-flex align-items-center">
          <Link to="/home" className="mr-7">
            <img src={Logo} alt="Logo" style={{ height: "30px" }} />
          </Link>
        </div>
        <div className="d-flex align-items-center">
          <button
            className="btn p-0 burger-icon ml-4"
            id="kt_header_mobile_toggle"
          >
            <span></span>
          </button>
          <button className="btn p-0 ml-2">
            <PersonTwoToneIcon />
          </button>
        </div>
      </div>
      <div className="d-flex flex-column flex-root">
        <div className="d-flex flex-row flex-column-fluid page">
          <div
            className="d-flex flex-column flex-row-fluid wrapper"
            id="kt_wrapper"
          >
            <div id="kt_header" className="header flex-column  header-fixed ">
              <div className="header-top">
                <div className="container">
                  <div className="d-none d-lg-flex align-items-center mr-3">
                    <Link to="/home" className="mr-7">
                      <img src={Logo} alt="Logo" style={{ height: "50px" }} />
                    </Link>
                  </div>
                  <div
                    className="header-menu-wrapper mr-auto header-menu-wrapper-left"
                    id="kt_header_menu_wrapper"
                  >
                    <div
                      id="kt_header_menu"
                      className="header-menu header-menu-left header-menu-mobile  header-menu-layout-default "
                    >
                      {isAuthenticated() && (
                        <ul className="menu-nav ">
                          <li className="menu-item" aria-haspopup="true">
                            <Link
                              to="/home"
                              style={isActive(history, "/home")}
                              className="menu-link "
                            >
                              <span
                                style={isActive(history, "/home")}
                                className="menu-text"
                              >
                                My Feed
                              </span>
                            </Link>
                          </li>
                          <li className="menu-item" aria-haspopup="true">
                            <Link
                              to="/users"
                              style={isActive(history, "/users")}
                              className="menu-link "
                            >
                              <span
                                style={isActive(history, "/users")}
                                className="menu-text"
                              >
                                Users
                              </span>
                            </Link>
                          </li>
                          <li className="menu-item " aria-haspopup="true">
                            <Link
                              style={isActive(history, "/myprojects")}
                              to={`/myprojects`}
                              className="menu-link "
                            >
                              <span
                                style={isActive(history, "/myprojects")}
                                className="menu-text"
                              >
                                My Projects
                              </span>
                            </Link>
                          </li>
                          <li className="menu-item " aria-haspopup="true">
                            <Link
                              style={isActive(history, "/createproject")}
                              to={`/createproject`}
                              className="menu-link "
                            >
                              <span
                                style={isActive(history, "/createproject")}
                                className="menu-text"
                              >
                                Create Project
                              </span>
                            </Link>
                          </li>
                          {!teacher && (
                            <li className="menu-item " aria-haspopup="true">
                              <Link
                                style={isActive(history, "/joinproject")}
                                to={`/joinproject`}
                                className="menu-link "
                              >
                                <span
                                  className="menu-text"
                                  style={isActive(history, "/joinproject")}
                                >
                                  Join Project
                                </span>
                              </Link>
                            </li>
                          )}
                          {/*<li className="menu-item " aria-haspopup="true">
                            <Link
                              style={isActive(
                                history,
                                `/user/${isAuthenticated().user._id}`
                              )}
                              to={`/user/${isAuthenticated().user._id}`}
                              className="menu-link "
                            >
                              <span
                                style={isActive(
                                  history,
                                  `/user/${isAuthenticated().user._id}`
                                )}
                                className="menu-text"
                              >
                                My Profile
                              </span>
                            </Link>
                                </li>*/}
                          <li className="menu-item " aria-haspopup="true">
                            <Link
                              style={isActive(
                                history,
                                `/mychats/${isAuthenticated().user._id}`
                              )}
                              to={`/mychats/${isAuthenticated().user._id}`}
                              className="menu-link "
                            >
                              <span
                                className="menu-text"
                                style={isActive(
                                  history,
                                  `/mychats/${isAuthenticated().user._id}`
                                )}
                              >
                                Chats
                              </span>
                            </Link>
                          </li>
                          <li className="menu-item " aria-haspopup="true">
                            <Link
                              style={isActive(
                                history,
                                `/notifs/${isAuthenticated().user._id}`
                              )}
                              to={`/notifs/${isAuthenticated().user._id}`}
                              className="menu-link "
                            >
                              <span
                                className="menu-text"
                                style={isActive(
                                  history,
                                  `/notifs/${isAuthenticated().user._id}`
                                )}
                              >
                                Notifications
                              </span>
                            </Link>
                          </li>
                          {teacher && (
                            <li className="menu-item " aria-haspopup="true">
                              <Link
                                style={isActive(
                                  history,
                                  `/request/${isAuthenticated().user._id}`
                                )}
                                to={`/request/${isAuthenticated().user._id}`}
                                className="menu-link "
                              >
                                <span
                                  className="menu-text"
                                  style={isActive(
                                    history,
                                    `/request/${isAuthenticated().user._id}`
                                  )}
                                >
                                  Requests
                                </span>
                              </Link>
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className="topbar">
                    <div className="topbar-item">
                      <div
                        className=" w-auto d-flex align-items-center btn-lg px-2"
                        id="kt_quick_user_toggle"
                      >
                        {isAuthenticated() && (
                          <div className="d-flex text-right pr-3">
                            <DropdownButton
                              id="dropdown-basic-button"
                              title={`Hi, ${isAuthenticated().user.name}`}
                            >
                              <span className="h4 text-white opacity-50 font-weight-bold font-size-sm d-none d-md-inline mr-1">
                                Hi,
                              </span>
                              <span className="h4 text-white font-weight-bolder font-size-sm d-none d-md-inline">
                                <Dropdown.Item>
                                  <Link
                                    style={{ color: "#000" }}
                                    to={`/user/${isAuthenticated().user._id}`}
                                  >
                                    Manage Profile
                                  </Link>
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() =>
                                    signout(() => history.push("/"))
                                  }
                                >
                                  Log Out
                                </Dropdown.Item>
                              </span>
                            </DropdownButton>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default withRouter(Menu);
