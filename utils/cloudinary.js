const cloudinary = require("cloudinary").v2;

const CLOUD_NAME = "dekx0bg21";
const API_KEY = "631149129556815";
const API_SECRET = "U37XGNL1GSFr5RiLapar0_0dfjo";

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
});

module.exports = cloudinary;
