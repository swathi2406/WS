import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import ReactPlayer from "react-player/youtube";
import { Link } from "react-router-dom";
import YouTubeIcon from "@material-ui/icons/YouTube";
import * as youtubeMeta from "youtube-metadata-from-url";
import { createTextPost, createYoutubePost } from "./apiPosts";
import { toast, ToastContainer } from "react-toastify";
import Sentiment from "sentiment";
import { getPosts } from "./../store/posts";
import { useDispatch } from "react-redux";

const sentiment = new Sentiment();
const YoutubeURLPost = (props) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [metadata, setMetadata] = useState({});
  const [title, setTitle] = useState("");
  const [type, setType] = useState("text");
  let [sentimentScore, setsentimentScore] = useState([]);
  useEffect(() => {
    if (validateYouTubeUrl(props.text)) {
      youtubeMeta.metadata(props.text).then(
        function (json) {
          //   console.log("Response:", json);
          setMetadata(json);
        },
        function (err) {
          console.log(err);
        }
      );
    }
  }, [props.text]);
  function handleClose() {
    setOpen(false);
  }
  function handleShow() {
    setOpen(true);
  }
  function validateYouTubeUrl(urlToParse) {
    if (urlToParse) {
      var regExp =
        /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
      if (urlToParse.match(regExp)) {
        if (type !== "youtube") setType("youtube");
        return true;
      }
    }
    if (type !== "text") setType("text");
    return false;
  }
  function titleChange(e) {
    setTitle(e.target.value);
    findSentiment(e.target.value);
    console.log(title);
  }
  const findSentiment = (title) => {
    const result = sentiment.analyze(title);
    sentimentScore = setsentimentScore(result.score);
  };
  const { text, disabled } = props;
  if (disabled === undefined) return null;
  //   console.log(text);
  return (
    <>
      <ToastContainer />
      <Button
        onClick={() => {
          if (text !== "") handleShow();
        }}
        disabled={disabled}
      >
        Youtube Link
      </Button>
      <Modal show={open} onHide={handleClose}>
        <Modal.Header>
          <Modal.Title>Your thoughts here...</Modal.Title>
          <Button onClick={handleClose}>x</Button>
        </Modal.Header>
        <Modal.Body>
          {validateYouTubeUrl(text) ? (
            <>
              <YouTubeIcon />
              {/* <a href={text} target={"_blank"}>
                {text.toString()} {console.log(metadata)}
              </a> */}
              <div>{metadata.title}</div>
              <ReactPlayer
                url={text}
                controls={true}
                width={window.width / 4}
              />
              <div>By {metadata.author_name}</div>
              <input
                type="text"
                id="youtubeText"
                className="form-control"
                onChange={(e) => titleChange(e)}
              />
            </>
          ) : (
            <h4>{text}</h4>
          )}
        </Modal.Body>
        <Modal.Footer>
          {sentimentScore >= -3 && (
            <Button
              onClick={() => {
                if (type === "youtube") {
                  if (title !== "")
                    createYoutubePost(text, title, metadata).then((data) => {
                      // console.log(data);
                      if (data.error) {
                        toast.warning(data.error);
                      } else {
                        toast.success("Created post Successfully");
                        dispatch(getPosts());
                        // history.push("/home");
                      }
                    });
                  else {
                    toast.warning("Enter caption for the post!");
                  }
                } else {
                  toast.warning("Please enter a valid Youtube URL");
                }
              }}
            >
              Sure?
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default YoutubeURLPost;
