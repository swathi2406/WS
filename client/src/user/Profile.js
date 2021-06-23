import React, { Component } from "react";
import { isAuthenticated } from "../auth";
import { Redirect, Link } from "react-router-dom";
import {
  read,
  getCurrentUser,
  followUser,
  unfollowUser,
  getUserById,
} from "./apiUser";
import DefaultProfile from "../images/avatar.png";
import DeleteUser from "./DeleteUser";
import {
  Row,
  Tab,
  Col,
  Nav,
  Card,
  ListGroup,
  ListGroupItem,
} from "react-bootstrap";
import PersonTwoToneIcon from "@material-ui/icons/PersonTwoTone";
import ChatTwoToneIcon from "@material-ui/icons/ChatTwoTone";
import AccountTreeTwoToneIcon from "@material-ui/icons/AccountTreeTwoTone";
import PhotoTwoToneIcon from "@material-ui/icons/PhotoTwoTone";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import PersonAddDisabledIcon from "@material-ui/icons/PersonAddDisabled";
import DonutChart from "react-donut-chart";
import { listmyprojects } from "./../project/apiProject";
import { connect } from "react-redux";
import { updateFollowers, updateFollowing } from "../store/user";
import Post from "./../posts/Post";
import VideoPost from "./../posts/VideoPost";
import TextPostView from "./../posts/TextPostView";
import YoutubePost from "./../posts/YoutubePost";
import { getPostsOfUser } from "../posts/apiPosts";
import { notificationAdded } from "../store/notifications";
import { ToastContainer } from "react-toastify";
import { sortedLastIndex } from "lodash";
import Following from "./Following";
import Followers from "./Followers";
class Profile extends Component {
  constructor() {
    super();
    this.state = {
      user: "",
      redirectToSignin: false,
      posts: [],
      delete_button: "",
    };
  }

  init = (userId) => {
    const token = isAuthenticated().token;
    read(userId, token).then((data) => {
      if (data.error) {
        this.setState({ redirectToSignin: true });
      } else {
        this.setState({ user: data });
      }
    });
  };

  componentDidMount() {
    const userId = this.props.match.params.userId;
    this.init(userId);
    listmyprojects().then((projects) => {
      this.setState({ projects: projects.userProjects });
    });
    // const { following } = this.props;
    // console.log(1);
    getUserById(getCurrentUser()._id).then((data) => {
      this.props.updateFollowing({
        following: data.user.following,
      });
      this.props.updateFollowers({
        followers: data.user.followers,
      });
    });
    getPostsOfUser(userId)
      .then((res) => res.json())
      .then((data) => {
        this.setState({ posts: data });
      });

    if (getCurrentUser()._id.toString() === userId.toString())
      this.setState({ delete_button: "enabled" });
  }
  // this.setState({ projects });

  componentWillReceiveProps(props) {
    const userId = props.match.params.userId;
    this.init(userId);
  }
  render() {
    const { redirectToSignin, user } = this.state;
    if (user.skills === undefined) return null;
    if (redirectToSignin) return <Redirect to="/signin" />;
    let projects = this.state.projects;
    let ongoing = 0;
    let completed = 0;
    let overdue = 0;
    const { following } = this.props;
    // console.log(following);
    if (projects !== undefined) {
      projects.map((project) => {
        if (project.status === "Completed") completed++;
        if (project.status === "In Progress") ongoing++;
      });
    }
    const { posts } = this.state;
    if (posts === undefined) return null;
    // const { following } = this.props;
    return (
      <div className="container mt-5">
        <ToastContainer />
        <Tab.Container id="left-tabs-example" defaultActiveKey="personalInfo">
          <Row>
            <Col sm={3}>
              <div className="card card-custom card-stretch">
                <div className="card-body pt-4">
                  <div className="d-flex align-items-center">
                    <img
                      src={
                        user.profilePictures.length !== 0
                          ? user.profilePictures[
                              user.profilePictures.length - 1
                            ]
                          : DefaultProfile
                      }
                      alt={user.name}
                      className="symbol symbol-60 symbol-xxl-100 mr-3 align-self-start align-self-xxl-center"
                      style={{ width: "55px" }}
                    />
                    <div>
                      <h5 className="font-weight-bolder text-dark-75 text-hover-primary">
                        {user.name}
                      </h5>
                      <div className="text-muted">@{user.username}</div>
                      {isAuthenticated().user &&
                      isAuthenticated().user._id === user._id ? (
                        <div className="mt-2">
                          <Link
                            className="btn btn-sm btn-primary mr-2 py-2 px-3 px-xxl-5 my-1"
                            to={`/user/edit/${user._id}`}
                          >
                            Edit Profile
                          </Link>
                          <DeleteUser userId={user._id} />
                        </div>
                      ) : (
                        <div className="mt-2">
                          {user._id !== getCurrentUser()._id ? (
                            user.followers.indexOf(getCurrentUser()._id) >
                            -1 ? (
                              <button
                                className="btn btn-raised btn-primary"
                                onClick={(e) =>
                                  unfollowUser(e, user._id).then((data) => {
                                    this.props.updateFollowing({
                                      following: data.user.following,
                                    });
                                    this.props.updateFollowers({
                                      followers: data.user.followers,
                                    });
                                  })
                                }
                              >
                                UnFollow <PersonAddDisabledIcon />
                              </button>
                            ) : (
                              <button
                                className="btn btn-raised btn-primary"
                                onClick={(e) =>
                                  followUser(e, user._id).then((data) => {
                                    this.props.updateFollowing({
                                      following: data.user.following,
                                    });
                                    this.props.updateFollowers({
                                      followers: data.user.followers,
                                    });
                                    this.props.notificationAdded({
                                      userId: user._id,
                                      message: `${
                                        getCurrentUser().name
                                      } has followed you.`,
                                      type: "FollowedYou",
                                      userObjId: getCurrentUser()._id,
                                    });
                                    this.props.notificationAdded({
                                      userId: getCurrentUser()._id,
                                      message: `Followed ${user.name}!`,
                                      type: "StartedFollowing",
                                      userObjId: user._id,
                                    });
                                  })
                                }
                              >
                                Follow <PersonAddIcon />
                              </button>
                            )
                          ) : (
                            <div></div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className=" pt-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="font-weight-bold mr-2">Email: </span>
                      <span className="text-muted email-wrap text-hover-primary">
                        {user.email}
                      </span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="font-weight-bold mr-2">Location: </span>
                      <span className="text-muted text-hover-primary">
                        {user.location}
                      </span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="font-weight-bold mr-2">Joined: </span>
                      <span className="text-muted text-hover-primary">
                        {` ${new Date(user.created).toDateString()}`}
                      </span>
                    </div>
                    {user._id === getCurrentUser()._id && (
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <button className="btn btn-clean">
                          <Following />
                        </button>
                        <button className="btn btn-clean">
                          <Followers followers_users={user.followers} />
                        </button>
                      </div>
                    )}
                  </div>
                  <Nav variant="pills" className="flex-column mt-3">
                    <Nav.Item>
                      <Nav.Link eventKey="personalInfo">
                        <div className="d-flex align-items-center">
                          <div className="mr-3">
                            <PersonTwoToneIcon />
                          </div>
                          <div>Personal Information</div>
                        </div>
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="socialInfo">
                        <div className="d-flex align-items-center">
                          <div className="mr-3">
                            <ChatTwoToneIcon />
                          </div>
                          <div>Social Information</div>
                        </div>
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="projInfo">
                        <div className="d-flex align-items-center">
                          <div className="mr-3">
                            <AccountTreeTwoToneIcon />
                          </div>
                          <div>Project Stats</div>
                        </div>
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="posts">
                        <div className="d-flex align-items-center">
                          <div className="mr-3">
                            <PhotoTwoToneIcon />
                          </div>
                          <div>Posts</div>
                        </div>
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </div>
              </div>
            </Col>
            <Col sm={9}>
              <Tab.Content>
                <Tab.Pane eventKey="personalInfo">
                  <div className="card card-stretch">
                    <div className="card-header">
                      <div className="card-title align-items-start flex-column">
                        <h4 className="card-label font-weight-bolder text-dark">
                          Personal Information
                        </h4>
                        <span className="text-muted font-weight-bold font-size-sm mt-1">
                          Update your personal information.
                        </span>
                      </div>
                    </div>
                    <div className="card-body">
                      <table className="table table-borderless">
                        <tbody>
                          <tr>
                            <th>Name</th>
                            <td>{user.name}</td>
                          </tr>
                          <tr>
                            <th>Email</th>
                            <td>{user.email}</td>
                          </tr>
                          <tr>
                            <th>Bio</th>
                            <td>{user.bio}</td>
                          </tr>
                          <tr>
                            <th>Skills</th>
                            <td>
                              {user.skills.map((skill) => (
                                <span class="btn btn-light-info btn-sm font-weight-bold btn-upper btn-text mr-1">
                                  {skill}
                                </span>
                              ))}
                            </td>
                          </tr>
                          <tr>
                            <th>Date of Birth</th>
                            <td>{` ${new Date(user.dob).toDateString()}`}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="socialInfo">
                  <div className="card card-stretch">
                    <div className="card-header">
                      <div className="card-title align-items-start flex-column">
                        <h4 className="card-label font-weight-bolder text-dark">
                          Social Information
                        </h4>
                        <span className="text-muted font-weight-bold font-size-sm mt-1">
                          Update your personal information.
                        </span>
                      </div>
                    </div>
                    <div className="card-body">
                      <table className="table table-borderless">
                        <tbody>
                          <tr>
                            <th>Website</th>
                            <td>
                              {user.social.website
                                ? user.social.website
                                : "Not available"}
                            </td>
                          </tr>
                          <tr>
                            <th>Instagram</th>
                            <td>
                              {user.social.instagram
                                ? user.social.instagram
                                : "Not available"}
                            </td>
                          </tr>
                          <tr>
                            <th>Facebook</th>
                            <td>
                              {user.social.facebook
                                ? user.social.facebook
                                : "Not available"}
                            </td>
                          </tr>
                          <tr>
                            <th>Linkedin</th>
                            <td>
                              {user.social.linkedin
                                ? user.social.linkedin
                                : "Not available"}
                            </td>
                          </tr>
                          <tr>
                            <th>Twitter</th>
                            <td>
                              {user.social.twitter
                                ? user.social.twitter
                                : "Not available"}
                            </td>
                          </tr>
                          <tr>
                            <th>Youtube</th>
                            <td>
                              {user.social.youtube
                                ? user.social.youtube
                                : "Not available"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="projInfo">
                  <div className="card card-stretch">
                    <div className="card-header">
                      <div className="card-title align-items-start flex-column">
                        <h4 className="card-label font-weight-bolder text-dark">
                          Project Stats
                        </h4>
                        <span className="text-muted font-weight-bold font-size-sm mt-1">
                          Statistics of your projects
                        </span>
                      </div>
                    </div>
                    <div className="card-body">
                      <table className="table table-borderless">
                        <DonutChart
                          data={[
                            {
                              label: "Ongoing Projects",
                              value: ongoing,
                            },
                            {
                              label: "Overdue Projects",
                              value: 1,
                            },
                            {
                              label: "Completed Projects",
                              value: completed,
                            },
                          ]}
                          innerRadius="0.6"
                        />
                      </table>
                    </div>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="posts">
                  <div className="userPosts">
                    {posts.map(
                      (post) =>
                        (post.postType === "video" && (
                          <VideoPost
                            headerText={post.title}
                            footerText={"by " + post.postedBy.name}
                            cardText={post.video}
                            videoUrl={post.video}
                            liked_by={post.liked_by}
                            _id={post._id}
                            comments={post.comments}
                            tags={post.tags}
                            delete_button={this.state.delete_button}
                            reportCounter={post.reportCounter}
                            postedBy={post.postedBy}
                          />
                        )) ||
                        (post.postType === "image" && (
                          <Post
                            headerText={post.title}
                            footerText={"by " + post.postedBy.name}
                            cardText={post.photo}
                            imageUrl={post.photo}
                            liked_by={post.liked_by}
                            _id={post._id}
                            comments={post.comments}
                            tags={post.tags}
                            delete_button={this.state.delete_button}
                            reportCounter={post.reportCounter}
                            postedBy={post.postedBy}
                          />
                        )) ||
                        (post.postType === "text" && (
                          <TextPostView
                            text={post.title}
                            footerText={"by " + post.postedBy.name}
                            comments={post.comments}
                            liked_by={post.liked_by}
                            _id={post._id}
                            delete_button={this.state.delete_button}
                            reportCounter={post.reportCounter}
                            postedBy={post.postedBy}
                          />
                        )) ||
                        (post.postType === "youtubeVideo" && (
                          <YoutubePost
                            headerText={post.title}
                            comments={post.comments}
                            liked_by={post.liked_by}
                            _id={post._id}
                            footerText={"by " + post.postedBy.name}
                            url={post.video}
                            metadataTitle={post.metadataTitle}
                            metadataAuthor={post.metadataAuthor}
                            delete_button={this.state.delete_button}
                            reportCounter={post.reportCounter}
                            postedBy={post.postedBy}
                          />
                        ))
                    )}
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  following: state.user.following,
  followers: state.user.followers,
});

const mapDispatchToProps = (dispatch) => ({
  updateFollowing: (params) => dispatch(updateFollowing(params)),
  updateFollowers: (params) => dispatch(updateFollowers(params)),
  notificationAdded: (params) => dispatch(notificationAdded(params)),
});
export default connect(mapStateToProps, mapDispatchToProps)(Profile);
