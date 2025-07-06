import express, { json, urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { router } from "./routes/attendance.js";

const port = process.env.PORT || 3002;
const app = express();

app.use(urlencoded({ extended: true }));
app.use(json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));

app.get("/", (req, res) => {
    res.status(200).json({ msg: "Attendance service up and running" });
});

app.use(router);

app.listen(port, () => {
    console.log(`Attendance service running on port ${port}`);
}); 