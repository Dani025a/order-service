import jwt from 'jsonwebtoken';

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, process.env.USER_JWT_SECRET!);
};
