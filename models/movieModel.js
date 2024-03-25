const mongoose = require("mongoose");
//const Category = require("./categoryModel");
const MovieSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    year: {
      type: String,
    },
    movieTime: {
      type: String,
      lowercase: true,
    },
    movieGenres: {
      type: String,
      lowercase: true,
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "categories",
      },
    ],
    image: [
      {
        data: Buffer,
        contentType: String,
        imagePath: String,
      },
    ],
    video: {
      data: Buffer,
      contentType: String,
      videoPath: String,
    },
    trailer: {
      type: String, // Store the rating as a number
     // Default value if not provided
    },
    rating: {
      type: Number, // Store the rating as a number
      default: 0, // Default value if not provided
    },
  },
  { timestamps: true }
);
const movieModel = mongoose.model("Movies", MovieSchema);

module.exports = movieModel;
