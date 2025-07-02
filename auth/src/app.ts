import express, { json, urlencoded } from "express";

const port = process.env.PORT || 8080;
const app = express();

app.use(urlencoded({extended: true}));
app.use(json());

app.get("/", (req, res) => {
    res.status(200).json({msg: "Auth up and running"});
})

app.listen(port, () => {
    console.log(`Auth service running`);
});