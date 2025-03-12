import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser, UserRole } from '../models/User';

// Generate JWT access token
const generateAccessToken = (user: IUser): string => {
  const payload = {
    id: user._id,
    role: user.role
  };
  
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  const options: jwt.SignOptions = {
    expiresIn: '7d'
  };
  
  return jwt.sign(payload, secret, options);
};

// Generate refresh token
const generateRefreshToken = (user: IUser): string => {
  const payload = {
    id: user._id
  };
  
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
  }
  
  const options: jwt.SignOptions = {
    expiresIn: '30d'
  };
  
  return jwt.sign(payload, secret, options);
};


const sendTokenResponse = async (
  user: IUser,
  statusCode: number,
  res: Response
) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  const accessTokenExpiry = parseInt(process.env.JWT_EXPIRES_IN || '7') * 24 * 60 * 60 * 1000;
  const refreshTokenExpiry = parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '30') * 24 * 60 * 60 * 1000;

  const accessCookieOptions = {
    expires: new Date(Date.now() + accessTokenExpiry),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  const refreshCookieOptions = {
    expires: new Date(Date.now() + refreshTokenExpiry),
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    path: '/api/auth/refresh' 
  };

  // Remove password from output
  user.password = '';

  res
    .status(statusCode)
    .cookie('token', accessToken, accessCookieOptions)
    .cookie('refreshToken', refreshToken, refreshCookieOptions)
    .json({
      success: true,
      accessToken,
      refreshToken,
      data: user,
    });
};


// POST /api/auth/register
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, role = UserRole.TEACHER } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    // Send token response
    await sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Send token response
    await sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};


// GET /api/auth/logout
export const logout = (req: Request, res: Response) => {
  // Clear access token cookie
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  
  // Clear refresh token cookie
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    path: '/api/auth/refresh'
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
};

// POST /api/auth/refresh
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided',
      });
    }

    // Verify refresh token
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }

    const decoded = jwt.verify(refreshToken, refreshSecret) as { id: string };
    
    // Find user with this refresh token
    const user = await User.findById(decoded.id);
    
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);
    
    // Set access token in cookie
    const accessTokenExpiry = parseInt(process.env.JWT_EXPIRES_IN || '7') * 24 * 60 * 60 * 1000;
    
    const accessCookieOptions = {
      expires: new Date(Date.now() + accessTokenExpiry),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };

    // Return new access token
    res
      .status(200)
      .cookie('token', accessToken, accessCookieOptions)
      .json({
        success: true,
        accessToken,
      });
  } catch (error) {
    // If token is invalid or expired
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
    });
  }
}; 