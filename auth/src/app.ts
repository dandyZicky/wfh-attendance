import express, { json, urlencoded } from "express";
import { router } from "./routes/auth.js";

const port = process.env.PORT || 8080;
const app = express();

app.use(urlencoded({extended: true}));
app.use(json());

app.get("/", (req, res) => {
    res.status(200).json({msg: "Auth up and running"});
})

app.use(router);

app.listen(port, () => {
    console.log(`Auth service running`);
});