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
| [`lab-03/`](./lab-03/) | REST API, Query Parameters, Validation, Debugging | Completed | Noun-based REST API, search (`search_q`), sorting (`order_by`, `order`), pagination (`limit`, `offset`), price-range filter (`min_price`, `max_price`), validation, status codes, and debugging |

*(Note: Lab 1 and Lab 2 were completed in their respective standalone repositories. Labs from Lab 3 onwards are maintained in this repository).*

---

## Repository Structure

```text
Backend-Labs/
├── .gitignore
├── README.md
├── render.yaml
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
