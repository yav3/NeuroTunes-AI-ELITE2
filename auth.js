"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAuthenticated = ensureAuthenticated;
exports.requireRole = requireRole;
exports.optionalUser = optionalUser;
function ensureAuthenticated(req, res, next) {
    const isOAuth = req.isAuthenticated && req.isAuthenticated();
    const isSession = req.session?.isAuthenticated && req.session?.userId;
    if (isOAuth || isSession) {
        req.userId = isOAuth ? req.user?.id : req.session.userId;
        req.userEmail = isOAuth ? req.user?.email : req.session.userEmail;
        req.role = isOAuth ? req.user?.role : req.session.role || 'patient';
        console.log(`🔐 Authenticated: ${req.userEmail || 'Unknown'} (Role: ${req.role})`);
        return next();
    }
    console.warn('🚫 Unauthorized request blocked');
    return res.status(401).json({ error: 'Unauthorized' });
}
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        const userRole = req.role || req.session?.role || 'anonymous';
        if (allowedRoles.includes(userRole)) {
            return next();
        }
        console.warn(`🚫 Access denied for role: ${userRole}`);
        return res.status(403).json({ error: 'Forbidden: insufficient role' });
    };
}
function optionalUser(req, res, next) {
    const isOAuth = req.isAuthenticated && req.isAuthenticated();
    const isSession = req.session?.isAuthenticated && req.session?.userId;
    if (isOAuth || isSession) {
        req.userId = isOAuth ? req.user?.id : req.session.userId;
        req.userEmail = isOAuth ? req.user?.email : req.session.userEmail;
        req.role = isOAuth ? req.user?.role : req.session.role || 'patient';
    }
    return next();
}
