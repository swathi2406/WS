import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { DropzoneArea } from "material-ui-dropzone";
import { ToastContainer, toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { createPost } from "./apiPosts";
import { TextField } from "@material-ui/core";
import SkillsInput from "./../utils/signupbutton/Tagify/SkillsInput";
import { listmyprojects } from "./../project/apiProject";
import Sentiment from "sentiment";
import { useDispatch } from "react-redux";
import { getPosts } from "./../store/posts";
function DragDropProfilePic(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const [files, setFiles] = useState([]);
  const [projects, setProjects] = useState([]);
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
    props.setImage(image);
  };

  return (
    <>
      <ToastContainer />
      <DropzoneArea
        acceptedFiles={["image/*"]}
        dropzoneText={"Drag and drop an image here or click"}
        onChange={(files) => {
          postDetails(files[0]);
        }}
        maxFileSize={10485760}
      />
    </>
  );
}
export default DragDropProfilePic;
