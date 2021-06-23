import React, { useState } from "react";
import Form from "./Form";
import { Button, Modal } from "react-bootstrap";
const ModalButton = () => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  return (
    <>
      {" "}
      <Button variant="outline-primary" size="sm" onClick={handleShow}>
        Create an Account
      </Button>
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Join the Community</Modal.Title>
        </Modal.Header>
        <Modal.Body scrollable="true">
          <Form />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ModalButton;
