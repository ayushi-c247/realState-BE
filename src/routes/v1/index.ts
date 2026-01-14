import express from "express";
import authRoute from "./auth.route";
import userRoute from "./user.route";
import propertyRoute from "./property.route";

const indexRoute = express.Router();

indexRoute.use("/auth", authRoute);
indexRoute.use("/user", userRoute);
indexRoute.use("/property", propertyRoute);

export default indexRoute;
