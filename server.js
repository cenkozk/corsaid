const express = require("express");
const corsAnywhere = require("cors-anywhere");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

// Set up CORS Anywhere server
const server = corsAnywhere.createServer({
  originWhitelist: [], // Allow all origins
});
// Rate limiting middleware for IP addresses
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  // Trust proxy headers to correctly identify client's IP address
  trustProxy: true,
});

// Apply rate limiter to all requests
app.use(limiter);

// Define a middleware function to handle requests and pass them to the CORS Anywhere server
const handleRequest = (req, res) => {
  // Check data size limit
  const contentLength = parseInt(req.headers["content-length"], 10);
  if (contentLength && contentLength > 2 * 1024 * 128) {
    return res
      .status(413)
      .send(
        "Request entity too large, upgrade to CorsAid Pro to go beyond 256KB data limit."
      );
  }

  // If data size is within limit, pass the request to the CORS Anywhere server
  server.emit("request", req, res);
};

// Mount the middleware function on the root path ("/")
app.use("/", handleRequest);

app.listen(PORT, () => {
  console.log(`CORS Anywhere server is running on port ${PORT}`);
});
