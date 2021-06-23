import { React, useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { getCurrentUser, getUserById } from "../user/apiUser";
import { acceptProject, declineProject } from "./apiProject";
export default function ApproveOrDeclineProject(props) {
    const [open, setOpen] = useState(false);
    const [leader, setleader] = useState("");
    const handleClose = () => {
        setOpen(false);
    };
    const project = props.project
    useEffect(() => {
        getUserById(project.leader).then((data) => {
            setleader(data.user.name);
        });
    }, []);

    const accept_project = () => {
        acceptProject(project._id).then((data) => {
            console.log(data);
        })
    }

    const decline_project = () => {
        declineProject(project._id).then((data) => {
            console.log(data);
        })
    }

    return (
        <div>
            <Button onClick={() => setOpen(true)}>Approve Or Decline Project</Button>
            <Modal show={open} onHide={handleClose}>
                <Modal.Header>
                    <Modal.Title>
                        {project.title}
                    </Modal.Title>
                    <Button onClick={handleClose}>
                        x
                    </Button>
                </Modal.Header>
                <Modal.Body>
                    <h4 className="text-left mb-3">
                        <span className="d-block font-weight-bold mb-4">
                            Title:
                            <span className="btn btn-light-primary btn-sm font-weight-bold btn-upper btn-text">
                                {project.title}
                            </span>
                        </span>
                        <span className="d-block font-weight-bold mb-4">
                            Description:
                            <span className="btn btn-light-primary btn-sm font-weight-bold btn-upper btn-text">
                                {project.description}
                            </span>
                        </span>
                        <span className="d-block font-weight-bold mb-4">
                            Semester:
                            <span className="btn btn-light-primary btn-sm font-weight-bold btn-upper btn-text">
                                {project.semester}
                            </span>
                        </span>
                        <span className="d-block font-weight-bold mb-4">
                            Subject:
                            <span className="btn btn-light-primary btn-sm font-weight-bold btn-upper btn-text">
                                {project.subject}
                            </span>
                        </span>
                        <span className="d-block font-weight-bold mb-4">
                            Leader:
                            <span className="btn btn-light-primary btn-sm font-weight-bold btn-upper btn-text">
                                {leader}
                            </span>
                        </span>
                        <button type="button" class="btn btn-success" onClick={accept_project}>Accept</button>
                        <button type="button" class="btn btn-danger" onClick={decline_project}>Decline</button>
                    </h4>
                </Modal.Body>
            </Modal>
        </div>
    );
}
