const readline = require("readline");
const fs = require("fs");
exports.getWords = (req, res) => {
  let words = [];
  try {
    const file = readline.createInterface({
      input: fs.createReadStream("./all_skills.txt"),
      output: process.stdout,
      terminal: false,
    });
    let count = 1;
    file
      .on("line", (line) => {
        words.push(line.toString());
        count++;
      })
      .on("close", () => {
        // console.log(words);
        res.status(200).json({ words });
      });
  } catch (e) {
    console.log("Error:", e.stack);
  }
};
