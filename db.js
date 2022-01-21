const spicedPg = require("spiced-pg");
const dbUsername = "postgres";
const dbUserPassword = "postgres";
const database = "imageboard";

const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:${dbUsername}:${dbUserPassword}@localhost:5432/${database}`
);

console.log("[db] Connecting to:", database);

module.exports.getImages = () => {
    const q = `SELECT * FROM images
                ORDER BY id DESC
                LIMIT 9;`;
    // const params = [user_id];
    return db.query(q);
};  

exports.getMoreImages = (lastId) => {
    const q = `SELECT * FROM images
        WHERE id < $1
        ORDER BY id DESC
        LIMIT 9`;
    const params = [lastId];
    return db.query(q, params);
}
        
module.exports.insertImage = ({ username, title, description, url }) => {
    const q = `INSERT INTO images (username, title, description, url)
                VALUES($1, $2, $3, $4)
                RETURNING *`;
    const params = [username, title, description, url];
    return db.query(q, params);
};

module.exports.getImageById = (id) => {
    const q = `SELECT url, username, title, description, created_at, 
                    (SELECT MAX(id) FROM images
                    WHERE id < $1
                    LIMIT 1) AS "prevId",
                    (SELECT MIN(id) FROM images
                    WHERE id > $1
                    ) AS "nextId"
                FROM images
                WHERE id = $1`;
    const params = [id];
    return db.query(q, params);
};

// module.exports.getImageById = (id) => {
//     const q = `SELECT * FROM images
//                 WHERE id = $1`;
//     const params = [id];
//     return db.query(q, params);
// };

module.exports.deleteImage = (id) => {
    const q = `DELETE FROM images
                WHERE id = $1`;
    const params = [id];
    return db.query(q, params);
};




module.exports.insertComment = ({ username, commentText, imageId }) => {
    const q = `INSERT INTO comments (username, comment_text, image_id)
                VALUES($1, $2, $3)
                RETURNING *`;
    const params = [username, commentText, imageId];
    return db.query(q, params);
};

module.exports.getCommentsByImageId = (imageId) => {
    const q = `SELECT * FROM comments
                WHERE image_id = $1
                ORDER BY id DESC`;
    const params = [imageId];
    return db.query(q, params);
};

