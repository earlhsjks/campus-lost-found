const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const { CLOUD_NAME, API_KEY, API_SECRET } = process.env;

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'lost_and_found_items',
        allowed_formats: ['jpg', 'jpeg', 'png', 'heic', 'heif'],
        transformation: [
            {
                width: 800,
                height: 800,
                crop: 'limit',
                quality: 'auto:good',
                fetch_format: 'auto',
                angle: 'auto',
                flags: 'strip_profile'
            }
        ]
    }
})

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };