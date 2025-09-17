# elib-apis

A modern, lightweight REST API backend for elib — a simple ebook library. It provides user authentication and book management with file and image uploads.

- Runtime: Node.js (ESM), TypeScript
- Framework: Express
- Database: MongoDB (Mongoose)
- Uploads: Cloudinary (cover images and files)
- Auth: JWT (Bearer tokens)


## Features
- User registration and login with hashed passwords (bcrypt)
- JWT-based authentication middleware
- CRUD operations for books
- File uploads (cover image required, ebook file optional) via Multer + Cloudinary
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
- src/user/* — user routes, controller, and model
- src/book/* — book routes, controller, and model
- server.ts — app bootstrap


## API Reference
Base URL: http://localhost:3000

All JSON responses follow this error shape on failure:
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Human readable error message"
}
```

### Auth
- Authentication: Bearer <JWT>
- Header: Authorization: Bearer <token>


### Health/Welcome
- GET /
  - 200 OK
  - Response:
  ```json
  { "message": "Welcome to the elib APIs" }
  ```


### Users

1) Register
- Method: POST
- Path: /api/users/register
- Body (JSON):
  ```json
  {
    "name": "Alice",
    "email": "alice@example.com",
    "password": "password123"
  }
  ```
- 201 Created
- Response:
  ```json
  { "accessToken": "<jwt>" }
  ```
- Example (curl):
  ```bash
  curl -X POST http://localhost:3000/api/users/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Alice","email":"alice@example.com","password":"password123"}'
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
  { "accessToken": "<jwt>" }
  ```
- Example (curl):
  ```bash
  curl -X POST http://localhost:3000/api/users/login \
    -H "Content-Type: application/json" \
    -d '{"email":"alice@example.com","password":"password123"}'
  ```


### Books
All endpoints under /api/books. Some actions require Authorization header.

Fields:
- title: string (required on create)
- genre: string (required on create)
- coverImage: file (required on create; key name: coverImage)
- file: file (optional; key name: file)

1) Create book
- Method: POST
- Path: /api/books/add
- Auth: Required (Bearer token)
- Content-Type: multipart/form-data
- Form fields:
  - title: string
  - genre: string
  - descripition: string
  - coverImage: file (required)
  - file: file (required)
- 201 Created
- Response:
  ```json
  {
    "message": "Book created successfully",
    "book": {
      "_id": "...",
      "title": "...",
      "genre": "...",
      "description":"..."
      "coverImage": "https://...",
      "file": "https://...",
      "author": { "_id": "...", "name": "...", "email": "..." },
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  }
  ```
- Example (curl with Powershell escaping may vary):
  ```bash
  curl -X POST http://localhost:3000/api/books/add \
    -H "Authorization: Bearer <jwt>" \
    -F "title=The Pragmatic Programmer" \
    -F "genre=Programming" \
    -F "coverImage=@./cover.jpg" \
    -F "file=@./book.pdf"
  ```

2) Update book
- Method: PATCH
- Path: /api/books/update/:Bookid
- Auth: Required
- Content-Type: multipart/form-data
- Any of the following fields can be sent:
  - title: string
  - genre: string
  - description: string
  - coverImage: file (optional, replaces existing)
  - file: file (optional, replaces existing)
- 200 OK
- Response:
  ```json
  {
    "message": "Book updated successfully",
    "book": { /* updated book */ }
  }
  ```
- Example:
  ```bash
  curl -X PATCH http://localhost:3000/api/books/update/BOOK_ID \
    -H "Authorization: Bearer <jwt>" \
    -F "title=New Title"
  ```

3) List books
- Method: GET
- Path: /api/books/
- 200 OK
- Response:
  ```json
  {
    "message": "Books listed successfully",
    "books": [
      {
        "_id": "...",
        "title": "...",
        "genre": "...",
        "description": "..."
        "coverImage": "https://...",
        "file": "https://..." | null,
        "author": { "_id": "...", "name": "...", "email": "..." },
        "createdAt": "...",
        "updatedAt": "..."
      }
    ]
  }
  ```
- Example:
  ```bash
  curl http://localhost:3000/api/books/
  ```

4) Book details
- Method: GET
- Path: /api/books/:Bookid
- 200 OK
- Response:
  ```json
  {
    "message": "Book details fetched successfully",
    "book": { /* book */ }
  }
  ```
- Example:
  ```bash
  curl http://localhost:3000/api/books/BOOK_ID
  ```

5) Delete book
- Method: DELETE
- Path: /api/books/:Bookid
- Auth: Required (must be author)
- 200 OK
- Response:
  ```json
  {
    "message": "Book deleted successfully"
  }
  ```
- Example:
  ```bash
  curl -X DELETE http://localhost:3000/api/books/BOOK_ID \
    -H "Authorization: Bearer <jwt>"
  ```


## Development notes
- ESM + TypeScript are configured with NodeNext in tsconfig.json and "type": "module" in package.json.
- JWT tokens include sub and email and expire in 7 days by default.
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
