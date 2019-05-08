const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.json());

const uri = `mongodb+srv://submissions-58x6r.azure.mongodb.net/${
  process.env.MONGO_DB
}?retryWrites=true`;

mongoose.connect(uri, {
  auth: {
    user: process.env.MONGO_USER,
    password: process.env.MONGO_PW
  },
  useNewUrlParser: true
});
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  console.log("*****************");
  console.log("Connected to db!");
  console.log("*****************");
});

//the server object listens on port 8080
const schema = require("./graphql/schema");
const root = require("./graphql/resolvers");
// mongoose.Promise = global.Promise

app.get("/", (req, res) => {
  res.send("hello sir!");
});

app.use(
  "/graphql",
  graphqlHttp({
    schema: schema,
    rootValue: root,
    graphiql: true
  })
);

const port = process.env.PORT || 8080;
app.listen(port);
