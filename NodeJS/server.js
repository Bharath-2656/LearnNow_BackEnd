const mongoose = require("mongoose");
const dotenv = require("dotenv").config();


mongoose.connect('mongodb+srv://root:bh1232656@cluster0.wmhzb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});