import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { ERROR_MESSAGES } from '../utils/messages';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: ERROR_MESSAGES.AUTH.TOKEN_MISSING });

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: ERROR_MESSAGES.AUTH.INVALID_ACCESS_TOKEN });
  }
};
