const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  const validUser = users.find((user) => user.name === username);

  if (validUser) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  //returns boolean
  const validUser = users.find(
    (user) => user.name === username && user.password === password
  );

  if (validUser) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.name;
  const password = req.body.password;

  if (isValid(username)) {
    if (authenticatedUser(username, password)) {
      let accessToken = jwt.sign(
        {
          data: password,
        },
        "access",
        { expiresIn: "1h" }
      );
      req.session.authorization = {
        accessToken,
        username,
      };
      return res.status(200).json({ message: "Successful login!" });
    } else {
      return res.status(400).json({ message: "Error logging in. Check data!" });
    }
  } else {
    return res.status(400).json({ message: "User not found!" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  if (isbn) {
    let validISBN = Object.keys(books).find((item) => item === isbn);
    const book = books[validISBN];

    if (book) {
      if (review) {
        const user = req.session.authorization["username"];
        let countReviews = Object.keys(books[isbn].reviews).length + 1;
        books[isbn].reviews[countReviews] = { date: Date.now(), user, review };
        return res.status(200).json({ message: books[isbn].reviews });
      } else {
        return res.status(400).json({ message: "You must write a review" });
      }
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } else {
    return res.json(400).json({ message: "You must provide an ISBN" });
  }
});

//Delete review by ID
regd_users.delete("/auth/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const id = req.query.id;

  if (isbn) {
    let validISBN = Object.keys(books).find((item) => item === isbn);
    const book = books[validISBN];
    if (book) {
      if (id) {
        let validReview = Object.keys(book.reviews).find((item) => item === id);
        if (validReview) {
          delete book.reviews[validReview];
          return res.status(200).json({ message: "Deleted the review" });
        } else {
          return res.status(404).json({ message: "Review not found" });
        }
      } else {
        return res.status(400).json({ message: "You must provide an ID" });
      }
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } else {
    return res.status(400).json({ message: "You must provide an ISBN" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
