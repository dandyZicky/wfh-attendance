import express, { json, urlencoded } from "express";
import cookieParser from "cookie-parser";
import { router as userRouter } from "./routes/user.js";
import { router as departmentRouter } from "./routes/department.js";
import cors from "cors";

const port = parseInt(process.env.PORT || "3001");
const app = express()

app.use(urlencoded({extended: true}));
app.use(json());
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:3002",
    credentials: true,
}))

app.use(userRouter);
app.use(departmentRouter);

app.listen(port, () => {
    console.log("User management service running");
})