import React, { useState, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { getUserById, getCurrentUser, unfollowUser } from "./apiUser";
import PersonAddDisabledIcon from "@material-ui/icons/PersonAddDisabled";
import { useDispatch, useSelector } from "react-redux";
import { updateFollowing } from "../store/user";
const Following = () => {
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const [users, setusers] = useState({});
  const following = useSelector((state) => state.user.following);
  const [followingUsers, setFollowingUsers] = useState([]);
  useEffect(() => {
    getUserById(getCurrentUser()._id).then((data) =>
      dispatch(updateFollowing({ following: data.user.following }))
    );
    let profiles = {};
    following.map((user) => {
      getUserById(user).then((data) => {
        console.log(data.user);
        profiles[data.user._id] = data.user;
        setusers(profiles);
      });
    });
    setFollowingUsers(following);
  }, []);
  // useEffect(() => {
  //   let profiles = {};
  //   following.map((user) => {
  //     getUserById(user).then((data) => {
  //       console.log(data.user);
  //       profiles[data.user._id] = data.user;
  //     });
  //     setusers(profiles);
  //   });
  //   setFollowingUsers(following);
  // }, [following]);
  console.log(users);
  return (
    <>
      <div
        onClick={() => setShow(true)}
      >{` ${following.length} Following`}</div>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header>Following</Modal.Header>
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
                        unfollowUser(e, user).then((data) => {
                          console.log(data);
                          dispatch(
                            updateFollowing({
                              following: data.user.following,
                            })
                          );
                          delete users[user];
                        });
                      }}
                    >
                      UnFollow
                      <PersonAddDisabledIcon />
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

export default Following;
