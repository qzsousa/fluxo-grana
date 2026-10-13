import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || "15m";
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || "7d";

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error(
    "JWT_SECRET must be set in environment variables and be at least 32 characters long"
  );
}

// Type assertion after validation
const jwtSecret: string = JWT_SECRET!;

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

function generateTokens(userId: string, email: string) {
  const accessToken = jwt.sign(
    { sub: userId, email, type: "access" },
    jwtSecret,
    { expiresIn: JWT_ACCESS_EXPIRY } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { sub: userId, email, type: "refresh" },
    jwtSecret,
    { expiresIn: JWT_REFRESH_EXPIRY } as jwt.SignOptions
  );

  return { accessToken, refreshToken };
}

async function hashPassword(password: string): Promise<string> {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || "12", 10);
  const salt = await bcrypt.genSalt(rounds);
  return bcrypt.hash(password, salt);
}

async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export { generateTokens, hashPassword, comparePassword };