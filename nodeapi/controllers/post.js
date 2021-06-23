const Post = require("../models/post");
const formidable = require("formidable");
const fs = require("fs");
const _ = require("lodash");
const webp = require("webp-converter");
const sharp = require("sharp");
const multer = require("multer");
const path = require("path");
const e = require("cors");
const rimraf = require("rimraf");
const fsPromises = require("fs").promises;
webp.grant_permission();

exports.postById = (req, res, next, id) => {
  Post.findById(id)
    .populate("postedBy", "_id name")
    .populate("liked_by", "_id")
    .populate("comments")
    .exec((err, post) => {
      if (err || !post) {
        return res.status(400).json({
          error: err,
        });
      }
      req.post = post;
      next();
    });
};

exports.reportPost = (req, res) => {
  let user = req.profile;
  let post = req.post;
  if (!post.reportCounter.includes(user._id)) post.reportCounter.push(user._id);
  if (post.reportCounter.length >= 3) {
    Post.findByIdAndDelete(post._id, function (err) {
      if (err)
        return res.status(400).json({ error: "Post could not be found" });
      else {
        return res.status(200).json({ message: "Post is Deleted." });
      }
    });
  } else {
    post.save();
    console.log(post);
    return res.status(200).json({ message: "Post is reported" });
  }
};

exports.getPosts = (req, res) => {
  const posts = Post.find()
    .populate("postedBy", "_id name")
    .then((posts) => {
      res.json({ posts });
    })
    .catch((err) => console.log(err));
};
function finalCheck(arr) {
  let checkarr = [];
  if (arr !== undefined) {
    checkarr = arr.map((checkObj) => {
      if (checkObj.nudity >= 90 || checkObj.violence >= 90) {
        return true;
      }
    });
    if (checkarr.includes(true)) return true;
  }
  return false;
}
exports.postVideo = async (req, res) => {
  const cloudinaryVideo = require("cloudinary").v2;
  cloudinaryVideo.config({
    cloud_name: "workshake-video-trial",
    api_key: "436795657912165",
    api_secret: "txbBMuRIGHQbmTYulTp7lXhHecA",
  });
  console.log(req.file);
  // console.log(req.body);
  let file = req.file;
  let path = file.destination + file.filename;
  let promiseScreenshots = await makeScreenshots(path);
  console.log(promiseScreenshots);
  console.log("Path:", path);
  let finalArray = await checkVideo(path);
  let result = false;
  console.log(result);
  if (!result) {
    cloudinaryVideo.uploader.upload(
      path,
      {
        resource_type: "video",
        chunk_size: 6000000,
      },
      (err, result) => {
        if (err) {
          console.log("error:", err);
          return res.status(400).json({ err });
        }
        console.log("result:", result);
        fs.unlink(path, function (err) {
          if (err && err.code == "ENOENT") {
            // file doens't exist
            console.info("File doesn't exist, won't remove it.");
          } else if (err) {
            // other errors, e.g. maybe we don't have enough permission
            console.error("Error occurred while trying to remove file");
          } else {
            console.info(`removed`);
          }
        });
        return res.status(200).json({ result });
      }
    );
  } else {
    console.log("Video path:", path);
    fs.unlink(path, function (err) {
      if (err && err.code == "ENOENT") {
        // file doens't exist
        console.info("File doesn't exist, won't remove it.");
      } else if (err) {
        // other errors, e.g. maybe we don't have enough permission
        console.error("Error occurred while trying to remove file");
      } else {
        console.info(`removed`);
      }
    });
    return res
      .status(200)
      .json({ error: "Inappropriate Content", obj: finalArray });
  }
};
exports.videoPostMongo = (req, res) => {
  // console.log(req.body);
  const { video, title, tags, project } = req.body;
  let user = req.profile;
  if (!video) {
    return res
      .status(403)
      .json({ error: "add suitable video to add to server" });
  }
  const post =
    project !== undefined
      ? new Post({
          video: video,
          postedBy: user._id,
          title: title,
          tags: tags,
          project,
          postType: "video",
        })
      : new Post({
          video: video,
          postedBy: user._id,
          title: title,
          tags: tags,
          postType: "video",
        });
  post
    .save()
    .then((result) => {
      res.status(200).json({ post: result });
    })
    .catch((err) => {
      console.log(err);
      res.status(402).json({ error: "could not save" });
    });
};
exports.createPost = (req, res) => {
  const { pic, title, tags, project } = req.body;
  let user = req.profile;
  if (!pic) {
    return res
      .status(403)
      .json({ error: "add suitable photo to add to server" });
  }
  console.log(project);

  const post =
    project !== undefined
      ? new Post({
          photo: pic,
          postedBy: user._id,
          title: title,
          tags: tags,
          project,
          postType: "image",
        })
      : new Post({
          photo: pic,
          postedBy: user._id,
          title: title,
          tags: tags,
          postType: "image",
        });
  // console.log(project);
  post.created = Date.now();
  post
    .save()
    .then((result) => {
      res.status(200).json({ post: result });
    })
    .catch((err) => {
      console.log(err);
      res.status(402).json({ error: "could not save" });
    });
};

exports.postsByUser = (req, res) => {
  Post.find({ postedBy: req.profile._id })
    .populate("postedBy", "_id name")
    .sort("_created")
    .exec((err, posts) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      res.json(posts);
    });
};

exports.isPoster = (req, res, next) => {
  let isPoster = req.post && req.auth && req.post.postedBy._id == req.auth._id;
  // console.log("req.post: ", req.post);
  // console.log("req.auth: ", req.auth);
  // console.log("req.post.postedBy._id: ", req.post.postedBy._id);
  console.log("req.auth.id: ", req.auth.id);
  if (!isPoster) {
    return res.status(403).json({
      error: "User is not authorized!",
    });
  }
  next();
};

exports.updatePost = (req, res, next) => {
  let post = req.post;
  post = _.extend(post, req.body);
  post.updated = Date.now();
  post.save((err) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.json(post);
  });
};

exports.deletePost = (req, res) => {
  let post = req.post;
  let type = post.postType;
  console.log(post);
  let cloudinary_id = "";
  if (type === "image") {
    const cloudinary = require("cloudinary").v2;
    cloudinary.config({
      cloud_name: "workshaketrial",
      api_key: "141328859214936",
      api_secret: "ped5_kvwuwzIV2YJxxkFkDKmKHw",
    });

    let photo_url = post.photo;
    photo_url.map((url) => {
      url = url.split("/");
      let str = url[url.length - 1];
      str = str.split(".")[0];
      cloudinary_id = str.toString();
      console.log(cloudinary_id);
      cloudinary.uploader.destroy(cloudinary_id, function (error, result) {
        console.log(result, error);
      });
    });
  }
  if (type === "video") {
    const cloudinaryVideo = require("cloudinary").v2;
    cloudinaryVideo.config({
      cloud_name: "workshake-video-trial",
      api_key: "436795657912165",
      api_secret: "txbBMuRIGHQbmTYulTp7lXhHecA",
    });

    let url = post.video;
    url = url.split("/");
    let str = url[url.length - 1];
    str = str.split(".")[0];
    cloudinary_id = str.toString();
    console.log(cloudinary_id);
    cloudinaryVideo.uploader.destroy(
      cloudinary_id,
      { resource_type: "video" },
      function (error, result) {
        console.log(result, error);
      }
    );
  }
  post.remove((err, post) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.json({
      message: "Post deleted successfully",
    });
  });
};

exports.convertToWebp = (req, res) => {
  const cloudinary = require("cloudinary").v2;
  cloudinary.config({
    cloud_name: "workshaketrial",
    api_key: "141328859214936",
    api_secret: "ped5_kvwuwzIV2YJxxkFkDKmKHw",
  });
  console.log("file: ", req.file);
  // upload(req, res, (err) => {
  //   console.log("Request ---", req.body);
  //   console.log("Request file ---", req.file); //Here you get file.
  //   /*Now do where ever you want to do*/
  //   // if (!err) return res.send(200).end();
  // });
  let file = req.file;
  // console.log(req.file);
  console.log("path:", file.destination + file.filename);
  sharp(file.destination + file.filename)
    .resize(1280, 720)
    .webp()
    .toFile(
      file.destination + file.filename + " edited.webp",
      async (err, info) => {
        if (err) console.log(err);
        else {
          console.log(info);
          let obj = { violence: 80, nudity: 80 };
          console.log(obj);
          if (obj.nudity >= 90 || obj.violence >= 90) {
            fs.unlink(
              file.destination + file.filename + " edited.webp",
              function (err) {
                if (err && err.code == "ENOENT") {
                  // file doens't exist
                  console.info("File doesn't exist, won't remove it.");
                } else if (err) {
                  // other errors, e.g. maybe we don't have enough permission
                  console.error("Error occurred while trying to remove file");
                } else {
                  console.info(`removed`);
                }
              }
            );
            fs.unlink(file.destination + file.filename, function (err) {
              if (err && err.code == "ENOENT") {
                // file doens't exist
                console.info("File doesn't exist, won't remove it.");
              } else if (err) {
                // other errors, e.g. maybe we don't have enough permission
                console.error("Error occurred while trying to remove file");
              } else {
                console.info(`removed`);
              }
            });
            return res
              .status(200)
              .json({ message: "Inappropriate Content", values: obj });
          } else {
            cloudinary.uploader.upload(
              file.destination + file.filename + " edited.webp",
              (err, result) => {
                if (err) {
                  console.log("error:", err);
                  return res.status(400).json({ err });
                }
                console.log("result:", result);
                fs.unlink(
                  file.destination + file.filename + " edited.webp",
                  function (err) {
                    if (err && err.code == "ENOENT") {
                      // file doens't exist
                      console.info("File doesn't exist, won't remove it.");
                    } else if (err) {
                      // other errors, e.g. maybe we don't have enough permission
                      console.error(
                        "Error occurred while trying to remove file"
                      );
                    } else {
                      console.info(`removed`);
                    }
                  }
                );
                fs.unlink(file.destination + file.filename, function (err) {
                  if (err && err.code == "ENOENT") {
                    // file doens't exist
                    console.info("File doesn't exist, won't remove it.");
                  } else if (err) {
                    // other errors, e.g. maybe we don't have enough permission
                    console.error("Error occurred while trying to remove file");
                  } else {
                    console.info(`removed`);
                  }
                });

                return res.status(200).json({ result });
              }
            );
            fs.unlink(file.destination + file.filename);
            fs.unlink(file.destination + file.filename + " edited.webp");
          }
        }
      }
    );

  // console.log(req.body.title);
  // console.log(req.body.tags);
  // let data = req.body.baseData;
  // console.log("base64data:", req.body);
  // const data = req.body.data;
  // // console.log("data:", data);
  // let type = data.match(/[^:/]\w+(?=;|,)/)[0];
  // // console.log("type:", type);
  // var imageBuffer = decodeBase64Image(data);
  // // console.log(imageBuffer);
  // let name = Date.now();

  // sharp(imageBuffer.data)
  //   .resize(500, 500)
  //   .toFile(`./uploads/${name}.webp`, (err, info) => {
  //     if (err) console.log(err);
  //     else {
  //       console.log(info);
  //       // fs.readFile(`./uploads/${name}.webp`, (err, data) => {
  //       //   console.log(data);
  //       // });
  // cloudinary.uploader.upload(`./uploads/${name}.webp`, (err, result) => {
  //   if (err) {
  //     console.log("error:", err);
  //     return res.status(400).json({ err });
  //   }
  //   console.log("result:", result);
  //   return res.status(200).json({ result });
  // });
  //     }
  //   });
};
// let buf = Buffer.from(data);
// let dataBase64 = Buffer.from(buf).toString("base64");
// base64str of image
// base64str image type jpg,png ...
//option: options and quality,it should be given between 0 to 100
// console.log(__dirname);
// fs.writeFile("../temp/", "tempFile." + type, () => {
//   console.log("created at", __dirname, __filename);
// });
// let result = webp.str2webpstr(dataBase64, type, "-q 80");
// result.then(function (result) {
//   // you access the value from the promise here
//   console.log(result);
// });
// console.log(result);
// return res.status(200).json({ msg: "done" });

exports.likePost = (req, res) => {
  Post.findById(req.body.postId).exec((err, post) => {
    if (err || !post) {
      return res.status(400).json({
        error: err,
      });
    }
    post.liked_by.push(req.body.userId);
    post.save();
    res.status(200).json({ message: "Post liked" });
  });
};

exports.dislikePost = (req, res) => {
  Post.findById(req.body.postId).exec((err, post) => {
    if (err || !post) {
      return res.status(400).json({
        error: err,
      });
    }
    post.liked_by.pull(req.body.userId);
    post.save();
    res.status(200).json({ message: "Post Disliked" });
  });
};

exports.addcomment = (req, res) => {
  Post.findById(req.body.postId).exec((err, post) => {
    if (err || !post) {
      return res.status(400).json({
        error: err,
      });
    }
    let comment = {
      comment: req.body.comment,
      userId: req.body.userId,
      userName: req.body.userName,
    };
    post.comments.push(comment);
    post.save();
    res.status(200).json({ message: "New Comment posted" });
  });
};

exports.getPost = (req, res) => {
  Post.findById(req.post._id)
    .populate("postedBy", "_id name")
    .then((post) => {
      res.json({ post });
    })
    .catch((err) => console.log(err));
};

exports.createTextPost = (req, res) => {
  console.log(req.body.text);
  let user = req.profile;
  const post = new Post({
    title: req.body.text,
    postType: "text",
    postedBy: user._id,
  });
  post
    .save()
    .then((result) => {
      res.status(200).json({ post: result });
    })
    .catch((err) => {
      console.log(err);
      res.status(402).json({ error: "could not save" });
    });
};
exports.createYoutubePost = (req, res) => {
  console.log(req.body);
  let user = req.profile;

  const post = new Post({
    video: req.body.videolink,
    title: req.body.title,
    postType: "youtubeVideo",
    metadataTitle: req.body.metadataTitle,
    metadataAuthor: req.body.metadataAuthor,
    postedBy: user._id,
  });
  post
    .save()
    .then((result) => {
      res.status(200).json({ post: result });
    })
    .catch((err) => {
      console.log(err);
      res.status(402).json({ error: "could not save" });
    });
};

exports.getLikesOfPost = (req, res) => {
  // console.log(req.post.liked_by);
  // console.log(req.post.liked_by);
  if (req.post) {
    return res.status(200).json({ liked_by: req.post.liked_by });
  }
  return res.status(400).json({ error: "not found" });
};
exports.getCommentsOfPost = (req, res) => {
  // console.log(req.post.liked_by);
  if (req.post) {
    return res.status(200).json({ comments: req.post.comments });
  }
  return res.status(400).json({ error: "not found" });
};

exports.editPost = (req, res) => {
  console.log(req.body);
  Post.findById(req.body.postId).exec((err, post) => {
    if (err || !post) {
      return res.status(400).json({
        error: err,
      });
    }
    post.title = req.body.title;
    post.save();
    res.status(200).json({ message: "Post updated" });
  });
};

exports.deleteComment = (req, res) => {
  Post.findById(req.body.postId).exec((err, post) => {
    if (err || !post) {
      return res.status(400).json({
        error: err,
      });
    }
    post.comments.pull(req.body.commentId);
    post.save();
    res.status(200).json({ message: "Comment Deleted" });
  });
};
makeScreenshots = async (filePath) => {
  try {
    console.log(filePath);
    let promise = await ffmpeg(filePath).screenshots({
      timestamps: ["20%", "40%", "60%", "80%", "99%"],
      filename: "thumbnail-at-%s-seconds.png",
      folder: "./videoScreenshots/",
      size: "224x224",
    });
    console.log(promise);
  } catch (e) {
    console.log(e);
  }
};
checkImage = async (path) => {
  console.log(path);
  let violence = await checkViolence(path);
  let nudity = await checkNudity(path);
  let obj = { violence, nudity };
  // console.log(obj);
  return obj;
};

filereader = async (files) => {
  let finalVal = [];
  return Promise.all(
    await files.map(async (pathFile) => {
      let newFolderPath = path.join(__dirname, "../videoScreenshots", pathFile);
      console.log(newFolderPath);
      let val = await checkImage(newFolderPath);
      console.log(val);
      await finalVal.push(val);
      return finalVal;
    })
  ).then((data) => {
    return data[data.length - 1];
  });
};

function getFilesFromDirectoryAsync(path, callback) {
  return new Promise(async function (resolve, reject) {
    await fs.readdir(path, function (err, content) {
      if (err) return reject(callback(err));
      resolve(callback(null, content));
    });
  });
}

checkVideo = async (filePath) => {
  let folderpath = path.join(__dirname, "../videoScreenshots");
  return await getFilesFromDirectoryAsync(folderpath, async (err, files) => {
    if (err) {
      console.log(err);
      // return;
    }
    let finalVal = [];
    finalVal = await filereader(files);
    console.log("final checked vals :", finalVal);
    return finalVal;
  });
  // console.log("result:", result);
};

processData = async (data, model, tfn) => {
  return 0;
};

checkViolence = async (path) => {
  // const tf = require("@tensorflow/tfjs");
  // const tfn = require("@tensorflow/tfjs-node");
  // const handler = tfn.io.fileSystem("./model2/model.json");
  // const model = await tf.loadLayersModel(handler);

  // return sharp(path)
  //   .resize({ height: 224, width: 224 })
  //   .jpeg()
  //   .toBuffer()
  //   .then(async (data) => {
  //     // console.log(data);
  //     let v = await processData(data, model, tfn);
  //     // let obj = { violence: v };
  //     return v * 100;
  //   });
  return 0;
};

checkNudity = async (path) => {
  // const tf = require("@tensorflow/tfjs");
  // const tfn = require("@tensorflow/tfjs-node");
  // const handler = tfn.io.fileSystem("./model1/model.json");
  // const model = await tf.loadLayersModel(handler);

  // return sharp(path)
  //   .resize({ height: 224, width: 224 })
  //   .jpeg()
  //   .toBuffer()
  //   .then(async (data) => {
  //     // console.log(data);
  //     let v = await processData(data, model, tfn);
  //     // console.log(v);
  //     // let obj = { nudity: v };
  //     return v * 100;
  //   });
  return 0;
};
