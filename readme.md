# elib-apis

A modern, lightweight REST API backend for elib — a simple ebook library. It provides user authentication, book management with uploads, user ratings, insights/analytics, likes, and pagination.

- Runtime: Node.js (ESM), TypeScript
- Framework: Express
- Database: MongoDB (Mongoose)
- Uploads: Cloudinary (cover images and files)
- Auth: JWT (Bearer tokens)


## Features
- User registration and login with hashed passwords (bcrypt)
- JWT-based authentication middleware
- CRUD operations for books
- File uploads (cover image required; ebook file optional) via Multer + Cloudinary
- Book likes (toggle like/unlike)
- User ratings with comments
- Insights for authors (average rating, highest avg rated book, most recent rating)
- Pagination for listing books
- Centralized error handling
- CORS configured for a single frontend origin


## Quick start

```bash
# 1) Install dependencies
npm install

# 2) Configure environment (see .env example below)
#    Create a .env file in the project root

# 3) Start in dev (nodemon + ts-node)
npm run dev

# Server will run at http://localhost:3000 by default
```


## Environment variables
Create a .env in the project root with the following keys:

```bash
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/elib
JWT_SECRET=replace-with-strong-secret
FRONTEND_URL=http://localhost:3001

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Generate a strong JWT secret (PowerShell, no output to console):

```powershell
$bytes = New-Object byte[] 64; [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes); $env:JWT_SECRET = [Convert]::ToBase64String($bytes); Add-Content -Path .env -Value "JWT_SECRET=$env:JWT_SECRET"
```


## Project structure (key files)
- src/app.ts — Express app, routes, and middleware
- src/config/config.ts — environment configuration
- src/config/db.ts — Mongo connection helper
- src/middlewares/authenticate.ts — JWT auth middleware
- src/middlewares/globalErrorHandler.ts — error shape and handling
- src/controllers/*, src/models/*, src/routes/* — feature modules
- server.ts — app bootstrap


## API Reference
Base URL: http://localhost:3000

Error responses follow this shape:
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Human readable error message"
}
```

Auth
- Authentication: Bearer <JWT>
- Header: Authorization: Bearer <token>


Health/Welcome
- GET /
  - 200 OK
  - Response:
  ```json
  { "message": "Welcome to the elib APIs" }
  ```


Users

1) Register
- Method: POST
- Path: /api/users/register
- Body (JSON):
  ```json
  {
    "name": "Alice",
    "email": "alice@example.com",
    "password": "password123",
    "role": "author"    // or "reader"
  }
  ```
- 201 Created
- Response:
  ```json
  {
    "accessToken": "<jwt>",
    "user": { "name": "Alice", "email": "alice@example.com", "role": "author" }
  }
  ```

2) Login
- Method: POST
- Path: /api/users/login
- Body (JSON):
  ```json
  {
    "email": "alice@example.com",
    "password": "password123"
  }
  ```
- 200 OK
- Response:
  ```json
  {
    "accessToken": "<jwt>",
    "user": { "name": "Alice", "email": "alice@example.com", "role": "author" }
  }
  ```


Books
All endpoints under /api/books. Some actions require Authorization header.

Fields:
- title: string (required on create)
- genre: string (required on create)
- description: string (required on create)
- coverImage: file (required on create; form key: coverImage)
- file: file (optional; form key: file)

1) Create book
- Method: POST
- Path: /api/books/add
- Auth: Required (Bearer token)
- Content-Type: multipart/form-data
- Form fields:
  - title: string
  - genre: string
  - description: string
  - coverImage: file (required)
  - file: file (optional)
- 201 Created
- Response:
  ```json
  {
    "message": "Book created successfully",
    "book": {
      "_id": "...",
      "title": "...",
      "genre": "...",
      "description": "...",
      "coverImage": "https://...",
      "file": "https://..." | null,
      "author": { "_id": "...", "name": "..." },
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
  ```

2) Update book
- Method: PATCH
- Path: /api/books/update/:Bookid
- Auth: Required
- Content-Type: multipart/form-data
- Any of the following fields can be sent:
  - title, genre, description, coverImage (file), file (file)
- 200 OK
- Response:
  ```json
  {
    "message": "Book updated successfully",
    "book": { /* updated book */ }
  }
  ```

3) List books with pagination
- Method: GET
- Path: /api/books/
- Query params:
  - page: number (default 1)
  - limit: number (default 10)
- 200 OK
- Response:
  ```json
  {
    "message": "Books listed successfully",
    "books": [ /* books */ ],
    "pagination": {
      "totalBooks": 42,
      "currentPage": 1,
      "totalPages": 5,
      "pageSize": 10
    }
  }
  ```

4) Book details (increments view count, returns ratings and average)
- Method: GET
- Path: /api/books/:Bookid
- 200 OK
- Response:
  ```json
  {
    "message": "Book details fetched successfully",
    "book": { /* book incl. updated views */ },
    "ratings": [
      { "_id": "...", "rating": 5, "comment": "...", "user": { "name": "..." } }
    ],
    "averageRating": "4.50",
    "totalRatings": 12
  }
  ```

5) Delete book (also deletes associated ratings)
- Method: DELETE
- Path: /api/books/:Bookid
- Auth: Required (must be author)
- 200 OK
- Response:
  ```json
  { "message": "Book and related ratings deleted successfully" }
  ```

6) Toggle like/unlike a book
- Method: PATCH
- Path: /api/books/:Bookid/like
- Auth: Required
- 200 OK
- Response:
  ```json
  {
    "message": "Book liked successfully",
    "likesCount": 3,
    "book": { /* book */ }
  }
  ```
  or
  ```json
  {
    "message": "Book unliked successfully",
    "likesCount": 2,
    "book": { /* book */ }
  }
  ```


Ratings
Base: /api/rate

1) Add rating to a book
- Method: POST
- Path: /api/rate/:BookId
- Auth: Required
- Body (JSON):
  ```json
  { "rating": 5, "comment": "Excellent read" }
  ```
- 200 OK
- Response:
  ```json
  { "message": "Rating added successfully" }
  ```

2) Delete a rating
- Method: DELETE
- Path: /api/rate/:BookId/:ratingId
- Auth: Required
- 200 OK
- Response:
  ```json
  { "message": "Rating deleted successfully" }
  ```

3) Get ratings for a book
- Method: GET
- Path: /api/rate/book/:BookId
- Auth: Required
- 200 OK
- Response:
  ```json
  [ { "_id": "...", "rating": 5, "comment": "...", "book": "...", "user": "..." } ]
  ```

4) Get ratings for all books by an author
- Method: GET
- Path: /api/rate/author/:AuthorId
- Auth: Required
- 200 OK
- Response:
  ```json
  {
    "message": "All ratings for author's books fetched successfully",
    "totalRatings": 10,
    "ratings": [
      {
        "_id": "...",
        "rating": 4,
        "comment": "...",
        "createdAt": "...",
        "book": { "_id": "...", "title": "..." },
        "reviewer": { "_id": "...", "name": "...", "email": "..." }
      }
    ]
  }
  ```


Insights (author analytics)
Base: /api/insight

1) Average rating for an author's books
- Method: GET
- Path: /api/insight/averageRating/:authorId
- 200 OK
- Response:
  ```json
  {
    "message": "Average rating fetched successfully",
    "averageRating": 4.2,
    "totalRatings": 57
  }
  ```

2) Highest average rated book for an author
- Method: GET
- Path: /api/insight/heighestRatedBook/:authorId
- 200 OK
- Response:
  ```json
  {
    "message": "Highest average rated book fetched successfully",
    "highestAvgRatedBook": "<bookId>",
    "averageRating": 4.8
  }
  ```

3) Most recent rating for an author's books
- Method: GET
- Path: /api/insight/recentRating/:authorId
- 200 OK
- Response:
  ```json
  {
    "message": "Most recent rating fetched successfully",
    "recentRating": {
      "bookTitle": "...",
      "rating": 5,
      "comment": "...",
      "createdAt": "...",
      "reviewerName": "...",
      "reviewerEmail": "..."
    }
  }
  ```


## Development notes
- ESM + TypeScript are configured with NodeNext in tsconfig.json and "type": "module" in package.json.
- JWT tokens include sub, email, and role, and expire in 7 days by default.
- Error handler returns a consistent JSON shape and includes stack traces only in development.
- CORS is restricted to FRONTEND_URL.


## Scripts
```json
{
  "dev": "nodemon server.ts"
}
```


## License
ISC © Ujjwal Prajapati
