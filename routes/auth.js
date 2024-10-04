import express from 'express';
import User from '../models/User.js';
import TokenBlacklist from '../models/TokenBlacklist.js';
import jwt from 'jsonwebtoken';
import authMiddleware from "../middleware/auth.js";
import { StreamChat } from 'stream-chat';
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const serverClient = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET);

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = new User({ username, password });
    await user.save();
    const streamToken = serverClient.createToken(user._id.toString());
    console.log("STREAM TOKEN: " + streamToken);
    res.json({ streamToken });
  } catch (error) {
    console.log(error);
    res.status(400).send('Error registering user');
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).send('Invalid credentials');
    }
    const streamToken = serverClient.createToken(user._id.toString());
    console.log("STREAM TOKEN: " + streamToken);
    res.json({ streamToken });
  } catch (error) {
    console.log(error);
    res.status(400).send('Error logging in');
  }
});

// Delete
router.delete('/delete', async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).send('Username is required');
  }
  try {
    const user = await User.findOneAndDelete({ username });
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.status(200).send('User deleted');
  } catch (error) {
    res.status(500).send('Error deleting user');
  }
});

router.post('/logout', authMiddleware, async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const tokenBlacklist = new TokenBlacklist({ token, expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) });
    await tokenBlacklist.save();
    res.status(200).send('User logged out');
  } catch (error) {
    res.status(500).send('Error logging out user');
  }
});

export default router;