const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
let users = require("./shared_users").users;
const regd_users = express.Router();

const isValid = (username) => {
    const pattern = /^[a-zA-Z0-9_]{3,16}$/;
    return pattern.test(username);
};

const authenticatedUser = (username, password) => {
    // Check if the username and password match an existing user
    return users.some(user => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ username }, 'access', { expiresIn: '1h' });
    return res.status(200).json({ message: "Customer successfully logged in", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;

  if (!review) {
    return res.status(400).json({ message: "Review content is required" });
  }

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  book.reviews = book.reviews || {}; 
  const reviewId = Object.keys(book.reviews).length + 1;  
  book.reviews[reviewId] = review;

  return res.status(200).json({ message: `Review for the book with ISBN ${isbn} has been added`, book });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn/:reviewId", (req, res) => {
  const { isbn, reviewId } = req.params;

  // Check if the book with the given ISBN exists
  const book = books[isbn];

  if (!book) {
      return res.status(404).json({ message: "Book not found" });
  }

  // Check if the book has any reviews
  if (!book.reviews || !book.reviews[reviewId]) {
      return res.status(404).json({ message: "Review not found" });
  }

  // Delete the review
  delete book.reviews[reviewId];

  return res.status(200).json({ message: `Review with ID ${reviewId} for book with ISBN ${isbn} has been deleted`, book });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
