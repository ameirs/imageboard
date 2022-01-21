const express = require("express");
const app = express();
const s3 = require("./s3");
const db = require("./db.js");
app.use(express.static("./public"));
app.use(express.json());
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const { Console } = require("console");
const { send } = require("process");
const moment = require("moment");

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function (uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    },
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152,
    },
});

app.get("/images.json", (req, res) => {
    db.getImages().then((data) => {
        data.rows.forEach( elem => {
        elem.moment = moment(new Date(elem.created_at)).fromNow();     
        });
        res.json(data.rows);
    });
});

app.get("/moreImages/:lastId", (req, res) => {
    let lastId = req.params.lastId;
    console.log("last id in server.js: ", lastId);
    db.getMoreImages(lastId).then((data) => {
        console.log("result of get more images: ", data);
        res.json(data.rows);
    });
});

app.post("/upload", uploader.single("file"), s3.upload, function (req, res) {
    if (req.file) {
        const { username, title, description } = req.body;
        const url = "https://s3.amazonaws.com/spicedling/".concat(
            req.file.filename
        );
        db.insertImage({ username, title, description, url })
            .then((data) => {
                data.rows[0].moment = moment(
                    new Date(data.rows[0].created_at)
                ).fromNow();
                res.json(data.rows[0]);
            })
            .catch((err) => console.log("error in insertImage: ", err));
    } else {
        res.sendStatus(500);
    }
});

app.get("/image-overlay/:id", (req, res) => {
    const id = req.params.id;
    db.getImageById(id)
        .then((data) => {
            console.log("data: ", data);
            res.json(data.rows[0]);
        })
        .catch((err) => {
            console.log("err in image overlay: ", err);
        });
});

app.post("/comment.json", (req, res) => {
    const { username, commentText, imageId } = req.body;
    db.insertComment({ username, commentText, imageId })
        .then((data) => {
            data.rows[0].moment = moment(
                new Date(data.rows[0].created_at)
            ).fromNow();
            res.json(data.rows[0]);
        })
        .catch((err) => console.log("error in insertImage: ", err));
});

app.get("/comments/:imageId.json", (req, res) => {
    db.getCommentsByImageId(req.params.imageId)
        .then((data) => {
             data.rows.forEach((elem) => {
                 elem.moment = moment(new Date(elem.created_at)).fromNow();
             });
            res.json(data.rows);
        })
        .catch((err) => {
            console.log("err in image overlay: ", err);
        });
});

app.get("/deleteImage/:id", (req, res) => {
    db.deleteImage(req.params.id)
        .then((data) => {
            res.json(data.rows);
        })
        .catch((err) => {
            console.log("err in image overlay: ", err);
        });
});

app.get("*", (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});

app.listen(8080, () => console.log(`I'm listening.`));
