import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isSeller: user.isSeller,
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const isAuth = (event) => {
  const authorization =
    event.headers.authorization || event.headers.Authorization;
  if (authorization) {
    const token = authorization.slice(7); // Remove 'Bearer '
    return verifyToken(token);
  }
  return null;
};

export const isAdmin = (event) => {
  const user = isAuth(event);
  return user && user.isAdmin ? user : null;
};
