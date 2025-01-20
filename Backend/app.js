
// Global Module
const express = require("express");
const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser");

// connectdb
const connectDB = require("../DB/db");
connectDB();

const userRouter = require("../routes/user.route");
const categoryRouter = require("../routes/category.route");
// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//userRoutes and categoryRoutes.
app.use("/api/users", userRouter);
app.use("/api/category", categoryRouter);

//  server port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server is Running !:)");
});
