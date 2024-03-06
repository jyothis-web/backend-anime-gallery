const slugify = require("slugify");
const movieModel = require("../models/movieModel");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

//for creating products
const createmovieController = async (req, res) => {
  try {
    const {
      name,
      year,
      movieTime,
      movieGenres,
      categories,
      rating,
      description,
      trailer
    } = req.body;
    const imageFiles = req.files["image"];
    // const imageFile = req.files['image'] ? req.files['image'][0] : null;
    const videoFile = req.files["video"] ? req.files["video"][0] : null;

    console.log(req.body);
    console.log(req.files);

    const existingMovie = await movieModel.findOne({ name });
    if (existingMovie) {
      return res
        .status(401)
        .json({ success: false, message: "Movie already exists" });
    }

    // let image = null;

    // if (imageFile) {
    //   // Save the image file details
    //   image = {
    //     data: imageFile.buffer,
    //     contentType: imageFile.mimetype,
    //     imagePath: `uploads/${imageFile.filename}`,
    //   };
    // }

    // Check if imageFiles exist before mapping
    const image = imageFiles.map((file) => ({
      data: file.buffer,
      contentType: file.mimetype,
      imagePath: `uploads/${file.filename}`,
    }));

    console.log(image);

    const movieData = {
      name,
      slug: slugify(name),
      description,
      year,
      movieTime,
      movieGenres,
      categories,
      rating,
      image,
      trailer
    };

    // Check if videoFile is present before accessing 'buffer'
    if (videoFile) {
      movieData.video = {
        data: videoFile.buffer,
        contentType: videoFile.mimetype,
        videoPath: `uploads/${videoFile.filename}`,
      };
    }

    const movie = new movieModel(movieData);

    // Save the movie to the database
    await movie.save();

    return res.status(201).json({
      success: true,
      message: "New Movie created successfully",
      movie,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in creating Movie",
      error,
    });
  }
};

const updateMovieController = async (req, res) => {
  try {
    const {
      id,
      name,
      year,
      movieTime,
      movieGenres,
      categories,
      rating,
      description,
      trailer,
    } = req.body;

    const imageFiles = req.files["image"];
    const videoFile = req.files["video"];

    console.log("movie id:", id);
    console.log("Image Files:", imageFiles);

    // Check if the ID is provided
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID not provided",
      });
    }

    // Find the product in the database
    const existingMovie = await movieModel.findById(id);

    // Check if the product with the given ID exists
    if (!existingMovie) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let image = [];

    try {
      // Check if a new image is provided
      if (imageFiles) {
        // Create a new object for the image field
        image = imageFiles.map((file) => ({
          data: file.buffer,
          contentType: file.mimetype,
          imagePath: `uploads/${file.filename}`,
        }));
        console.log("Updated Image:", image);
      }
    } catch (readError) {
      console.error("Error reading or saving new image:", readError.message);
      return res.status(500).json({
        success: false,
        message: "Error while updating product image",
        error: readError.message,
      });
    }

    // Update product fields
    existingMovie.name = name || existingMovie.name;
    existingMovie.description = description || existingMovie.description;
    existingMovie.slug = slugify(existingMovie.name);
    existingMovie.year = year || existingMovie.year;
    existingMovie.categories = categories || existingMovie.categories;
    existingMovie.rating = rating || existingMovie.rating;
    existingMovie.movieTime = movieTime || existingMovie.movieTime;
    existingMovie.movieGenres = movieGenres || existingMovie.movieGenres;
    existingMovie.trailer = trailer || existingMovie.trailer;

    // Update image if provided
    if (image.length > 0) {
      existingMovie.image = image;
    }

    // Update video if provided
    if (videoFile && videoFile[0]) {
      const video = {
        data: videoFile[0].buffer,
        contentType: videoFile[0].mimetype,
        videoPath: `uploads/${videoFile[0].filename}`,
      };
      existingMovie.video = video;
    }

    // Save the updated product to the database
    await existingMovie.save();

    // Include the image information in the response
    return res.status(200).json({
      success: true,
      message: "Movie updated successfully",
      existingMovie,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error while updating movie",
      error,
    });
  }
};


//for updating products
// const updateMovieController = async (req, res) => {
//   // let newImage;
//   try {
//     const {
//       name,
//       year,
//       movieTime,
//       movieGenres,
//       categories,
//       rating,
//       description,
//       trailer
//     } = req.body;
//     const imageFiles = req.files["image"];
//     // const imageFile = req.files['image'] ? req.files['image'][0] : null;
//     const videoFile = req.files["video"] ? req.files["video"][0] : null;

//     console.log("Payload:", req.body);
//     console.log("Image File:", files);

//     // Check if the ID is provided
//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "Product ID not provided",
//       });
//     }

//     // Find the product in the database
//     const existingMovie = await movieModel.findById(id);

//     // Check if the product with the given ID exists
//     if (!existingMovie) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     let image = [];

//     try {
//       // Check if a new image is provided
//       if (files) {
//         // Create a new object for the image field
//         image = imageFiles.map((file) => ({
//           data: file.buffer,
//           contentType: file.mimetype,
//           imagePath: `uploads/${file.filename}`,
//         }));
//         console.log("updated image", image);
//       }
//     } catch (readError) {
//       console.error("Error reading or saving new image:", readError.message);
//       return res.status(500).json({
//         success: false,
//         message: "Error while updating product image",
//         error: readError.message,
//       });
//     }

//     // Update product fields
//     existingMovie.name = name || existingMovie.name;
//     existingMovie.description = description || existingMovie.description;
//     existingMovie.slug = slugify(existingMovie.name);
//     existingMovie.year = year || existingMovie.year;
//     existingMovie.categories = categories || existingMovie.categories;
//     existingMovie.rating = rating || existingMovie.rating;
//     existingMovie.movieTime = movieTime || existingMovie.movieTime;
//     existingMovie.movieGenres = movieGenres || existingMovie.movieGenres;
//     existingMovie. trailer =  trailer || existingMovie. trailer;

//     if (image.length > 0) {
//       existingMovie.image = image;
//     }

//     // Update video if provided
//     if (videoFile) {
//       existingMovie.video = {
//         data: videoFile.buffer,
//         contentType: videoFile.mimetype,
//         videoPath: `uploads/${videoFile.filename}`,
//       };
//     }
//     // Save the updated product to the database
//     await existingMovie.save();

//     // Include the image information in the response
//     return res.status(200).json({
//       success: true,
//       message: "movie updated successfully",
//       existingMovie,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: "Error while updating product",
//       error,
//     });
//   }
// };

//for get all products
const getMovieController = async (req, res) => {
  try {
    const movies = await movieModel.find({}).populate("categories");

    // Send JSON response with products
    return res.status(200).json({
      success: true,
      message: "product list fetched successfully",
      movies,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error while getting all products",
    });
  }
};

//for get single product
const singleMovieController = async (req, res) => {
  try {
    const { id } = req.params;
    // Validate if the ID is provided
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "movie ID not provided",
      });
    }
    // Fetch the single category from the database by ID
    const movie = await movieModel.findById(id).populate("categories");
    return res.status(200).json({
      success: true,
      // imageName: movie.image,
      message: "Single movie fetched successfully",
      movie,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error while getting all products",
    });
  }
};

//for geting products based on category
const getMovieByCategoryController = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Fetch products based on category ID
    const movies = await movieModel
      .find({ categories: { $in: categoryId } })
      .populate("categories");
    return res.status(200).json({
      success: true,
      message: "movies fetched successfully based on category",
      movies,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error while getting products by category",
      error,
    });
  }
};

//for delete the products
const deleteMovieController = async (req, res) => {
  try {
    const { id } = req.params;
    // Validate if the ID is provided
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID not provided",
      });
    }

    // Find and remove the product from the database
    const deletedProduct = await movieModel.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error while deleting product",
      error,
    });
  }
};
//image
const imageproductController = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if the ID is provided
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID not provided",
      });
    }

    // Fetch the product from the database by ID
    const product = await movieModel.findById(id).select("image");

    if (!product || !product.image) {
      return res.status(404).json({
        success: false,
        message: "Product not found or no image available",
      });
    }
    res.set("Content-Type", product.image.contentType);

    // Send the base64-encoded image data as the response body
    return res.status(200).send(base64Image);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error while fetching product image",
      error,
    });
  }
};
//for filter the product
const filterproductController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await movieModel.find(args);
    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error while filtering products",
      error,
    });
  }
};

const searchMovieController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const result = await movieModel.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { slug: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { movieGenres: { $regex: keyword, $options: "i" } },
      ],
    });
    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error while searching products:", error);

    return res.status(500).json({
      success: false,
      message: "Error while searching products",
      error: error.message, // Log the error message
    });
  }
};

const searchMovieCategoryFilterController = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;;
console.log(categoryId);
    const filteredMovies = await movieModel.find({
      categories: { $in: [categoryId] },
    });

    return res.status(200).json({
      success: true,
      movies: filteredMovies,
    });
  } catch (error) {
    console.error("Error while filtering movies:", error);

    return res.status(500).json({
      success: false,
      message: "Error while filtering movies",
      error: error.message,
    });
  }
};

module.exports = {
  createmovieController,
  updateMovieController,
  singleMovieController,
  getMovieController,
  getMovieByCategoryController,
  deleteMovieController,
  imageproductController,
  filterproductController,
  searchMovieController,
  searchMovieCategoryFilterController ,
};

// const slugify = require('slugify');
// const movieModel = require('../models/movieModel');
// const fs = require('fs');

// const createproductController = async (req, res) => {
//   try {
//     const { name, price, category } = req.body;
//     const mainfile = req.file;
//     const additionalImageFile = req.file.additionalImage; // Assuming the field name is 'additionalImage'

//     if (!mainImageFile) {
//       return res.status(400).json({ message: 'Main photo is required' });
//     }

//     // Read the main image file data
//     const mainImageBuffer = fs.readFileSync(mainImageFile.path);

//     // Create a product document for the main image
//     const productData = {
//       name,
//       slug: slugify(name),
//       price,
//       category,
//       image: {
//         data: mainImageBuffer,
//         contentType: mainImageFile.mimetype,
//       },
//     };

//     // Check and handle the additional image
//     if (additionalImageFile) {
//       const additionalImageBuffer = fs.readFileSync(additionalImageFile[0].path);
//       productData.additionalImage = {
//         data: additionalImageBuffer,
//         contentType: additionalImageFile[0].mimetype,
//       };
//     }

//     const product = new movieModel(productData);

//     // Save the product to the database
//     await product.save();

//     // Remove the temporary files
//     fs.unlinkSync(mainImageFile.path);

//     if (additionalImageFile) {
//       fs.unlinkSync(additionalImageFile[0].path);
//     }

//     return res.status(201).json({
//       success: true,
//       message: 'New product created successfully',
//       product,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: 'Error in creating product',
//       error,
//     });
//   }
// };

// module.exports = { createproductController };
