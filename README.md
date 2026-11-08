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
├── package.json
├── vercel.json
├── render.yaml
├── api/
│   └── index.js
└── lab-03/
    ├── .gitignore
    ├── vercel.json
    ├── package.json
    ├── app.js
    ├── app.http
    ├── postman_collection.json
    ├── goodreads.db
    ├── README.md
    └── Screenshots/
```

## Deployment Options

- **Vercel (Recommended):**
  1. Go to [vercel.com/new](https://vercel.com/new) and import your `Backend-Labs` GitHub repository.
  2. Keep all default settings (Framework: Other, Root Directory: `./`).
  3. Click **Deploy**. Vercel will build and serve your API using the configured `api/index.js` and `vercel.json`.
- **Render:**
  Connect your GitHub repository to Render; it will automatically detect the blueprint in `render.yaml`.

## General Rules Followed

1. **Clean Version Control:** `node_modules/` and `.env` files are never committed (enforced by `.gitignore`).
2. **Security & Parameterized Queries:** All SQL queries use parameterized placeholders (`?`) and allow-lists to eliminate SQL injection risks.
3. **HTTP Status Code Discipline:** Standardized responses (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`).
4. **Structured Error Format:** Consistent `{ "message": "..." }` responses across all API endpoints.
