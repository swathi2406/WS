import React, { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
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
import axios from "axios";

const sentiment = new Sentiment();
function DragDropImages(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const [files, setFiles] = useState([]);
  const [title, set_title] = useState(String);
  const [tags, setTags] = useState([]);
  const [project, setProject] = useState("Personal");
  const [projects, setProjects] = useState([]);
  let [sentimentScore, setsentimentScore] = useState([]);
  // const { getRootProps, getInputProps } = useDropzone({
  //   accept: "image/*",
  //   onDrop: (acceptedFiles) => {
  //     acceptedFiles.map((file) => {
  //       const reader = new FileReader();
  //       reader.onabort = () => console.log("file reading was aborted");
  //       reader.onerror = () => console.log("file reading has failed");
  //       reader.onload = () => {
  //         const binaryStr = reader.result;
  //         const data = new Uint8Array(binaryStr);
  //         // let result = webp.buffer2webpbuffer(reader.result, "jpg", "-q 80");
  //         // console.log(result);
  //         // result.then(function (result) {
  //         //   // you access the value from the promise here
  //         //   console.log(result);
  //         // });

  //         // console.log(reader.readAsArrayBuffer(file));
  //         // compress_images(
  //         //   file.path,
  //         //   file.path + "compressed",
  //         //   { compress_force: false, statistic: true, autoupdate: true },
  //         //   false,
  //         //   { jpg: { engine: "webp", command: false } },
  //         //   { png: { engine: "webp", command: false } },
  //         //   { svg: { engine: "svgo", command: false } },
  //         //   { gif: { engine: "gifwebp", command: false } },
  //         //   function (err, completed) {
  //         //     if (completed === true) console.log("done");
  //         // }
  //         // );
  //         // const buffer = binaryStr;
  //         // var binary = "";
  //         // var bytes = new Uint8Array(buffer);
  //         // var len = bytes.byteLength;
  //         // for (var i = 0; i < len; i++) {
  //         //   binary += String.fromCharCode(bytes[i]);
  //         // }
  //         // const base64 = btoa(binary);
  //         // console.log(base64);
  //       };
  //     });

  //     setFiles(
  //       acceptedFiles.map((file) =>
  //         Object.assign(file, {
  //           preview: URL.createObjectURL(file),
  //         })
  //       )
  //     );
  //   },
  // });

  // const thumbs = files.map((file) => (
  //   <div style={thumb} key={file.name}>
  //     <div style={thumbInner}>
  //       <img src={file.preview} style={img} />
  //     </div>
  //   </div>
  // ));
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
  const postDetails = (images) => {
    if (title === "") toast.warning("Please enter the Title");
    else {
      let final_url = [];
      images.map(async (image, i) => {
        const data = new FormData();
        data.append("title", title);
        data.append("tags", tags);
        data.append("myImage", image);
        let settings = {
          headers: {
            "content-type": "multipart/form-data",
          },
        };
        let response = await axios.post(
          `http://localhost:3000/convertToWebp`,
          data,
          settings
        );
        if (response.data.message === "Inappropriate Content") {
          let obj = response.data.values;
          if (obj.nudity >= 90)
            toast.error(
              "Inappropriate Content.. Your post " +
                (i + 1) +
                " contains " +
                obj.nudity.toFixed(2) +
                "% nudity content"
            );
          else if (obj.violence >= 90)
            toast.error(
              "Inappropriate Content.. Your post " +
                (i + 1) +
                " contains " +
                obj.violence.toFixed(2) +
                "% violent content"
            );
        } else {
          try {
            let result = await response.data.result;
            final_url.push(result.url);
            if (final_url.length === images.length)
              createPost(final_url, title, tags, project).then((data) => {
                console.log(data);
                if (data.error) {
                  toast.warning(data.error);
                } else {
                  toast.success("Created post Successfully");
                  dispatch(getPosts());
                  history.push("/home");
                }
              });
          } catch (e) {
            console.log(e);
            toast.warning("Please Try again");
          }
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
      {/* <TextField
        name="Title"
        onChange={(e) => onTextChange(e)}
        variant="outlined"
        label="Title"
        fullWidth
      /> */}
      <Form.Control
        type="text"
        placeholder="Title"
        name="Title"
        onChange={(e) => onTextChange(e)}
        as="textarea"
        rows={3}
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
      <DropzoneArea
        acceptedFiles={["image/*"]}
        dropzoneText={"Drag and drop an image here or click"}
        onChange={(files) => {
          console.log("Files:", files);
          setFiles(files);
        }}
        maxFileSize={10485760}
      />
      <div className="text-center mt-2">
        {sentimentScore >= -3 && (
          <Button
            onClick={() => {
              postDetails(files, title, tags, project);
              // console.log(project);
            }}
          >
            Post
          </Button>
        )}
      </div>
    </>
  );
}
export default DragDropImages;
