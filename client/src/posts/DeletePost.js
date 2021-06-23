import React, { Component } from "react";
import { isAuthenticated } from "./../auth/index";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { deletePost } from "./apiPosts";
import DeleteForeverTwoToneIcon from "@material-ui/icons/DeleteForeverTwoTone";

class DeletePost extends Component {
  state = {};

  deletePost = () => {
    const token = isAuthenticated().token;
    const { postId, type } = this.props;
    deletePost(postId, token).then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        alert("Post is deleted");
        window.location.reload();
      }
    });
  };

  deleteConfirmed = () => {
    let answer = window.confirm("Are you sure you want to delete this Post?");
    if (answer) {
      this.deletePost();
    }
  };

  render() {
    return (
      <div>
        {/* <OverlayTrigger
          key="top"
          placement="top"
          overlay={<Tooltip id="top">Delete Post</Tooltip>}
        > */}
        <button onClick={this.deleteConfirmed} className="btn btn-clean">
          <DeleteForeverTwoToneIcon /> Delete Post
        </button>
        {/* </OverlayTrigger> */}
      </div>
    );
  }
}

export default DeletePost;
