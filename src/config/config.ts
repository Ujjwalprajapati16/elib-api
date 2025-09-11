import { config as conf } from 'dotenv';
conf();

const _config = {
    port: process.env.PORT,
    mongo_uri: process.env.MONGO_URI as string,
    env: process.env.NODE_ENV,
}

export const config = Object.freeze(_config);