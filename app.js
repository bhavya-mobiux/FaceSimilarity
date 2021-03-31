const express = require("express");
const app = express();
const path = require("path");

const port = 3000;

app.use(express.static(path.join(__dirname, "./public")));
app.use(express.static(path.join(__dirname, "./public/models")));

app.get("/", (req, res) => {
  res.sendFile("./index.html", { root: __dirname });
});

app.listen(port, () => console.log(`listening on port ${port}!`));
