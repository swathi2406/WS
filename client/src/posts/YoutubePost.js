import React, { Component } from "react";
import ShareIcon from "@material-ui/icons/Share";
import { toast } from "react-toastify";
import Heart from "react-animated-heart";
import { getCurrentUser, getProfilePic } from "./../user/apiUser";
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
import MoreVertIcon from "@material-ui/icons/MoreVert";
import VisibilityTwoToneIcon from "@material-ui/icons/VisibilityTwoTone";
import ReportTwoToneIcon from "@material-ui/icons/ReportTwoTone";
import SendRoundedIcon from "@material-ui/icons/SendRounded";
import DeleteTwoToneIcon from "@material-ui/icons/DeleteTwoTone";
import moment from "moment";
import {
  Accordion,
  Button,
  Card,
  Modal,
  ModalBody,
  Popover,
  OverlayTrigger,
} from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import { TextField } from "@material-ui/core";
import { Link } from "react-router-dom";
import Sentiment from "sentiment";
import YouTubeIcon from "@material-ui/icons/YouTube";
import * as youtubeMeta from "youtube-metadata-from-url";
import DeletePost from "./DeletePost";
import ReactPlayer from "react-player/youtube";
import { connect } from "react-redux";
import { changePosts } from "../store/posts";
const sentiment = new Sentiment();
class YoutubePost extends Component {
  state = {
    isClick: false,
    comment: "",
    id: getCurrentUser()._id,
    sentimentScore: null,
    disabled: false,
    // metadata: {},
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
  async componentDidMount() {
    let users = this.props.liked_by;
    if (users !== undefined && users !== null && users !== [])
      if (users.indexOf(getCurrentUser()._id) > -1)
        this.setState({ isClick: true });
    const { comments } = this.props;
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
      if (!this.checkIfUserIdExistsInObject(profilePictures, comment.userId)) {
        let picture = await this.setProfilePicture(comment.userId);
        Object.assign(pictures, picture);
        // console.log(pictures);
        this.setState({ profilePictures: pictures });
      }
    });
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.props.comments.length !== prevProps.comments.length) {
      this.props.changePosts(this.props._id);
    }
  }
  setProfilePicture = (userId) => {
    // let picture = {};
    return getProfilePic(userId).then((data) => {
      return { [userId]: data.profilePic };
    });
  };

  postliked = () => {
    this.setState({ isClick: !this.state.isClick });
    if (this.state.isClick)
      dislikepost(this.props._id)
        .then((data) => console.log(data))
        .then(() => this.props.changePosts(this.props._id));
    else
      likepost(this.props._id)
        .then((data) => console.log(data))
        .then(() => this.props.changePosts(this.props._id));
  };

  handleSubmitClicked = () => {
    reportpost(this.props._id);
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
  onTextChange = (e) => {
    this.setState({ comment: e.target.value });
    this.findSentiment(e.target.value);
  };

  submitcomment = () => {
    addcomment(this.props._id, this.state.comment)
      .then((data) => {
        console.log(data);
      })
      .then(() => this.props.changePosts(this.props._id));
  };

  findSentiment(comment) {
    const result = sentiment.analyze(comment);
    this.setState({
      sentimentScore: result.score,
    });
  }

  deletecomment(e, commentId) {
    e.preventDefault();
    deleteComment(commentId, this.props._id)
      .then((data) => console.log(data))
      .then(() => {
        this.props.changePosts(this.props._id);
        // toast.success("deleted comment successfully");
      });
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
              <div className="ml-auto">
                {this.state.id === userId && (
                  <button
                    className="btn btn-clear"
                    onClick={(e) => this.deletecomment(e, _id)}
                  >
                    <DeleteTwoToneIcon />
                  </button>
                )}
              </div>
            </div>
            <span className="text-dark-75 font-size-sm font-weight-normal pt-1">
              {comment}
            </span>
          </div>
        </div>
      )
    );
  };

  render() {
    const {
      headerText,
      footerText,
      url,
      liked_by,
      _id,
      tags,
      comments,
      metadataTitle,
      metadataAuthor,
      delete_button,
      created,
      postedBy,
      reportCounter,
    } = this.props;
    // const { metadata } = this.state;
    const { profilePictures } = this.state;
    let counts = collect(liked_by).count();
    // console.log("metadataTitle:", metadataTitle);
    return (
      <>
        <div className="card card-custom gutter-b">
          <div className="card-body">
            <div className="d-flex align-items-center pb-4">
              <div className="symbol symbol-40 symbol-light-warning mr-5">
                <span className="symbol-label">
                  <img
                    src={
                      profilePictures[this.props.postedBy._id] !== undefined
                        ? profilePictures[this.props.postedBy._id]
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
                  {footerText}
                </Link>
                <span className="text-muted font-weight-bold">
                  {moment(created).format("DD-MM-YYYY h:mm a")}
                </span>
              </div>
              <div className="ml-auto">
                <OverlayTrigger
                  trigger="click"
                  placement="right"
                  overlay={
                    <Popover id="popover-basic">
                      <Popover.Content>
                        <div>
                          {getCurrentUser()._id === postedBy._id ? (
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
                        </div>
                        <Link
                          className="btn btn-clean"
                          to={{
                            pathname: `/post/${this.props._id}`,
                          }}
                        >
                          <VisibilityTwoToneIcon /> View Full Post
                        </Link>
                        <div>
                          <button
                            className="btn btn-clean"
                            onClick={() => {
                              getpost(_id).then((data) => {
                                let link = `http://localhost:3000/post/${data.post._id}`;
                                navigator.clipboard.writeText(link);
                                toast.success("Link copied to clipboard");
                              });
                            }}
                          >
                            <ShareIcon /> Share Post
                          </button>
                        </div>
                        {delete_button === "enabled" ? (
                          <DeletePost postId={_id} />
                        ) : (
                          <div></div>
                        )}
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
            <p className="lead ml-10 mt-5 text-dark-75 font-size-lg font-weight-normal ">
              {headerText}
            </p>
            <div className="mt-3">
              <p className="text-dark-75 font-size-lg font-weight-normal">
                <YouTubeIcon
                  fontSize="large"
                  className="text-danger display-3 mr-5 ml-2"
                />
                {/* <a href={text} target={"_blank"}>
                {text.toString()} {console.log(metadata)}
                </a> */}
                <span>
                  <strong>{metadataTitle}</strong> By {metadataAuthor}
                </span>
                <center>
                  <ReactPlayer url={url} controls={true} width={window.width} />
                </center>
              </p>
              <div className="d-flex align-items-center">
                <Heart isClick={this.state.isClick} onClick={this.postliked} />

                <button type="button" class="btn btn-light-danger">
                  <strong>
                    <span class="badge badge-light">{counts}</span> Likes
                  </strong>
                </button>
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
              {comments.length > 0 ? (
                this.rendercomments(comments)
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
});

export default connect(mapStateToProps, mapDispatchToProps)(YoutubePost);
