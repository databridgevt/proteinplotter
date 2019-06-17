//jshint esversion: 6
const express = require("express");
const bodyParser = require("body-parser");
const reuqest = require("request");

const app = express();
app.use(express.static("public"));
app.listen(process.env.PORT || 3000, function() {
  console.log("Server is running on port 3000");
});

app.get("/", function(req, res) {
  res.sendFile(__dirname+"/index.html");
});
