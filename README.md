# Blog API

A robust and scalable RESTful API for blog management built with modern web technologies and best practices.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication with access/refresh token flow
  - Role-based access control (Admin/User)
  - Secure password hashing with Argon2
  - Signed cookies for refresh tokens

- **Blog Management**
  - Full CRUD operations for blog posts
  - Draft/Published workflow
  - Automatic slug generation
  - Rich text content support with XSS protection
  - Cloudinary integration for image uploads

- **Social Features**
  - Comments system with full CRUD
  - Like/Unlike functionality
  - User profiles with social links

- **Architecture & Security**
  - Layered architecture (Controllers → Services → Repositories)
  - Global error handling
  - Input validation & sanitization
  - Rate limiting (10 requests/minute)
  - CORS protection
  - Helmet.js security headers
  - Response compression

## 🛠️ Tech Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js 5
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken)
- **File Storage:** Cloudinary
- **Validation:** express-validator
- **Security:** Helmet, CORS, Argon2
- **Logging:** Winston
- **Others:** DOMPurify, compression, rate-limit

## 📋 Prerequisites

- Node.js (v18+)
- MongoDB (v6+)
- Cloudinary account
- TypeScript knowledge

## ⚙️ Installation

1. Clone the repository

```bash
git clone <repository-url>
cd blog-api
```

2. Install dependencies

```bash
npm install
```

3. Create `.env` file

```env
PORT=3000
API_BASE_PATH=/api
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017
LOG_LEVEL=info
COOKIE_SECRET=your_cookie_secret
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=1w
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Run development server

```bash
npm run dev
```

## Docker and Render deployment

Build and run the production image locally (provide the values from `.env` or
your own environment file):

```bash
docker build -t blog-api .
docker run --rm --env-file .env -p 3000:3000 blog-api
```

The image runs as the unprivileged `node` user and exposes a liveness check at
`/health/live`. Docker Compose is intentionally not included: the API has no
container-local dependency and should use a managed MongoDB instance through
`MONGO_URI`.

To deploy on Render, create a **Web Service** from this repository, select
**Docker** as the runtime, and configure all values listed in `.env.example` in
Render's environment settings (Render supplies `PORT`). Set the health-check
path to `/health/live`.

The GitHub workflow at `.github/workflows/ci-cd.yml` runs formatting,
type-checking, tests, the TypeScript build, and a Docker build for pull requests
and pushes to `main`. To enable production deployments:

1. In Render, disable automatic deploys and copy the service's Deploy Hook URL.
2. Add it to the GitHub repository's Actions secrets as
   `RENDER_DEPLOY_HOOK_URL`.
3. Optionally configure the GitHub `production` environment with required
   reviewers for an approval gate.

Only a successful `validate` job can trigger that hook, and it tells Render to
deploy the exact commit that passed validation. Failed checks skip the deployment
job, leaving the currently running Render release unchanged.

## 🔗 API Endpoints

### Base URL

```
http://localhost:3000/api/v2
```

### Authentication

| Method | Endpoint              | Description          | Auth Required |
| ------ | --------------------- | -------------------- | ------------- |
| POST   | `/auth/register`      | Register new user    | No            |
| POST   | `/auth/login`         | User login           | No            |
| POST   | `/auth/refresh-token` | Refresh access token | No            |
| GET    | `/auth/logout`        | User logout          | Yes           |

### Users

| Method | Endpoint         | Description         | Auth Required |
| ------ | ---------------- | ------------------- | ------------- |
| GET    | `/users/current` | Get current user    | Yes           |
| PUT    | `/users/current` | Update current user | Yes           |
| DELETE | `/users/current` | Delete current user | Yes           |
| GET    | `/users`         | Get all users       | Admin         |
| GET    | `/users/:userId` | Get user by ID      | Admin         |
| DELETE | `/users/:userId` | Delete user         | Admin         |

### Blogs

| Method | Endpoint              | Description      | Auth Required |
| ------ | --------------------- | ---------------- | ------------- |
| GET    | `/blogs`              | Get all blogs    | Yes           |
| POST   | `/blogs`              | Create blog      | Admin         |
| GET    | `/blogs/:slug`        | Get blog by slug | Yes           |
| GET    | `/blogs/user/:userId` | Get user's blogs | Yes           |
| PUT    | `/blogs/:blogId`      | Update blog      | Admin         |
| DELETE | `/blogs/:blogId`      | Delete blog      | Admin         |

### Comments

| Method | Endpoint                 | Description       | Auth Required |
| ------ | ------------------------ | ----------------- | ------------- |
| GET    | `/comments/blog/:blogId` | Get blog comments | Yes           |
| POST   | `/comments/blog/:blogId` | Add comment       | Yes           |
| PUT    | `/comments/:commentId`   | Update comment    | Yes           |
| DELETE | `/comments/:commentId`   | Delete comment    | Yes           |

### Likes

| Method | Endpoint              | Description   | Auth Required |
| ------ | --------------------- | ------------- | ------------- |
| POST   | `/likes/blog/:blogId` | Like a blog   | Yes           |
| DELETE | `/likes/blog/:blogId` | Unlike a blog | Yes           |

## 📁 Project Structure

```
src/
├── @types/          # TypeScript declarations
├── config/          # Configuration files
├── controllers/     # Request handlers
├── lib/            # Utilities & libraries
├── middlewares/    # Express middlewares
├── models/         # Mongoose schemas
├── repositories/   # Data access layer
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Helper functions
└── server.ts       # Application entry point
```

## 🔐 Authentication Flow

1. User registers/logs in → Receives access & refresh tokens
2. Access token (1h) → Used in Authorization header
3. Refresh token (1w) → Stored in httpOnly cookie
4. When access token expires → Use refresh token to get new one

## 🚦 Rate Limiting

- **Window:** 1 minute
- **Max Requests:** 10 per IP
- **Headers:** RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset

## 📝 License

Apache-2.0 © Param-Jadvani

## 👤 Author

**Param Jadvani**

---

_Built with ❤️ using TypeScript and Express.js_
