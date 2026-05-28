const ImageKit = require('imagekit');
const fs = require('fs');

// Initialize ImageKit with your credentials
const imagekit = new ImageKit({
  publicKey: "public_syA5d0JC/l/EB96LYVu6uKjXQL4=",
  privateKey: "private_DxBzzP+M8oit8lCgT6RoNCnPGTo=",
  urlEndpoint: "https://ik.imagekit.io/shanni280104/",
});

// Read a test image file (replace with the path to an actual image file on your system)
const fileBuffer = fs.readFileSync('path/to/test-image.jpg');

// Upload the file to ImageKit
imagekit.upload(
  {
    file: fileBuffer,
    fileName: "test-image.jpg",
    folder: "/kyc_documents",
  },
  (error, result) => {
    if (error) {
      console.error("ImageKit upload error:", error);
    } else {
      console.log("ImageKit upload success:", result);
      console.log("Uploaded file URL:", result.url);
    }
  }
);