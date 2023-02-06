import config from 'config';
import jwt from 'jsonwebtoken'
import { UserDto } from '../dto/User.dto';
import sessionModel from '../model/sesssion.model';

const JWT_ACCESS_SECRET = config.get<string>('JWT_ACCESS_SECRET')
const JWT_REFRESH_SECRET = config.get<string>('JWT_REFRESH_SECRET')

const ACCESS_TOKEN_EXPIRATION = config.get<string>('ACCESS_TOKEN_EXPIRATION')
const REFRESH_TOKEN_EXPIRATION = config.get<string>('REFRESH_TOKEN_EXPIRATION')

class SessionService {
  generateTokens(payload: UserDto) {
    const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION })
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION })
    return {
      accessToken,
      refreshToken
    }
  }

  validateAccessToken(token: string) {
    try {
      const userData = jwt.verify(token, JWT_ACCESS_SECRET);
      return userData;
    } catch (e) {
      return null;
    }
  }

  validateRefreshToken(token: string) {

    try {
      const userData = jwt.verify(token, JWT_REFRESH_SECRET);

      return userData;
    } catch (e) {
      console.log('Refresh token is expired?');

      return null;
    }
  }

  async saveToken(userId: string, refreshToken: string) {
    const tokenData = await sessionModel.findOne({ user: userId })
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return tokenData.save();
    }
    const token = await sessionModel.create({ user: userId, refreshToken })
    return token;
  }

  async removeToken(refreshToken: string) {
    const tokenData = await sessionModel.deleteOne({ refreshToken })
    return tokenData;
  }

  async findToken(refreshToken: string) {
    const tokenData = await sessionModel.findOne({ refreshToken })
    return tokenData;
  }
}

const sessionService = new SessionService();
export default sessionService