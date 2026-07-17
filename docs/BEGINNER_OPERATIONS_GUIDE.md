# Beginner guide: API documentation and server checks

This page explains the extra tools around the Blog API. They do not change how
blogs, users, comments, or likes work. They make the API easier to understand,
check, and support.

## Start here

1. Put the required values in `.env`.
2. Start MongoDB.
3. Run `npm run dev` while learning, or run `npm run build` followed by
   `npm run start` to run the compiled application.
4. Open `http://localhost:3000/docs` in a browser.

The documentation page is local. It reads the file
`docs/openapi.yaml` from this project. The **Ask AI** feature is disabled, so
the page contains only the API reference and its built-in request tester.

## The most useful URLs

| URL             | What it answers                      | Normal result                         |
| --------------- | ------------------------------------ | ------------------------------------- |
| `/docs`         | "How do I call this API?"            | A readable, interactive API reference |
| `/openapi.yaml` | "What is the raw API contract?"      | A YAML file                           |
| `/health/live`  | "Is the Express server running?"     | `200 OK`                              |
| `/health/ready` | "Can the API use MongoDB right now?" | `200 OK` or `503 Service Unavailable` |

`/docs`, `/health/live`, and `/health/ready` do **not** use the
`/api/v2` prefix. All blog API endpoints do. For example, registration is:

```text
POST http://localhost:3000/api/v2/auth/register
```

## How to use the API reference

1. Open `/docs`.
2. Choose an endpoint, such as **POST /auth/register**.
3. Read the short description and example body.
4. For protected endpoints, click the lock icon and paste only an **access
   token**. Do not paste a password, refresh token, or `.env` secret.
5. Click **Send** to make a test request.

Start with registration and login. A successful login returns an access token.
Copy that token into the lock icon before trying endpoints such as `GET /blogs`.

### Simple example with curl

This creates an account. Replace the email and password with your own test
values. The password must be at least eight characters long.

```powershell
curl.exe -X POST http://localhost:3000/api/v2/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"learner@example.com","password":"safe-password-123"}'
```

After login, use the token like this:

```powershell
curl.exe http://localhost:3000/api/v2/blogs `
  -H "Authorization: Bearer PASTE_YOUR_ACCESS_TOKEN_HERE"
```

The text after `Bearer` is your access token. Keep it private, just like a
password.

## What the OpenAPI file means

`docs/openapi.yaml` is an **OpenAPI 3.1 document**. It is a precise list of
the API's URLs, inputs, and possible responses. Scalar reads it to build
`/docs`.

YAML is a text format for nested information. Spaces show what belongs inside
what. Never use tabs in YAML.

```yaml
summary: Create an account
responses:
  '201':
    description: The account was created
```

Read that as: this endpoint has the short title "Create an account" and may
return status `201` with the stated meaning. A colon separates a name from its
value. Two spaces move one level deeper. A dash starts a list item.

Inside the OpenAPI file:

- `paths` contains URLs, such as `/auth/login`.
- `get`, `post`, `put`, and `delete` describe the HTTP action.
- `requestBody` describes data you send.
- `responses` describes data or status codes you receive.
- `components` stores reusable shapes. `$ref` means "use that shared shape".
- `security` means an access token is required.

## Request flow in simple words

1. A browser, Postman, or curl sends a request to the server.
2. `request_context.ts` gives the request a tracking number named
   `X-Request-Id`.
3. `request_logger.ts` records a safe summary after the response is sent.
   It does not record request bodies, cookies, passwords, or tokens.
4. Express runs security middleware and then the selected API route.
5. The route sends a JSON response.
6. The logger records the method, path, status code, time taken, and request
   ID.

## Check that the server is healthy

Use these commands in PowerShell:

```powershell
curl.exe -i http://localhost:3000/health/live
curl.exe -i http://localhost:3000/health/ready
```

- `live` returning `200` means Express can answer requests.
- `ready` returning `200` means MongoDB is connected too.
- `ready` returning `503` means check MongoDB and `MONGO_URI`.

## Common problems

| Problem                                               | What to check                                                                                                      |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `Cannot find module '@/config'` after `npm run start` | Run `npm run build` again. The build now rewrites TypeScript aliases for Node.js.                                  |
| `/docs` is blank                                      | Restart the server after pulling these changes, then open `/openapi.yaml`. It should show YAML, not an error page. |
| `401 Unauthorized`                                    | Log in again and use the new access token in the lock icon or `Authorization` header.                              |
| `403 Forbidden`                                       | Your token is valid, but the endpoint requires an admin account.                                                   |
| `400 Bad Request`                                     | Compare your request body with the example shown in `/docs`.                                                       |
| `503` from readiness                                  | Start MongoDB and check `MONGO_URI` in `.env`.                                                                     |

## Safe habits

- Use fake test accounts while learning.
- Never commit `.env` or copy real tokens into screenshots.
- Keep examples short and use obvious placeholder text such as
  `PASTE_YOUR_ACCESS_TOKEN_HERE`.
- Update `docs/openapi.yaml` whenever you add, rename, or remove an endpoint.
