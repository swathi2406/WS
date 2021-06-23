import React, { useState, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { getUserById, blockFollower, getCurrentUser } from "./apiUser";
import PersonAddDisabledIcon from "@material-ui/icons/PersonAddDisabled";
import { useDispatch, useSelector } from "react-redux";
import { updateFollowers, updateFollowing } from "../store/user";

const Followers = () => {
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const [users, setusers] = useState({});
  const followers = useSelector((state) => state.user.followers);
  const [followersUsers, setFollowersUsers] = useState([]);
  useEffect(() => {
    getUserById(getCurrentUser()._id).then((data) =>
      dispatch(updateFollowers({ followers: data.user.followers }))
    );
    let profiles = {};
    followers.map((user) => {
      getUserById(user).then((data) => {
        console.log(data.user);
        profiles[data.user._id] = data.user;
        setusers(profiles);
      });
    });
    setFollowersUsers(followers);
  }, []);
  useEffect(() => {
    setFollowersUsers(followers);
  }, [followers]);
  return (
    <>
      <div
        onClick={() => setShow(true)}
      >{` ${followersUsers.length} Followers`}</div>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header>Followers</Modal.Header>
        <Modal.Body>
          <div>
            {Object.keys(users).map((user, i) => (
              <div className="col">
                <div className="card mb-3" key={i}>
                  <div className="card-body">
                    <p className="card-text">{users[user].name}</p>
                    <button
                      className="btn btn-raised btn-primary ml-3"
                      onClick={(e) => {
                        blockFollower(e, user)
                          .then((val) => {
                            // if (data === "User Blocked") {
                            //   console.log("users");
                            //   delete users[user];
                            // }
                            console.log(val);
                            getUserById(getCurrentUser()._id).then((data) => {
                              dispatch(
                                updateFollowers({
                                  followers: data.user.followers,
                                })
                              );
                              dispatch(
                                updateFollowing({
                                  following: data.user.following,
                                })
                              );
                            });
                          })
                          .then(() => delete users[user]);
                      }}
                    >
                      Block
                    </button>
                    <Link
                      to={`/user/${user}`}
                      className="btn btn-raised btn-small btn-primary"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShow(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Followers;
