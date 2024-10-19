const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./shared_users").users;

const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
      if (users.find(user => user.username === username)) {
          return res.status(400).json({ message: "User already exists" });
      } else {
          users.push({ username, password });
          return res.status(201).json({ message: "Customer successfully registered. Now you can login" });
      }
  } else {
      return res.status(400).json({ message: "Invalid request" });
  }
});

// Get the book list available in the shop
public_users.get('/', (req, res) => {
  return res.json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author;
  const booksByAuthor = Object.values(books).filter(book => book.author === author);

  if (booksByAuthor.length > 0) {
    return res.json(booksByAuthor);
  } else {
    return res.status(404).json({ message: "Author not found" });
  }
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title;
  const booksByTitle = Object.values(books).filter(book => book.title === title);

  if (booksByTitle.length > 0) {
    return res.json(booksByTitle);
  } else {
    return res.status(404).json({ message: "Title not found" });
  }
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    return res.json(book.reviews);
  } else {
    return res.status(404).json({ message: "Reviews not found for this ISBN" });
  }
});

// Axios and Async I/O
public_users.get('/books', async (req, res) => {
  try {
      const response = await axios.get('http://127.0.0.1:5000/');
      const books = response.data;
      res.status(200).json({ books });
  } catch (error) {
      res.status(500).json({ message: 'Error fetching the list of books', error: error.message });
  }
});

public_users.get('/book/:isbn', async (req, res) => {
  const { isbn } = req.params;
  try {
      const response = await axios.get(`http://127.0.0.1:5000/isbn/${isbn}`);
      const book = response.data;
      res.status(200).json({ book });
  } catch (error) {
      res.status(404).json({ message: 'Book not found', error: error.message });
  }
});

public_users.get('/books/author/:author', async (req, res) => {
  const { author } = req.params;
  try {
      const response = await axios.get(`http://127.0.0.1:5000/author/${author}`);
      const books = response.data;
      res.status(200).json({ books });
  } catch (error) {
      res.status(404).json({ message: 'No books found for the author', error: error.message });
  }
});

public_users.get('/books/title/:title', async (req, res) => {
  const { title } = req.params;
  try {
      const response = await axios.get(`http://127.0.0.1:5000/title/${title}`);
      const books = response.data;
      res.status(200).json({ books });
  } catch (error) {
      res.status(404).json({ message: 'No books found with the given title', error: error.message });
  }
});

module.exports.general = public_users;
