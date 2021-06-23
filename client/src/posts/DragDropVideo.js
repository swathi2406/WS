import React, { useEffect, useState } from "react";
import { Button, Modal, ModalBody } from "react-bootstrap";
import { DropzoneArea } from "material-ui-dropzone";
import { ToastContainer, toast } from "react-toastify";
import { listmyprojects } from "./../project/apiProject";
import { useHistory } from "react-router-dom";
// import { createPost } from "./apiPosts";
import { TextField } from "@material-ui/core";
import SkillsInput from "./../utils/signupbutton/Tagify/SkillsInput";
import ReactPlayer from "react-player";
import { createVideoPost } from "./apiPosts";
import Sentiment from "sentiment";
import { useDispatch } from "react-redux";
import { getPosts } from "./../store/posts";
const sentiment = new Sentiment();
// import { ReactVideo } from 'reactjs-media';
const DragDropVideo = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [files, setFiles] = useState([]);
  const [title, set_title] = useState(String);
  const [tags, setTags] = useState([]);
  const [project, setProject] = useState("Personal");
  const [projects, setProjects] = useState([]);
  let [sentimentScore, setsentimentScore] = useState([]);
  useEffect(() => {
    listmyprojects().then((data) => setProjects(data.userProjects));
  }, []);
  useEffect(
    () => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    },
    [files]
  );
  const postDetails = (image) => {
    if (title === "") toast.warning("Please enter the Title");
    else {
      createVideoPost(image, title, tags, project).then((data) => {
        // console.log(data);
        if (data.error) {
          toast.warning(data.error);
        } else {
          toast.success("Created post Successfully");
          dispatch(getPosts());
          history.push("/home");
        }
      });
    }
  };
  const onTextChange = (e) => {
    set_title(e.target.value);
    findSentiment(e.target.value);
  };

  const findSentiment = (title) => {
    const result = sentiment.analyze(title);
    sentimentScore = setsentimentScore(result.score);
  };

  const handleTags = (newSkills) => {
    let new_tags = [...newSkills];
    setTags(new_tags);
  };
  const onChangeProject = (event) => {
    setProject(event.target.value);
  };
  return (
    <>
      <ToastContainer />
      <TextField
        name="Title"
        onChange={(e) => onTextChange(e)}
        variant="outlined"
        label="Title"
        fullWidth
      />
      <label>Project</label>
      <select class="custom-select" onChange={(e) => onChangeProject(e)}>
        <option selected>Personal</option>
        {/* <option value="1">One</option>
        <option value="2">Two</option>
        <option value="3">Three</option> */}
        {projects.map((project) => (
          <option value={project._id}>{project.title}</option>
        ))}
      </select>
      <SkillsInput label={<big>Tags</big>} setSkills={handleTags} />
      {files[0] === undefined ? (
        <DropzoneArea
          acceptedFiles={["video/*"]}
          dropzoneText={"Drag and drop a Video here or click"}
          onChange={(files) => {
            console.log("Files:", files);
            setFiles(files);
          }}
          maxFileSize={52428800}
        />
      ) : (
        <>
          {/* <h2>File loaded</h2> */}
          {/* <ReactVideo
            src={URL.createObjectURL(files[0])}
            poster="https://www.example.com/poster.png"
            primaryColor="red"
            // other props
          /> */}
          <ReactPlayer
            controls={true}
            url={URL.createObjectURL(files[0])}
            width={window.width / 4}
            volume={1}
            muted={false}
          />
        </>
      )}
      <div className="text-center mt-2">
        {sentimentScore >= -3 && (
          <Button
            onClick={() => {
              files.map((file) => console.log(file));
              files.map((file) => postDetails(file, title, tags, project));
              // console.log(project);
            }}
          >
            Post
          </Button>
        )}
      </div>
    </>
  );
};

export default DragDropVideo;
