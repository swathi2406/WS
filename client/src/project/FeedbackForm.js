import React, { useState, useEffect } from "react";
import { getCurrentUser, getUserById } from "../user/apiUser";
import { getProject } from "./apiProject";
import AcceptIcon from "../images/accepted.png";
import { Button, Modal } from "react-bootstrap";
import RatingComponentFeedbackForm from "./RatingComponentFeedbackForm";
const FeedbackForm = ({ type, id, projectId, message }) => {
  const [project, setProject] = useState({});
  const [team, setTeam] = useState([]);
  const [show, setShow] = useState(false);
  const getUserObj = (userId) => {
    return getUserById(userId).then((user) => {
      return user.user;
    });
  };
  useEffect(() => {
    getProject(projectId).then((data) => {
      setProject(data.project);
      let projectObj = data.project;
      //   console.log("User id:", getCurrentUser()._id);
      projectObj.team = data.project.team.filter(
        (x) => x !== getCurrentUser()._id
      );
      let userTeam = [];
      projectObj.team.map(async (userId) => {
        userTeam.push(await getUserObj(userId));
        // console.log(userTeam);
      });
      //   console.log(userTeam);
      setTeam(userTeam);
      //   console.log(projectObj.team);
    });
  }, []);
  //   useEffect(() => console.log(ratingObj), [ratingObj]);
  //   if (team.length !== 0) console.log(team);
  return (
    <div
      className="alert alert-custom alert-notice alert-light-success"
      role="alert"
    >
      <div className="alert-icon">
        <img src={AcceptIcon} alt="Icon" style={{ height: "40px" }} />
      </div>
      <div className="alert-text">
        <div
          className="text-dark-75 text-hover-primary mb-1 font-size-lg font-weight-bolder"
          onClick={() => setShow(true)}
        >
          {message}
        </div>
        <Modal show={show} onHide={() => setShow(false)}>
          <Modal.Header>{project.title}</Modal.Header>
          <Modal.Body>
            <>
              <RatingComponentFeedbackForm team={team} />
              <Button onClick={() => setShow(false)}>Close</Button>
            </>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default FeedbackForm;
