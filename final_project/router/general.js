const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.name;
  const pass = req.body.password;

  if (username && pass) {
    if (isValid(username)) {
      return res.status(400).json({ message: "User is already registered!" });
    } else {
      users.push({ name: username, password: pass });
      return res.status(200).json({ message: "User registered successfully!" });
    }
  } else {
    return res
      .status(400)
      .json({ message: "You need to provide an user and password" });
  }
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  return res.status(200).json({ message: books });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const book = books[req.params.isbn];

  return res.status(200).json({ message: book });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const isbnArray = Object.keys(books);
  const author = req.params.author;
  let booksObj = {};

  let count = 1;
  isbnArray.map((isbn) => {
    if (books[isbn].author === author) {
      booksObj[count] = books[isbn];
      count += 1;
      return;
    } else {
      return undefined;
    }
  });

  if (Object.keys(booksObj).length > 0) {
    return res.status(200).json({ message: { author, booksObj } });
  } else {
    return res
      .status(404)
      .json({ message: "Couldn't find a book of that author" });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const isbnArray = Object.keys(books);
  const title = req.params.title;

  let bookISBN = isbnArray.find((isbn) => books[isbn].title === title);
  let book = books[bookISBN];

  if (book) {
    return res.status(200).json({ message: book });
  } else {
    return res
      .status(404)
      .json({ message: "Couldn't find a book with that title" });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbnArray = Object.keys(books);
  const isbn = req.params.isbn;

  let bookISBN = isbnArray.find((isbnArr) => isbnArr === isbn);
  let reviews = books[bookISBN].reviews;

  if (reviews) {
    return res.status(200).json({ message: reviews });
  } else {
    return res
      .status(404)
      .json({ message: "Couldn't find reviews for that book" });
  }
});

// Get books
function getBooks() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(books);
    }, 10000);
  }).then((response) => console.log("Books:", response));
}
getBooks();

// Get book by ISBN
function getBooksByISBN(isbn) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let book = books[isbn];
      resolve(book);
    }, 1000);
  }).then((response) => console.log(`Book w/ ISBN:${isbn}:`, response));
}
getBooksByISBN(1);
getBooksByISBN(10);

// Get book by Author
function getBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let isbns = Object.keys(books);
      let authorBooks = isbns.map(isbn => {
        if (books[isbn].author === author) {
          return books[isbn]
        } else {
          return undefined
        }
      }).filter(item => item !== undefined)
      resolve(authorBooks);
    }, 1000);
  }).then((response) => console.log(`Book w/ Author:${author}:`, response));
}
getBooksByAuthor("Unknown")

// Get book by Title
fetch("http://localhost:5000/title/Le P\u00e8re Goriot", {
  method: "GET",
})
  .then((response) => response.json())
  .then((result) =>
    console.log("Book with Le P\u00e8re Goriot Title:", result.message)
  );

module.exports.general = public_users;
