const express = require("express");
const path = require("path");
const fs = require("fs");
const { open } = require("sqlite");

let sqlite3 = null;
let sqliteLoadError = null;
try {
  sqlite3 = require("sqlite3");
} catch (err) {
  sqliteLoadError = err;
  console.error("Warning: Failed to load sqlite3 native module:", err.message);
}

const app = express();
app.use(express.json());

const isVercel = process.env.VERCEL === "1" || !!process.env.VERCEL;

// Locate goodreads.db across different execution directories
const findOriginalDb = () => {
  const candidatePaths = [
    path.join(__dirname, "goodreads.db"),
    path.join(process.cwd(), "lab-03", "goodreads.db"),
    path.join(process.cwd(), "goodreads.db"),
  ];
  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return path.join(__dirname, "goodreads.db");
};

const originalDbPath = findOriginalDb();
const dbPath = isVercel ? path.join("/tmp", "goodreads.db") : originalDbPath;

let db = null;
let dbPromise = null;

// ---------- Helpers ----------

const ALLOWED_ORDER_BY = ["id", "title", "author", "price", "pages"];
const ALLOWED_ORDER = ["ASC", "DESC"];

const isBlank = (value) => typeof value !== "string" || value.trim() === "";

const validateBook = (body) => {
  const { title, author, price, pages } = body || {};

  if (isBlank(title)) {
    return "title is required and must be a non-empty string";
  }
  if (isBlank(author)) {
    return "author is required and must be a non-empty string";
  }
  if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
    return "price is required and must be a non-negative number";
  }
  if (pages !== undefined && (!Number.isInteger(pages) || pages <= 0)) {
    return "pages, if provided, must be a positive whole number";
  }
  return null;
};

const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

// ---------- Database Initializer (Supports Local, Render, and Vercel) ----------

const getDB = async () => {
  if (sqliteLoadError || !sqlite3) {
    throw new Error(
      "SQLite3 native binary failed to load in this serverless environment: " +
        (sqliteLoadError ? sqliteLoadError.message : "module not available")
    );
  }

  if (!dbPromise) {
    dbPromise = (async () => {
      // In Vercel serverless environments, the filesystem is read-only.
      // Copy the database file to /tmp so write operations succeed.
      if (isVercel && fs.existsSync(originalDbPath) && !fs.existsSync(dbPath)) {
        try {
          fs.copyFileSync(originalDbPath, dbPath);
        } catch (copyErr) {
          console.error("Warning: could not copy db to /tmp:", copyErr.message);
        }
      }

      const database = await open({
        filename: dbPath,
        driver: sqlite3.Database,
      });

      await database.exec(`
        CREATE TABLE IF NOT EXISTS book (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          author TEXT,
          price INTEGER,
          pages INTEGER
        );
      `);

      const books = await database.all("SELECT * FROM book;");

      if (books.length === 0) {
        await database.run(`
          INSERT INTO book (title, author, price, pages)
          VALUES
            ('Harry Potter', 'J.K. Rowling', 500, 350),
            ('The Hobbit', 'J.R.R. Tolkien', 400, 310),
            ('Wings of Fire', 'A.P.J. Abdul Kalam', 250, 180),
            ('The Alchemist', 'Paulo Coelho', 300, 200),
            ('Atomic Habits', 'James Clear', 450, 320),
            ('Rich Dad Poor Dad', 'Robert Kiyosaki', 350, 240),
            ('Think and Grow Rich', 'Napoleon Hill', 280, 260),
            ('Ikigai', 'Hector Garcia', 320, 190),
            ('Deep Work', 'Cal Newport', 400, 280),
            ('The Power of Habit', 'Charles Duhigg', 380, 290);
        `);
      }

      db = database;
      return database;
    })();
  }
  return dbPromise;
};

// Middleware: ensure database is ready before handling requests
app.use(async (request, response, next) => {
  try {
    await getDB();
    next();
  } catch (error) {
    response.status(500).json({
      message: "Database initialization failed: " + error.message,
      note: "If running on Vercel, serverless environments may block C++ SQLite binaries. Deploying to Render (or using Render's blueprint) runs full persistent Node/SQLite.",
    });
  }
});

// ---------- Routes ----------

// Welcome root endpoint
app.get("/", (request, response) => {
  response.status(200).json({
    message: "Welcome to Lab 3 Books REST API",
    student: {
      name: "Singamsetty Manikanta",
      registrationNumber: "252U1R3087",
      section: "CSE-DS(2B) 307",
    },
    endpoints: {
      get_all_books: "/books/",
      search_and_filter: "/books/?search_q=the&min_price=300&max_price=450&order_by=price&order=DESC&limit=5&offset=0",
      get_book_by_id: "/books/1/",
    },
  });
});

// GET all books: search, filter, sort, paginate
app.get("/books/", async (request, response) => {
  try {
    const {
      search_q = "",
      order_by = "id",
      order = "ASC",
      limit = "10",
      offset = "0",
      min_price = "0",
      max_price,
    } = request.query;

    const orderBy = String(order_by);
    const orderDir = String(order).toUpperCase();
    const limitNum = Number(limit);
    const offsetNum = Number(offset);
    const minPrice = Number(min_price);
    const maxPrice =
      max_price === undefined ? Number.MAX_SAFE_INTEGER : Number(max_price);

    if (!ALLOWED_ORDER_BY.includes(orderBy)) {
      return response.status(400).json({
        message: `order_by must be one of: ${ALLOWED_ORDER_BY.join(", ")}`,
      });
    }
    if (!ALLOWED_ORDER.includes(orderDir)) {
      return response.status(400).json({ message: "order must be ASC or DESC" });
    }
    if (!Number.isInteger(limitNum) || limitNum < 1) {
      return response
        .status(400)
        .json({ message: "limit must be a positive whole number" });
    }
    if (!Number.isInteger(offsetNum) || offsetNum < 0) {
      return response
        .status(400)
        .json({ message: "offset must be a whole number, 0 or more" });
    }
    if (Number.isNaN(minPrice) || Number.isNaN(maxPrice)) {
      return response
        .status(400)
        .json({ message: "min_price and max_price must be numbers" });
    }
    if (minPrice > maxPrice) {
      return response
        .status(400)
        .json({ message: "min_price cannot be greater than max_price" });
    }

    const query = `
      SELECT * FROM book
      WHERE title LIKE ?
        AND price BETWEEN ? AND ?
      ORDER BY ${orderBy} ${orderDir}
      LIMIT ? OFFSET ?;
    `;

    const books = await db.all(query, [
      `%${String(search_q)}%`,
      minPrice,
      maxPrice,
      limitNum,
      offsetNum,
    ]);

    response.status(200).json(books);
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

// GET one book by id
app.get("/books/:bookId/", async (request, response) => {
  try {
    const bookId = parseId(request.params.bookId);
    if (bookId === null) {
      return response
        .status(400)
        .json({ message: "bookId must be a positive whole number" });
    }

    const book = await db.get("SELECT * FROM book WHERE id = ?;", [bookId]);

    if (!book) {
      return response.status(404).json({ message: "Book not found" });
    }

    response.status(200).json(book);
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

// POST: add a new book
app.post("/books/", async (request, response) => {
  try {
    const errorMessage = validateBook(request.body);
    if (errorMessage) {
      return response.status(400).json({ message: errorMessage });
    }

    const { title, author, price, pages = null } = request.body;

    const result = await db.run(
      "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);",
      [title.trim(), author.trim(), price, pages]
    );

    response.status(201).json({
      message: "Book added successfully",
      bookId: result.lastID,
    });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

// PUT: update a book by id
app.put("/books/:bookId/", async (request, response) => {
  try {
    const bookId = parseId(request.params.bookId);
    if (bookId === null) {
      return response
        .status(400)
        .json({ message: "bookId must be a positive whole number" });
    }

    const errorMessage = validateBook(request.body);
    if (errorMessage) {
      return response.status(400).json({ message: errorMessage });
    }

    const { title, author, price, pages = null } = request.body;

    const result = await db.run(
      `UPDATE book
       SET title = ?, author = ?, price = ?, pages = ?
       WHERE id = ?;`,
      [title.trim(), author.trim(), price, pages, bookId]
    );

    if (result.changes === 0) {
      return response.status(404).json({ message: "Book not found" });
    }

    response.status(200).json({ message: "Book updated successfully" });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

// DELETE: remove a book by id
app.delete("/books/:bookId/", async (request, response) => {
  try {
    const bookId = parseId(request.params.bookId);
    if (bookId === null) {
      return response
        .status(400)
        .json({ message: "bookId must be a positive whole number" });
    }

    const result = await db.run("DELETE FROM book WHERE id = ?;", [bookId]);

    if (result.changes === 0) {
      return response.status(404).json({ message: "Book not found" });
    }

    response.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

// ---------- Fallbacks (must stay AFTER all routes) ----------

// Unknown URL
app.use((request, response) => {
  response.status(404).json({ message: "Route not found" });
});

// Error-handling middleware (4 parameters): catches bad JSON bodies etc.
app.use((error, request, response, next) => {
  if (error.type === "entity.parse.failed") {
    return response.status(400).json({ message: "Invalid JSON in request body" });
  }
  response.status(500).json({ message: error.message });
});

// ---------- Start Server Locally / on Render ----------
if (!isVercel) {
  const port = process.env.PORT || 3000;
  getDB()
    .then(() => {
      app.listen(port, (error) => {
        if (error) {
          console.error("Server failed to start:", error.message);
          process.exit(1);
        }
        console.log("Database initialized successfully!");
        console.log(`Server running on port ${port}`);
      });
    })
    .catch((error) => {
      console.error("Database or Server Error:", error.message);
      process.exit(1);
    });
}

// Export for Vercel serverless deployment
module.exports = app;
