import React, { useState } from "react";
import PersonAddTwoToneIcon from "@material-ui/icons/PersonAddTwoTone";
import User_Role from "./User_Role";
import { Button, Modal } from "react-bootstrap";
const RecommendedRolePeople = ({ role, project }) => {
  const [show, setShow] = useState(false);
  return (
    <>
      <div onClick={() => setShow(true)}>
        <PersonAddTwoToneIcon />
      </div>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header>Most suitable people for Role</Modal.Header>
        <Modal.Body>
          <User_Role role={role} leader={project.leader} project={project} />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShow(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RecommendedRolePeople;
