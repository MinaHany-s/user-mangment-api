# User Management API

A backend-only user management REST API built with Node.js, Express, TypeScript, MongoDB, and Mongoose. It has no authentication or authorization.

## Requirements

- Node.js 18 or newer and npm
- MongoDB running locally or a MongoDB connection URI

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env` and set your values:

   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/user_management
   CLIENT_ORIGIN=http://localhost:5173
   ```

   `MONGODB_URI` and `CLIENT_ORIGIN` are required. The server validates configuration on startup. Start MongoDB before starting the API.

3. Start the development server:

   ```sh
   npm run dev
   ```

   The API is available at `http://localhost:5000`. Check `GET /health` to confirm that the HTTP server is responding.

4. Build and run the production version:

   ```sh
   npm run build
   npm start
   ```

## User fields

- `firstName` and `lastName`: required non-empty strings
- `email`: required valid email; trimmed and stored lowercase; unique
- `age`: required number of at least 1
- `phone`: optional string
- `status`: `active` or `inactive`; defaults to `active`
- `avatar`: optional URL
- `createdAt` and `updatedAt`: maintained automatically

## Endpoints

All responses use JSON except successful deletion (`204 No Content`). Successful resource responses have the shape `{ "success": true, "data": ... }`. Errors have the shape `{ "success": false, "error": { "message": "...", "details": [...] } }`; `details` is included for validation errors.

### `GET /api/users`

Returns a paginated list. Supported query parameters:

| Parameter | Default | Description |
| --- | --- | --- |
| `page` | `1` | Positive page number |
| `limit` | `10` | Results per page, from 1 to 100 |
| `search` | — | Case-insensitive match against first name, last name, or email |
| `status` | — | Filter by `active` or `inactive` |
| `sortBy` | `createdAt` | Sort field: `createdAt`, `firstName`, or `email` |
| `order` | `desc` | Sort order: `asc` or `desc` |

Example: `GET /api/users?page=1&limit=10&search=mina&status=active&sortBy=firstName&order=asc`

Response:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "total": 0,
    "page": 1,
    "limit": 10,
    "totalPages": 0
  }
}
```

### `GET /api/users/:id`

Returns one user. Responds with `400` for an invalid MongoDB ObjectId and `404` if no user exists.

### `POST /api/users`

Creates a user and returns `201`. Email conflicts return `409`.

```json
{
  "firstName": "Mina",
  "lastName": "Hany",
  "email": "mina@example.com",
  "age": 22,
  "phone": "01000000000",
  "status": "active",
  "avatar": "https://example.com/avatar.png"
}
```

`status`, `phone`, and `avatar` may be omitted.

### `PATCH /api/users/:id`

Updates one or more supported fields: `firstName`, `lastName`, `email`, `age`, `phone`, `status`, and `avatar`. Unknown fields and an empty body are rejected. Returns `404` for a missing user and `409` if the email is already in use.

```json
{
  "status": "inactive",
  "phone": "01012345678"
}
```

### `DELETE /api/users/:id`

Deletes one user and returns `204 No Content`. Returns `404` if the user does not exist.

## Testing with Postman

1. Start MongoDB and run `npm run dev`.
2. Create a Postman collection with the base URL `http://localhost:5000`.
3. Try `GET /health`, then create a user with `POST /api/users` and the JSON body above. Set `Content-Type: application/json`.
4. Copy the created user's `_id` into the `:id` portion of the GET, PATCH, and DELETE URLs.
5. Try list query parameters such as `?page=1&limit=5&search=mina&status=active&sortBy=email&order=asc`.

## Connecting a React frontend with Axios

Install Axios in the frontend project and use the API base URL:

```ts
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

const response = await api.get("/users", {
  params: { page: 1, limit: 10, search: "mina" },
});
const users = response.data.data;
```

Set the API's `CLIENT_ORIGIN` to the frontend's origin so the browser can make cross-origin requests. Restart the API after changing `.env`.
