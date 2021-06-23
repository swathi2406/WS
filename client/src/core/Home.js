import React, { Component } from "react";
import { connect } from "react-redux";
import { getNotifications } from "../apiNotifications";
import { isAuthenticated } from "../auth";
import DefaultProfile from "../images/avatar.png";
import {
  notificationAdded,
  getNotified,
  clearNotifications,
  setSegregatedNotifications,
} from "../store/notifications";
import * as _ from "lodash";
import { getCurrentUser, getUserById } from "../user/apiUser";
import ProjectRecommendation from "./ProjectRecommendation";
import { getProject } from "../project/apiProject";
import { listmyprojects } from "./../project/apiProject";
import { Modal, Button } from "react-bootstrap";
import PostImage from "./../posts/PostImage";
import PostVideo from "./../posts/PostVideo";
import { getAllPosts } from "./../posts/apiPosts";
import Post from "../posts/Post";
import LiveClock from "react-live-clock";
import dayjs from "dayjs";
import { Badge } from "react-bootstrap";
import SearchTwoToneIcon from "@material-ui/icons/SearchTwoTone";
import VideoPost from "./../posts/VideoPost";
import TextPost from "./../posts/TextPost";
import TextPostView from "./../posts/TextPostView";
import YoutubePost from "./../posts/YoutubePost";
import Sentiment from "sentiment";
import { getPosts } from "../store/posts";
import YoutubeURLPost from "../posts/YoutubeURLPost";
import { setProfilePic } from "../store/user";
import SearchBar from "./SearchBar";
const sentiment = new Sentiment();
class Home extends Component {
  state = {
    notificationGroupedObject: {},
    show: false,
    text: "",
    youtubeUrl: false,
    sentimentScore: 0,
  };
  componentDidMount() {
    listmyprojects().then((projects) =>
      this.setState({ projects: projects.userProjects })
    );
    // getAllPosts()
    //   .then((res) => res.json())
    //   .then((data) => {
    //     console.log(data);
    //     this.setState({ posts: data.posts });
    //   });
    getUserById(getCurrentUser()._id).then((data) => {
      const profilePic =
        data.user.profilePictures[data.user.profilePictures.length - 1];
      this.props.setProfilePic({ profilePic });
    });
    this.props.getPosts();
  }
  getProjectTeamFromState = (projectId) => {
    return this.state.projects.map((project) => {
      if (project._id.toString() === projectId.toString()) {
        return project.team;
      }
    });
    // return undefined;
  };
  validateYouTubeUrl = (urlToParse) => {
    if (urlToParse) {
      var regExp =
        /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
      if (urlToParse.match(regExp)) {
        // if (type !== "youtube") setType("youtube");
        return true;
      }
    }
    // if (type !== "text") setType("text");
    return false;
  };
  textChange = (e) => {
    this.setState({ text: e.target.value });
    this.findSentiment(e.target.value);
    if (this.validateYouTubeUrl(e.target.value))
      this.setState({ youtubeUrl: true });
    if (!this.validateYouTubeUrl(e.target.value))
      this.setState({ youtubeUrl: false });
  };

  findSentiment(text) {
    const result = sentiment.analyze(text);
    // console.log("Sentiment value : ", result.score);
    this.setState({
      sentimentScore: result.score,
    });
  }

  render() {
    if (getCurrentUser()._id === undefined) return;
    const { notifications, posts } = this.props;
    const { notificationGroupedObject, projects, youtubeUrl, text } =
      this.state;
    let user = getUserById(getCurrentUser()._id);
    console.log(projects, getCurrentUser()._id, user);
    // if (this.props.notifications.length > 0) {
    //   console.log("NOTIFICATIONS:");
    //   console.log(this.props.notifications);
    // }
    // notifications.map((notif) => {
    //   console.log(notif);
    // });
    // console.log(posts);
    const { profilePic } = this.props;
    // console.log(profilePic);
    Object.keys(notificationGroupedObject).length > 0 &&
      console.log(Object.keys(notificationGroupedObject));
    // console.log(projects);
    if (
      Object.keys(notificationGroupedObject).length !== 0 &&
      projects !== undefined &&
      notificationGroupedObject.FeedbackForm !== undefined
    ) {
      if (notificationGroupedObject["FeedbackForm"].length > 0) {
        console.log("Feedback Forms:");
        console.log(notificationGroupedObject.FeedbackForm);
      }
    }
    return (
      <>
        <div
          className="subheader py-2 py-lg-6  subheader-transparent "
          id="kt_subheader"
        >
          <div className=" container  d-flex align-items-center justify-content-between flex-wrap flex-sm-nowrap">
            <div className="d-flex align-items-center flex-wrap mr-2">
              <h5 className="text-dark font-weight-bold mt-2 mb-2 mr-5">
                My Feed
              </h5>
              <span>
                <SearchBar />
              </span>
            </div>
            <div className="d-flex align-items-center flex-wrap">
              <Badge variant="primary">
                <div className="d-flex align-items-center flex-wrap mr-2">
                  <h6>{dayjs().format("DD MMMM, dddd")}</h6>
                  <div className="subheader-separator subheader-separator-ver mt-2 mb-2 mr-4 ml-4 bg-gray-200"></div>
                  <h6>
                    <LiveClock format="hh:mm a" ticking />
                  </h6>
                </div>
              </Badge>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-md-8">
              {/* <div className="jumbotron w-100">
                <h2>Home</h2>
                <p className="lead">News Feed (Posts) will be here</p>
              </div> */}
              <div className="">
                <div className="card card-custom gutter-b">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="symbol symbol-40 symbol-light-warning mr-5">
                        <span className="symbol-label">
                          <img
                            src={profilePic ? profilePic : DefaultProfile}
                            className="h-75 align-self-end"
                          />
                        </span>
                      </div>
                      <span className="text-dark font-weight-bold font-size-lg">
                        Hi {`${isAuthenticated().user.name}`}! Let us hear what
                        this hustler did today, we're excited to know!
                      </span>
                    </div>
                    <input
                      type="text"
                      id="typeText"
                      className="form-control mt-3"
                      onChange={(e) => this.textChange(e)}
                    />
                    {/* {youtubeUrl ? (
                    <Button>youtube post</Button>
                  ) : (
                    <Button>text post</Button>
                  )} */}
                    <div className="postOptions d-flex align-items-center flex-wrap mr-2 mt-3">
                      <div>
                        <PostImage />
                      </div>
                      <div>
                        <PostVideo />
                      </div>
                      <div>
                        {this.state.sentimentScore >= -3 ? (
                          <TextPost text={text} disabled={false} />
                        ) : (
                          <TextPost text={text} disabled={true} />
                        )}
                      </div>
                      <div>
                        {this.state.youtubeUrl ? (
                          <YoutubeURLPost text={text} disabled={false} />
                        ) : (
                          <YoutubeURLPost text={text} disabled={true} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {posts.map((post) => {
                  if (post.postType === "text")
                    return (
                      <TextPostView
                        text={post.title}
                        footerText={post.postedBy.name}
                        comments={post.comments}
                        liked_by={post.liked_by}
                        _id={post._id}
                        created={post.created}
                        postedBy={post.postedBy}
                        reportCounter={post.reportCounter}
                      />
                    );
                  if (post.postType === "youtubeVideo") {
                    // console.log(post);
                    return (
                      <YoutubePost
                        headerText={post.title}
                        comments={post.comments}
                        liked_by={post.liked_by}
                        _id={post._id}
                        footerText={post.postedBy.name}
                        url={post.video}
                        metadataTitle={post.metadataTitle}
                        metadataAuthor={post.metadataAuthor}
                        created={post.created}
                        postedBy={post.postedBy}
                        reportCounter={post.reportCounter}
                      />
                    );
                  }
                  if (post.postType === "video")
                    return (
                      <VideoPost
                        headerText={post.title}
                        footerText={"by " + post.postedBy.name}
                        cardText={post.video}
                        videoUrl={post.video}
                        liked_by={post.liked_by}
                        _id={post._id}
                        comments={post.comments}
                        tags={post.tags}
                        created={post.created}
                        postedBy={post.postedBy}
                        reportCounter={post.reportCounter}
                      />
                    );
                  if (post.postType === "image")
                    return (
                      <Post
                        headerText={post.title}
                        footerText={"by " + post.postedBy.name}
                        cardText={post.photo}
                        imageUrl={post.photo}
                        liked_by={post.liked_by}
                        _id={post._id}
                        comments={post.comments}
                        tags={post.tags}
                        created={post.created}
                        postedBy={post.postedBy}
                        reportCounter={post.reportCounter}
                      />
                    );
                })}
              </div>
            </div>
            <div className="col-md-4">
              <ProjectRecommendation />
            </div>
          </div>
        </div>
      </>
    );
  }
}
const mapStateToProps = (state) => ({
  notifications: state.notifications.notifications,
  posts: state.posts.posts,
  profilePic: state.user.profilePic,
});

const mapDispatchToProps = (dispatch) => ({
  addNotification: (params) => dispatch(notificationAdded(params)),
  getPosts: () => dispatch(getPosts()),
  setProfilePic: (params) => dispatch(setProfilePic(params)),
});
export default connect(mapStateToProps, mapDispatchToProps)(Home);
