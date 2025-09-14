import { config as conf } from 'dotenv';
conf();

const _config = {
    port: process.env.PORT,
    mongo_uri: process.env.MONGO_URI as string,
    env: process.env.NODE_ENV,
    jwt_secret: process.env.JWT_SECRET as string,
    cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY as string,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET as string
}

export const config = Object.freeze(_config);