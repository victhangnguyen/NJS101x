import dotenv from 'dotenv';
dotenv.config();

const MONGO_USERNAME = process.env.MONGO_USERNAME || '';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || '';
const MONGO_DATABASE = process.env.MONGO_DATABASE || '';
// mongodb+srv://njs101x:<password>@cluster0.tf0txmk.mongodb.net/?retryWrites=true&w=majority
// const MONGO_URL = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.tf0txmk.mongodb.net/${MONGO_DATABASE}?retryWrites=true&w=majority`;
const MONGO_URL = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.tf0txmk.mongodb.net/${MONGO_DATABASE}`;
const PORT = process.env.PORT
  ? Number(process.env.PORT)
  : 1337;

export const config = {
  mongo: {
    username: MONGO_USERNAME,
    password: MONGO_PASSWORD,
    url: MONGO_URL,
  },
  server: {
    port: PORT,
  },
};
