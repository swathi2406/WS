const express = require("express");
const { getWords } = require("../controllers/utils");
const bodyParser = require("body-parser");
const router = express.Router();
router.use(bodyParser.json());

router.get("/words", getWords);
module.exports = router;
