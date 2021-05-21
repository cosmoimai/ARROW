const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
// const MongoStore = require('connect-mongo')(session)
const connectDB = require("./config/db");
const chalk = require ('chalk');

const morganChalk = morgan(function (tokens, req, res) {
  return [
    chalk.hex('#90c8fc')('---> '),
    chalk.hex('#34ace0')(tokens.method(req, res)),
    chalk.hex('#647bff')(tokens.status(req, res)),
    chalk.hex('#906fec')(tokens.url(req, res)),
    chalk.hex('#e28ed7')(tokens['response-time'](req, res) + ' ms'),
    // chalk.hex('#2ed573')(res['content-length']),
    // chalk.hex('#f78fb3').bold('@ ' + tokens.date(req, res)),
    // chalk.yellow(tokens['remote-addr'](req, res)),
    // chalk.hex('#fffa65').bold('from ' + tokens.referrer(req, res)),
    // chalk.hex('#1e90ff')(tokens['user-agent'](req, res)),
    ].join(' ');
});

dotenv.config({ path: "./config/config.env" });


require("./config/passport")(passport);

connectDB();

const app = express();

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
  app.use(morganChalk)
  // app.use(morgan("dev"))
  // app.use(morgan('    :method :url :status :res[content-length] - :response-time ms'));
}

app.use(express.static("public"));

app.engine(".hbs", exphbs({ defaultLayout: "main", extname: ".hbs" }));
app.set("view engine", ".hbs");

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    // cookie: {
    //   maxAge: 6000000
    // }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/result", require("./routes/result"))
app.use("/user", require("./routes/user"))
app.use("/prescription", require("./routes/prescription"))

const PORT = process.env.PORT || 3000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on PORT ${PORT}`)
);

module.exports = app;