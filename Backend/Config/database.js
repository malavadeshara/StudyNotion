const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
    mongoose.connect(process.env.MongoDB_URL)
    .then(() => { console.log("DB Connected Successfully.")})
    .catch((error) => {
        console.log("Error in connecting to DB: ", error);
        process.exit(1);
    })
}