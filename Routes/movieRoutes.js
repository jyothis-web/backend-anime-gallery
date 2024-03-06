const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const movieController = require("../controllers/movieController");

const { requireSignin, loginAdmin } = require("../middlewares/authMiddleware");

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Validate the image file type if needed
    if (
      file.fieldname === "image" &&
      !file.originalname.match(/\.(jpg|jpeg|png|gif|webp|avif)$/)
    ) {
      return cb(new Error("Only image files are allowed!"), false);
    }

    //validate vedio file
    if (
      file.fieldname === "video" &&
      !file.originalname.match(/\.(mp4|avi|mkv)$/)
    ) {
      return cb(
        new Error("Only video files (mp4, avi, mkv) are allowed!"),
        false
      );
    }
    cb(null, true);
  },
});

// Route for create product
router.post(
  "/create-Movie",
  // requireSignin,
  // loginAdmin,
  upload.fields([
    { name: "image", maxCount: 3 },
    { name: "video", maxCount: 1 },
  ]),
  // upload.array('image', 1),
  movieController.createmovieController
);

//route for update category
router.put(
  "/update-Movie/:id",
  // requireSignin,
  // loginAdmin,
  upload.fields([
    { name: "image", maxCount: 3 },
    { name: "video", maxCount: 1 },
  ]),
  // (req, res, next) => {
  //   if (req.fileValidationError) {
  //     return res.status(400).json({
  //       success: false,
  //       message: req.fileValidationError,
  //     });
  //   }
  //   next();
  // },
  movieController.updateMovieController
);

//route for get all products
router.get(
  "/get-Movie",
  // requireSignin,
  // loginAdmin,
  movieController.getMovieController
);

//route for get sigle product by
router.get(
  "/get-singlemovie/:id",
  // requireSignin,
  // loginAdmin,
  movieController.singleMovieController
);
// //route for get single product by slug
// router.get(
//   '/get-singleproduct/:slug',
//   // requireSignin,
//   // loginAdmin,
//   movieController.singleproductController
// );

//get products based on category
router.get(
  "/get-movies-by-category/:categoryId",
  // requireSignin,
  // loginAdmin,
  movieController.getMovieByCategoryController
);

// Route for delete product
router.delete(
  "/delete-movie/:id",
  // requireSignin,
  // loginAdmin,
  movieController.deleteMovieController
);
// Route for delete product
router.get(
  "/image-product/:id",
  // requireSignin,
  // loginAdmin,
  movieController.imageproductController
);
// Route for filter product
router.post(
  "/filter-product",
  // requireSignin,
  // loginAdmin,
  movieController.filterproductController
);

//search product
router.get(
  "/searchMovie/:keyword",
  // requireSignin,
  // loginAdmin,
  movieController.searchMovieController
);
router.get(
  "/filter-movie-category/:categoryId",
  // requireSignin,
  // loginAdmin,
  movieController.searchMovieCategoryFilterController
);

module.exports = router;

// const express = require("express");
// const router = express.Router();
//  const productController = require("../controllers/productController");

// const {
//   requireSignin,
//   loginAdmin,
// } = require("../middlewares/authMiddleware");

// //route for create product
// router.post(
//     '/create-product',
//     // requireSignin,
//     // loginAdmin,
//     productController.upload.single('image'),
//     productController.createproductController
//   );

// module.exports = router;
