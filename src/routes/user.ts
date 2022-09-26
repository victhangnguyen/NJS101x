import express from 'express';

const router = express.Router();

router.get('/', (req, res, next) =>  {
  console.log('Hello World')
})

export default router;