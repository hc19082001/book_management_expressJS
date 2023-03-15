const express = require("express");
const app = express();
const multer = require("multer");
const upload = multer();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multerFileToURIData = require("../utils/multerFileToURIData");
const cloudinary = require("../utils/cloudinary");
const Book = require("./Book");

app.use(bodyParser.json());

// Connect to MongoDB
mongoose
    .connect("mongodb+srv://ngcuong:ngcuong@cluster0.kqazbe0.mongodb.net/demo_management")
    .then(() => console.log("Connected to database"))
    .catch(() => console.log("Connect failed"));

// Add Access Control Allow Origin headers
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000/");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get("/", (req, res) => {
    Book.find({}).then((data, error) => {
        if (error) {
            res.status(400).json({ message: "Error" });
        } else {
            res.status(200).json(data);
        }
    });
});

app.get("/:id", async (req, res) => {
    try {
        const data = await Book.findById(req.params.id);
        res.status(200).json(data);
    } catch (error) {
        res.status(400).json({ message: "Not found this book id !" });
    }
});

app.post("/post", upload.single("image"), async (req, res) => {
    const imageMulter = req.file;
    try {
        const imageURI = multerFileToURIData(imageMulter);
        cloudinary.uploader
            .upload(imageURI, {
                public_id: imageMulter.filename,
                folder: "Book_Management",
            })
            .then(async (data) => {
                const book = new Book({
                    ...req.body,
                    image: data.url,
                    image_public_id: data.public_id,
                });
                try {
                    await book.save();
                    res.status(200).json(book);
                } catch (error) {
                    res.status(400).json({ error });
                }
            })
            .catch((error) => {
                res.status(400).json({ error });
            });
    } catch (error) {
        res.status(400).json({ error: "Please chooose at least a image file !" });
    }
});

app.put("/update/:id", upload.single("image"), async (req, res) => {
    const imageMulter = req.file;
    if (!imageMulter) {
        // Not include update image
        try {
            const result = await Book.findByIdAndUpdate(
                req.params.id,
                { name: req.body.name, price: req.body.price, discount: req.body.discount },
                { new: true },
            );
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error });
        }
    } else {
        // Include update image
        const imageURI = multerFileToURIData(imageMulter);
        // Find old document
        try {
            const oldBook = await Book.findById(req.params.id);
            // Delete old image in cloudinary
            try {
                await cloudinary.uploader.destroy(oldBook.image_public_id);
                // Upload new image to cloudinary and update new document
                const newImage = await cloudinary.uploader.upload(imageURI, {
                    public_id: imageMulter.filename,
                    folder: "Book_Management",
                });
                oldBook.image = newImage.url;
                oldBook.image_public_id = newImage.public_id;
                req.body.name ? (oldBook.name = req.body.name) : null;
                req.body.price ? (oldBook.price = req.body.price) : null;
                req.body.discount ? (oldBook.discount = req.body.discount) : null;
                const result = await oldBook.save();
                res.status(200).json(result);
            } catch (error) {
                res.status(400).json({ error: "Delete old image in cloudiary failed!" });
            }
        } catch (error) {
            res.status(400).json({ error: "Book ID not found!" });
        }
    }
});

app.delete("/delete/:id", async (req, res) => {
    // Find document
    try {
        const book = await Book.findById(req.params.id);
        // Delete image in cloudinary
        await cloudinary.uploader.destroy(book.image_public_id);
        // Delete document
        await book.deleteOne();
        res.status(200).json({ message: "Delete success!" });
    } catch (error) {
        res.status(400).json({ error: "Book ID not found!" });
    }
});

app.listen(3000, () => console.log(`Server is running on port is: http://localhost:${3000}/`));
