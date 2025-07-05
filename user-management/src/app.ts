import express, { json, urlencoded } from "express";
import cookieParser from "cookie-parser";
import { router } from "./routes/user.js";

const port = parseInt(process.env.PORT || "3001");
const app = express()

app.use(urlencoded({extended: true}));
app.use(json());
app.use(cookieParser());

app.use(router);

app.listen(port, () => {
    console.log("User management service running");
})