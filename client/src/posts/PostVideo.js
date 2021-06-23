import React from "react";
import { Button, Modal } from "react-bootstrap";
import DragDropVideo from "./DragDropVideo";
export default function PostVideo() {
  const [open, setOpen] = React.useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Add Video</Button>
      <Modal show={open} onHide={handleClose}>
        <Modal.Header closeButton />
        <Modal.Body>
          <h4 className="text-center mb-3">Lets post Videos!</h4>
          <DragDropVideo />
        </Modal.Body>
      </Modal>
    </div>
  );
}
