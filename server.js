const express = require("express");
const app = express();
const mysql = require("mysql");
app.use(express.json());
const Joi = require("joi");
const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "",
  database: "booksdata",
});
const books = [
  {
    id: 1,
    title: "Harry Potter",
    author: "J.K. Rowling",
    publishedyear: "1997",
    publisher: "Bloomsbury",
    genre: "Fantasy",
    imageurl:
      "https://images-na.ssl-images-amazon.com/images/I/51UoqRAxwEL._SX331_BO1,204,203,200_.jpg",
  },
  {
    id: 2,
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    publishedyear: "1954",
    publisher: "Allen & Unwin",
    genre: "Fantasy",
    imageurl:
      "https://images-na.ssl-images-amazon.com/images/I/51UoqRAxwEL._SX331_BO1,204,203,200_.jpg",
  },
];
const schema = Joi.object({
  title: Joi.string().required(),
  author: Joi.string().required(),
  publishyear: Joi.string()
    .regex(/^\d{4}$/)
    .required(),
  publisher: Joi.string().required(),
  genre: Joi.string().required(),
  imageurl: Joi.string().uri().required(),
});

app.post("/books/sql/add", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      res.status(500).send(err);
    } else {
      const data = req.body;
      const validate = schema.validate(data);
      if (validate.error) {
        res.status(400).send(validate.error);
        return;
      }
      connection.query("INSERT INTO books SET ?", data, (err, rows) => {
        connection.release();
        if (!err) {
          res.send("Book added successfully");
          console.log("The data from books table are: ", rows);
        } else {
          res.status(400).send(err);
        }
      });
    }
  });
});
app.get("/books/sql/getdata", (req, res) => {
  pool.getConnection((err, connection) => {
    connection.query("SELECT * FROM books", (err, rows) => {
      if (err) {
        res.status(400).send(err);
      } else {
        res.send(rows);
      }
    });
  });
});


app.put("/books/sql/update/:id", (req, res) => {
  const keys = Object.keys(req.body);
  const values = keys.map((key) => req.body[key]);
  if (values.length === 0) {
    res.status(400).send("Enter Data to update");
  } else {
    const updateQuery = `UPDATE books SET ${keys
      .map((key) => `${key} = ?`)
      .join(", ")} WHERE id = ?`;
    //console.log(keys)
    pool.getConnection((err, connection) => {
      connection.query(updateQuery, [...values, req.params.id], (err, rows) => {
        if (err) {
          res.status(400).send(err);
        } else {
          res.send("data Updated");
        }
      });
    });
  }
});

app.delete("/books/sql/delete/:id", (req, res) => {
  pool.getConnection((err, connection) => {
    connection.query(
      "delete from books where id=?",
      [req.params.id],
      (err, rows) => {
        connection.release();
        if (err) {
          res.status(400).send(err);
        } else {
          res.send("data has been removed");
        }
      }
    );
  });
});
app.get("/", (req, res) => {
  res.send(books);
});
app.get("/books/:id", (req, res) => {
  const id = req.params.id;
  console.log(id);
  const book = books.find((b) => b.id == id);
  if (books) {
    res.send(book);
  } else {
    res.status(404).send("Book not found");
  }
});
app.post("/books/add", (req, res) => {
  const book = req.body;
  const error = schema.validate(book);
  if (error) {
    res.status(400).send("Enter All Details");
    return;
  } else {
    if (book) {
      books.push(book);
      res.send("Book added successfully");
    } else {
      res.status(400).send("Invalid Book");
    }
  }
});
app.put("/books/:id", (req, res) => {
  const id = req.params.id;
  const index = books.findIndex((books) => books.id == id);
  body = req.body;
  if (index > -1) {
    books[index] = {
      id,
      ...body,
    };
    res.send("Book updated successfully");
  } else {
    res.status(400).send("Invalid Book");
  }
});
app.delete("/books/:id", (req, res) => {
  const id = req.params.id;
  const index = books.findIndex((books) => books.id == id);
  if (index > -1) {
    books.splice(index, 1);
    res.send("Book deleted successfully");
  } else {
    res.status(400).send("Invalid Book");
  }
});
app.listen(3000);
