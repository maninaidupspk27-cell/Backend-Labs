# Backend Development Fundamentals - Labs

**Course:** Backend Development Fundamentals  
**Year/Term:** Year II, Term II  
**University:** Aurora Deemed to be University  
**Faculty:** Mr. Joel Prashanth D  

| Student Detail | Value |
| --- | --- |
| **Name** | Singamsetty Manikanta |
| **Registration Number** | 252U1R3087 |
| **Section** | CSE-DS(2B) 307 |

---

## Course Lab Index

| Lab Folder | Topic / Module | Status | Description |
| --- | --- | --- | --- |
| [`lab-01/`](./lab-01/) | Node.js and Express Server | Completed | HTTP routing, JSON/text responses, current time, 404 handler |
| [`lab-02/`](./lab-02/) | SQLite Database and CRUD Routes | Completed | SQLite integration, CRUD operations on books table |
| [`lab-03/`](./lab-03/) | REST API, Query Parameters, Validation, Debugging | Completed | Noun-based REST API, search (`search_q`), sorting (`order_by`, `order`), pagination (`limit`, `offset`), price-range filter (`min_price`, `max_price`), validation, status codes, and debugging |

---

## Repository Structure

```text
Backend-Labs/
├── .gitignore
├── README.md
├── render.yaml
├── lab-01/
│   ├── .gitignore
│   ├── package.json
│   ├── server.js
│   ├── README.md
│   └── Screenshots/
├── lab-02/
│   ├── .gitignore
│   ├── package.json
│   ├── app.js
│   ├── app.http
│   ├── goodreads.db
│   ├── README.md
│   └── Screenshots/
└── lab-03/
    ├── .gitignore
    ├── package.json
    ├── app.js
    ├── app.http
    ├── postman_collection.json
    ├── goodreads.db
    ├── README.md
    └── Screenshots/
```

## General Rules Followed

1. **Clean Version Control:** `node_modules/` and `.env` files are never committed (enforced by `.gitignore`).
2. **Security & Parameterized Queries:** All SQL queries use parameterized placeholders (`?`) and allow-lists to eliminate SQL injection risks.
3. **HTTP Status Code Discipline:** Standardized responses (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`).
4. **Structured Error Format:** Consistent `{ "message": "..." }` responses across all API endpoints.
