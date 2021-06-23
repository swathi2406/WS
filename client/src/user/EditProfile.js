import React, { Component } from "react";
import { isAuthenticated } from "../auth";
import { read, update } from "./apiUser";
import { Redirect } from "react-router-dom";
import SkillsInput from "../utils/signupbutton/Tagify/SkillsInput";
import DefaultProfile from "../images/avatar.png";
import { Modal, Button } from "react-bootstrap";
import DragDropProfilePic from "./../posts/DragDropProfilePic";
import { postProfilePic, removeProfilePic } from "../posts/apiPosts";
import { toast, ToastContainer } from "react-toastify";
import { setProfilePic } from "../store/user";
import { connect } from "react-redux";
class EditProfile extends Component {
  constructor() {
    super();
    this.state = {
      id: "",
      name: "",
      email: "",
      password: "",
      redirectToProfile: false,
      error: "",
      initialName: "",
      open: false,
    };
  }

  init = (userId) => {
    const token = isAuthenticated().token;
    read(userId, token).then((data) => {
      if (data.error) {
        this.setState({ redirectToProfile: true });
      } else {
        this.setState({
          id: data._id,
          name: data.name,
          email: data.email,
          username: data.username,
          location: data.location,
          bio: data.bio,
          dob: data.dob,
          skills: data.skills,
          social: data.social,
          error: "",
        });
        let str = "";
        data.skills.map((skill) => {
          str += skill;
          str += ",";
        });
        str = str.slice(0, -1);
        this.setState({ skillstr: str });
        this.setState({ initialName: data.name });
      }
    });
  };

  componentDidMount() {
    const userId = this.props.match.params.userId;
    this.init(userId);
  }
  handleChange = (name) => (event) => {
    this.setState({ [name]: event.target.value });
  };
  handleSkills = (newSkills) => {
    this.setState({ skills: newSkills });
  };
  handleSocialChange = (name) => (event) => {
    const social = Object.assign({}, this.state.social, {
      [name]: event.target.value,
    });
    this.setState({ social });
  };
  clickSubmit = (event) => {
    event.preventDefault();
    const { name, username, email, password, location, bio, social, skills } =
      this.state;
    const user = {
      name,
      username,
      email,
      location,
      bio,
      social,
      skills,
      password: password || undefined,
    };
    // console.log(user);
    const userId = this.props.match.params.userId;
    const token = isAuthenticated().token;
    update(userId, token, user).then((data) => {
      if (data.error) this.setState({ error: data.error });
      else
        this.setState({
          redirectToProfile: true,
        });
    });
    // console.log(user);
  };
  handleOpen = () => {
    this.setState({ open: true });
  };
  handleClose = () => {
    this.setState({ open: false });
  };
  setImage = (image) => {
    console.log(image);
    this.setState({ image });
  };
  render() {
    const {
      id,
      name,
      email,
      password,
      username,
      location,
      bio,
      social,
      redirectToProfile,
      error,
      skillstr,
      initialName,
      open,
      image,
    } = this.state;
    if (redirectToProfile) {
      return <Redirect to={`/user/${id}`} />;
    }
    if (social === undefined) return null;
    const { profilePic } = this.props;
    let dp =
      profilePic === "" || profilePic === undefined
        ? DefaultProfile
        : profilePic;
    console.log("dp:", dp);
    return (
      <div className="container">
        <ToastContainer />
        <h2 className="mt-5 mb-5">Edit Profile</h2>
        <div
          className="alert alert-danger"
          style={{ display: error ? "" : "none" }}
        >
          {error}
        </div>
        <div className="card card-custom gutter-b">
          <div className="card-body">
            <div className="d-flex">
              <div className="flex-grow-1">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                  <div className="mr-3">
                    <Modal show={open} onHide={this.handleChange}>
                      <Modal.Header>
                        <Modal.Title>
                          Let's change your Display Picture
                        </Modal.Title>
                      </Modal.Header>

                      <Modal.Body>
                        {image !== undefined ? (
                          <img
                            src={URL.createObjectURL(image)}
                            width={"450px"}
                          />
                        ) : (
                          <DragDropProfilePic setImage={this.setImage} />
                        )}
                      </Modal.Body>

                      <Modal.Footer>
                        <Button
                          variant="secondary"
                          onClick={() => this.handleClose}
                        >
                          Close
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => {
                            if (image !== undefined) {
                              postProfilePic(image).then((url) => {
                                if (url) {
                                  toast.success("profile picture updated");
                                  this.props.setProfilePic({ profilePic: url });
                                  this.handleClose();
                                }
                              });
                            }
                          }}
                        >
                          Save changes
                        </Button>
                      </Modal.Footer>
                    </Modal>
                    <img
                      src={dp}
                      alt={initialName}
                      className="symbol symbol-60 symbol-xxl-100 mr-3 align-self-start align-self-xxl-center"
                      style={{ width: "55px" }}
                    />
                    <button
                      className="btn btn-light-warning btn-sm font-weight-bold btn-upper btn-text m-1"
                      onClick={() => {
                        this.handleOpen();
                      }}
                    >
                      Edit DP
                    </button>
                    <button
                      className="btn btn-light-danger btn-sm font-weight-bold btn-upper btn-text m-1"
                      onClick={() =>
                        removeProfilePic().then((data) => {
                          console.log("dp:", data);
                        })
                      }
                    >
                      Delete DP
                    </button>
                  </div>
                  {/* <h3>hello</h3> */}
                </div>
                <form className="mt-5">
                  <h3 className="pd-5">Personal Info</h3>
                  <div className="row">
                    <div className="col">
                      <div className="form-group">
                        <label>Username</label>
                        <input
                          onChange={this.handleChange("username")}
                          type="text"
                          className="form-control"
                          value={username}
                        />
                      </div>
                    </div>
                    <div className="col">
                      <div className="form-group">
                        <label>Name</label>
                        <input
                          onChange={this.handleChange("name")}
                          type="text"
                          className="form-control"
                          value={name}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          onChange={this.handleChange("email")}
                          type="email"
                          className="form-control"
                          value={email}
                        />
                      </div>
                    </div>
                    <div className="col">
                      <div className="form-group">
                        <label>Password</label>
                        <input
                          onChange={this.handleChange("password")}
                          type="password"
                          className="form-control"
                          value={password}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <div className="form-group">
                        <label>Bio</label>
                        <input
                          onChange={this.handleChange("bio")}
                          type="text"
                          className="form-control"
                          value={bio}
                        />
                      </div>
                    </div>
                    <div className="col">
                      <div className="form-group">
                        <label>Location</label>
                        <input
                          onChange={this.handleChange("location")}
                          type="text"
                          className="form-control"
                          value={location}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <div className="form-group">
                        <SkillsInput
                          label={"Skills"}
                          setSkills={this.handleSkills}
                          value={skillstr}
                        />
                      </div>
                    </div>
                  </div>
                  <h3>Social Info</h3>
                  <div className="row">
                    <div className="col">
                      <div className="form-group">
                        <label>Instagram</label>
                        <input
                          onChange={this.handleSocialChange("instagram")}
                          type="text"
                          className="form-control"
                          value={social.instagram}
                        />
                      </div>
                    </div>
                    <div className="col">
                      <div className="form-group">
                        <label>Facebook</label>
                        <input
                          onChange={this.handleSocialChange("facebook")}
                          type="text"
                          className="form-control"
                          value={social.instagram}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <div className="form-group">
                        <label>Your Website</label>
                        <input
                          onChange={this.handleSocialChange("website")}
                          type="text"
                          className="form-control"
                          value={social.website}
                        />
                      </div>
                    </div>
                    <div className="col">
                      <div className="form-group">
                        <label>Linkedin</label>
                        <input
                          onChange={this.handleSocialChange("linkedin")}
                          type="text"
                          className="form-control"
                          value={social.linkedin}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <div className="form-group">
                        <label>Youtube</label>
                        <input
                          onChange={this.handleSocialChange("youtube")}
                          type="text"
                          className="form-control"
                          value={social.youtube}
                        />
                      </div>
                    </div>
                    <div className="col">
                      <div className="form-group">
                        <label>Twitter</label>
                        <input
                          onChange={this.handleSocialChange("twitter")}
                          type="text"
                          className="form-control"
                          value={social.twitter}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={this.clickSubmit}
                    className="btn btn-raised btn-primary"
                  >
                    Update
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state) => ({
  profilePic: state.user.profilePic,
});

const mapDispatchToProps = (dispatch) => ({
  setProfilePic: (params) => dispatch(setProfilePic(params)),
});
export default connect(mapStateToProps, mapDispatchToProps)(EditProfile);
