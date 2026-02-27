export const cookies = {
  getOptions: () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  }),
  set: (res, name, value, options = {}) => {
    res.cookie(name, value, { ...options, ...cookies.getOptions() });
  },
  clear: (res, name, options = {}) => {
    res.clearCookie(name, { ...options, ...cookies.getOptions() });
  },
  get: (req, name) => {
    return req.cookies[name];
  },
};
