export const reqLogger = (req, res, next) => {
    console.log(`[INFO] ${req.method} ${req.url}`);
    next();
}