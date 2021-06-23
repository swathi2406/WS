import React from "react";
import { Button, Modal } from "react-bootstrap";
import EditTwoToneIcon from "@material-ui/icons/EditTwoTone";
import { editPost } from "./apiPosts";

class EditPost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      new_title: "",
    };
  }

  handleClose() {
    this.setState({ show: false });
  }

  handleShow() {
    this.setState({ show: true });
  }

  handleSave() {
    editPost(this.props.post._id, this.state.new_title).then((data) =>
      console.log(data)
    );
  }
  handleChange(e) {
    let title = e.target.value;
    this.setState({ new_title: title });
  }
  render() {
    let post = this.props.post;
    return (
      <div>
        <Button onClick={this.handleShow.bind(this)}>
          <EditTwoToneIcon />
        </Button>

        <Modal show={this.state.show} onHide={this.handleClose.bind(this)}>
          <Modal.Header>
            <Modal.Title>Edit your Post</Modal.Title>
            <Button onClick={this.handleClose.bind(this)}>x</Button>
          </Modal.Header>
          <Modal.Body>
            <input
              type="text"
              id="title"
              className="form-control"
              placeholder={post.headerText}
              onChange={this.handleChange.bind(this)}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleSave.bind(this)}>Save</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
export default EditPost;
//render(<Example />);
