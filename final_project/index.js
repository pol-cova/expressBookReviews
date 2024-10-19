const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
const PORT = 5000;

app.use(express.json());

app.use("/customer", session({
    secret: "fingerprint_customer", 
    resave: true, 
    saveUninitialized: true
}));

app.use("/customer/auth/*", function auth(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ message: 'Access Denied: No Token Provided!' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No Token Provided!' });
    }

    try {
        const verified = jwt.verify(token, "access");
        req.user = verified;
        next(); 
    } catch (err) {
        return res.status(403).json({ message: 'Invalid Token' });
    }
});

app.use("/customer", customer_routes);

// General routes
app.use("/", genl_routes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
