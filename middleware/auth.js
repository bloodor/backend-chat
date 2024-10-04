import TokenBlacklist from '../models/TokenBlacklist.js';
import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).send('Unauthorized');
    }
    try {
      const isBlacklisted = await TokenBlacklist.findOne({token});
      if (isBlacklisted) {
        return res.status(401).send('Unauthorized');
      }
      req.user = jwt.decode(token, process.env.STREAM_API_SECRET);
      next();
    } catch (error) {
        res.status(400).send('Invalid token');
    }
};

export default authMiddleware;