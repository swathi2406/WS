import React, { Component } from "react";
import ShareIcon from "@material-ui/icons/Share";
import { ToastContainer, toast } from "react-toastify";
import Heart from "react-animated-heart";
import { getCurrentUser, getProfilePic } from "./../user/apiUser";
import { Link, Redirect } from "react-router-dom";
import DefaultProfile from "../images/avatar.png";
import {
  likepost,
  dislikepost,
  addcomment,
  getpost,
  deleteComment,
  reportpost,
} from "./apiPosts";
import { collect } from "collect.js";
import CommentIcon from "@material-ui/icons/Comment";
import SendRoundedIcon from "@material-ui/icons/SendRounded";
import moment from "moment";
import DeletePost from "./DeletePost";
import {
  Accordion,
  Button,
  Card,
  Modal,
  ModalBody,
  Popover,
  OverlayTrigger,
} from "react-bootstrap";
import { TextField } from "@material-ui/core";
import { isAuthenticated } from "../auth";
import { Carousel } from "react-bootstrap";
import ReactPlayer from "react-player";
import YouTubeIcon from "@material-ui/icons/YouTube";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import VisibilityTwoToneIcon from "@material-ui/icons/VisibilityTwoTone";
import DeleteTwoToneIcon from "@material-ui/icons/DeleteTwoTone";
import "bootstrap/dist/css/bootstrap.css";
import Sentiment from "sentiment";
import Dropdown from "react-bootstrap/Dropdown";
import ReportTwoToneIcon from "@material-ui/icons/ReportTwoTone";
import { changePosts } from "../store/posts";
import { notificationAdded } from "../store/notifications";
import { connect } from "react-redux";
const sentiment = new Sentiment();

class showPost extends Component {
  state = {
    isClick: false,
    comment: "",
    id: String,
    post: {},
    loggedin: false,
    post_id: String,
    post_title: "",
    postedBy_id: "",
    sentimentScore: null,
    show: false,
    redirect: false,
    disabled: false,
    profilePictures: {},
  };
  checkIfUserIdExistsInObject(checkObject, userId) {
    Object.keys(checkObject).map((key) => {
      if (key.toString() === userId.toString()) {
        return true;
      }
    });
    return false;
  }
  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.post.post !== undefined &&
      this.state.post.post.comments !== undefined
    )
      console.log(prevState.post.post.comments, this.state.post.post.comments);
  }
  setPost() {
    let post_id = this.props.match.params.postId;
    getpost(post_id).then(async (data) => {
      this.setState({
        post: data,
        post_id: post_id,
        postedBy_id: data.post.postedBy._id,
        post_title: data.post.title,
      });
      if (isAuthenticated()) {
        this.setState({ loggedin: true, id: getCurrentUser()._id });
        let post = data;
        let users = [...this.state.post.post.liked_by];
        if (users !== undefined && users !== null && users !== [])
          if (users.indexOf(getCurrentUser()._id) > -1)
            this.setState({ isClick: true });
      }
      // let users = data.liked_by;
      let comments = data.post.comments;
      let pictures = {};
      let picture = {};
      picture = await this.setProfilePicture(getCurrentUser()._id);
      // console.log(picture);
      Object.assign(pictures, picture);
      // console.log(pictures);
      this.setState({ profilePictures: pictures });
      comments.map(async (comment) => {
        // const { profilePictures } = this.state;
        // if (this.checkIfUserIdExistsInObject(profilePictures, comment.userId)) {
        //   this.setProfilePicture(comment.userId);
        // }
        const { profilePictures } = this.state;
        if (
          !this.checkIfUserIdExistsInObject(profilePictures, comment.userId)
        ) {
          let picture = await this.setProfilePicture(comment.userId);
          Object.assign(pictures, picture);
          // console.log(pictures);
          this.setState({ profilePictures: pictures });
        }
      });
    });
  }
  componentDidMount() {
    this.setPost();
  }
  setProfilePicture = (userId) => {
    // let picture = {};
    return getProfilePic(userId).then((data) => {
      return { [userId]: data.profilePic };
    });
  };
  handleSubmitClicked = () => {
    reportpost(this.state.post_id).then((data) => {
      if (data.message === "Post is Deleted.") {
        toast.error("Reported Post. Thanks for the integrity!");
        this.props.notificationAdded({
          userId: this.state.postedBy_id,
          message: `Your post with title ${this.state.post_title} was reported by 3 or more people and deleted. Please, follow regulations`,
          type: "PostReported",
          postId: this.state.post_id,
        });
        this.setState({ redirect: true });
      } else {
        if (data.message !== undefined) {
          toast.error("Reported Post. Thanks for the integrity!");
          this.props.notificationAdded({
            userId: this.state.postedBy_id,
            message: `Your post with title ${this.state.title} was reported. Please look into the issue`,
            type: "PostReported",
            postId: this.state.post_id,
          });
        }
      }
    });
    this.setState({
      show: false,
      isDisabled: true,
    });
  };
  handleClose() {
    this.setState({ show: false });
  }

  handleShow() {
    this.setState({ show: true });
  }
  postliked = () => {
    if (this.state.loggedin) {
      this.setState({ isClick: !this.state.isClick });
      if (this.state.isClick)
        dislikepost(this.state.post_id).then((data) => {
          this.setPost();
          console.log(data);
        });
      else
        likepost(this.state.post_id).then((data) => {
          this.setPost();
          console.log(data);
        });
    } else return toast.error("Please login-In");
  };

  onTextChange = (e) => {
    this.setState({ comment: e.target.value });
    this.findSentiment(e.target.value);
  };

  submitcomment = () => {
    if (this.state.loggedin) {
      addcomment(this.state.post_id, this.state.comment).then((data) => {
        console.log(data);
        this.setPost();
      });
      // .then(() => this.props.changePosts(this.props.match.params.postId));
    } else return toast.error("Please login-In ");
  };

  findSentiment(comment) {
    const result = sentiment.analyze(comment);
    this.setState({
      sentimentScore: result.score,
    });
  }

  deletecomment(e, commentId) {
    e.preventDefault();
    // console.log(this.state.post.post._id, commentId);
    deleteComment(commentId, this.state.post.post._id).then((data) => {
      console.log(data);
      this.setPost();
    });
    // .then(() => {
    //   this.props.changePosts(this.props.match.params.postId);
    // });
  }

  rendercomments = (comments) => {
    let reverseComments = [...comments].reverse();
    const { profilePictures } = this.state;
    return reverseComments.map(
      ({ PostedOn, comment, userName, _id, userId }, index) => (
        <div className="d-flex py-5">
          <div className="symbol symbol-40 symbol-light-warning mr-5">
            <span className="symbol-label">
              <img
                src={
                  profilePictures[userId] !== undefined
                    ? profilePictures[userId]
                    : DefaultProfile
                }
                className="h-75 align-self-end"
              />
            </span>
          </div>
          <div className="d-flex flex-column flex-row-fluid">
            <div className="d-flex align-items-center flex-wrap">
              <Link
                to="#"
                className="text-dark-75 text-hover-primary mb-1 font-size-lg font-weight-bolder pr-6"
              >
                {userName}
              </Link>
              <span className="text-muted font-weight-normal flex-grow-1 font-size-sm">
                {moment(PostedOn).format("DD-MM-YYYY h:mm a")}
              </span>
            </div>

            <span className="text-dark-75 font-size-sm font-weight-normal pt-1">
              {comment}
            </span>
          </div>
          {this.state.id === userId && (
            <button
              className="btn btn-clear"
              onClick={(e) => this.deletecomment(e, _id)}
            >
              <DeleteTwoToneIcon />
            </button>
          )}
        </div>
      )
    );
  };

  render() {
    const { redirect } = this.state;
    if (redirect === true) return <Redirect to={`/home`} />;
    let post = this.state.post.post;
    const { profilePictures } = this.state;
    const current_post = { ...post };
    let type = current_post.postType;
    if (current_post.reportCounter === undefined) return null;
    const reportCounter = [...current_post.reportCounter];
    // console.log(current_post.reportCounter);
    const posted_by = { ...current_post.postedBy };
    let id = current_post._id;
    let counts = collect(current_post.liked_by).count();
    let imageUrl = [];
    if (current_post === undefined) return null;
    if (current_post.photo !== undefined)
      current_post.photo.map((url) => {
        imageUrl.push(url);
      });
    return (
      <>
        <ToastContainer />
        <div className="card card-custom gutter-b mt-5">
          <div className="card-body">
            <div className="d-flex align-items-center pb-4">
              <div className="symbol symbol-40 symbol-light-warning mr-5">
                <span className="symbol-label">
                  <img
                    src={
                      profilePictures[posted_by._id] !== undefined
                        ? profilePictures[posted_by._id]
                        : DefaultProfile
                    }
                    className="h-75 align-self-end"
                  />
                </span>
              </div>
              <div className="d-flex flex-column flex-grow-1">
                <Link
                  to="#"
                  className="text-dark-75 text-hover-primary mb-1 font-size-lg font-weight-bolder"
                >
                  {posted_by.name}
                </Link>
                <span className="text-muted font-weight-bold">
                  {moment(current_post.created).format("DD-MM-YYYY h:mm a")}
                </span>
              </div>
              <div className="ml-auto">
                <OverlayTrigger
                  trigger="click"
                  placement="right"
                  overlay={
                    <Popover id="popover-basic">
                      <Popover.Content>
                        {getCurrentUser()._id === posted_by ? (
                          <></>
                        ) : reportCounter.includes(getCurrentUser()._id) ? (
                          <>
                            <button className="btn btn-clean" disabled={true}>
                              <ReportTwoToneIcon /> Post Reported
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn btn-clean"
                              onClick={() => {
                                this.handleShow();
                                this.setState({ disabled: true });
                              }}
                              disabled={this.state.disabled}
                            >
                              <ReportTwoToneIcon /> Report
                            </button>
                            <Modal
                              show={this.state.show}
                              onHide={this.handleClose.bind(this)}
                            >
                              <Modal.Header>
                                <Modal.Title>
                                  Are you Sure to report this post?
                                </Modal.Title>
                                <Button onClick={this.handleClose.bind(this)}>
                                  x
                                </Button>
                              </Modal.Header>
                              <ModalBody>
                                <Button
                                  disabled={this.state.isDisabled}
                                  onClick={this.handleSubmitClicked}
                                >
                                  Yes
                                </Button>
                              </ModalBody>
                            </Modal>
                          </>
                        )}

                        <div>
                          <button
                            className="btn btn-clean"
                            onClick={() => {
                              getpost(current_post._id).then((data) => {
                                let link = `http://localhost:3000/post/${data.post._id}`;
                                navigator.clipboard.writeText(link);
                                toast.success("Link copied to clipboard");
                              });
                            }}
                          >
                            <ShareIcon /> Share Post
                          </button>
                        </div>
                        {/* {delete_button === "enabled" ? (
                          <DeletePost postId={_id} />
                        ) : (
                          <div></div>
                        )} */}
                      </Popover.Content>
                    </Popover>
                  }
                >
                  <button className="btn btn-custom">
                    <MoreVertIcon />
                  </button>
                </OverlayTrigger>
              </div>
            </div>
            <div>
              {(type === "image" &&
                (imageUrl !== "undefined" && imageUrl.length > 1 ? (
                  <center>
                    <Carousel interval={null}>
                      {imageUrl.map((url, i) => {
                        return (
                          <Carousel.Item>
                            <img
                              className="d-block w-100"
                              style={{
                                width: "45vw",
                                height: "30vw",
                                "object-fit": "cover",
                              }}
                              src={url}
                              alt={url}
                            />
                          </Carousel.Item>
                        );
                      })}
                    </Carousel>
                  </center>
                ) : (
                  <center>
                    <Card.Img
                      style={{
                        width: "45vw",
                        height: "30vw",
                        "object-fit": "cover",
                      }}
                      variant="top"
                      src={imageUrl[0]}
                    />
                  </center>
                ))) ||
                (type === "video" && (
                  <center>
                    <ReactPlayer
                      url={current_post.video}
                      controls={true}
                      volume={1}
                      muted={false}
                    />
                  </center>
                )) ||
                (type === "text" && current_post.title) ||
                (type === "youtubeVideo" && (
                  <>
                    <YouTubeIcon
                      fontSize="large"
                      className="text-danger display-3 mr-5 ml-2"
                    />
                    <span>
                      <strong>{current_post.metadataTitle}</strong>
                      By {current_post.metadataAuthor}
                    </span>
                    <center>
                      <ReactPlayer
                        url={current_post.video}
                        controls={true}
                        width={window.width}
                      />
                    </center>
                    {/* <div>By {current_post.metadataAuthor}</div> */}
                  </>
                ))}

              <div className="d-flex align-items-center">
                {/* {getCurrentUser()._id === posted_by ? (
                  <></>
                ) : reportCounter.includes(getCurrentUser()._id) ? (
                  <>
                    <button className="btn btn-clean" disabled={true}>
                      <ReportTwoToneIcon /> Post Reported
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-clean"
                      onClick={() => {
                        this.handleShow();
                        this.setState({ disabled: true });
                      }}
                      disabled={this.state.disabled}
                    >
                      <ReportTwoToneIcon /> Report
                    </button>
                    <Modal
                      show={this.state.show}
                      onHide={this.handleClose.bind(this)}
                    >
                      <Modal.Header>
                        <Modal.Title>
                          Are you Sure to report this post?
                        </Modal.Title>
                        <Button onClick={this.handleClose.bind(this)}>x</Button>
                      </Modal.Header>
                      <ModalBody>
                        <Button
                          disabled={this.state.isDisabled}
                          onClick={this.handleSubmitClicked}
                        >
                          Yes
                        </Button>
                      </ModalBody>
                    </Modal>
                  </>
                )} */}
                {/* <button
                  onClick={() => {
                    getpost(current_post._id).then((data) => {
                      let link = `http://localhost:3000/post/${data.post._id}`;
                      navigator.clipboard.writeText(link);
                      toast.success("Link copied to clipboard");
                    });
                  }}
                >
                  <ShareIcon />
                </button> */}
                <Heart isClick={this.state.isClick} onClick={this.postliked} />
                {counts + " likes"}
              </div>
              <div className="d-flex align-items-center">
                <TextField
                  name="comment"
                  onChange={(e) => this.onTextChange(e)}
                  id="standard-basic"
                  label="Add a Comment"
                  fullWidth
                />
                <button
                  onClick={this.submitcomment}
                  className="btn btn-light-primary mr-5 ml-5 "
                  disabled={this.state.sentimentScore < -3 ? true : false}
                >
                  <SendRoundedIcon />
                </button>
              </div>
              {/* <TextField
                name="comment"
                onChange={(e) => this.onTextChange(e)}
                id="standard-basic"
                label="Add a Comment"
                fullWidth
              />
              <button
                onClick={this.submitcomment}
                className="btn btn-raised btn-primary mx-auto mt-3 mb-2 col-sm-3"
                disabled={this.state.sentimentScore < -3 ? true : false}
              >
                Submit
              </button> */}
              {collect(current_post.comments).count() > 0 ? (
                this.rendercomments(current_post.comments)
              ) : (
                <p>No Comments</p>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
}
const mapStateToProps = (state) => ({
  posts: state.posts.posts,
});

const mapDispatchToProps = (dispatch) => ({
  changePosts: (params) => dispatch(changePosts(params)),
  notificationAdded: (params) => dispatch(notificationAdded(params)),
});
export default connect(mapStateToProps, mapDispatchToProps)(showPost);
