# Portfolio Serverless API & Admin Backend

A standalone, high-performance Node.js & Express serverless backend designed for Vercel deployment. Handles contact form submissions, MongoDB Atlas persistence, automated Gmail SMTP thank-you email dispatches, and a protected Google OAuth Admin Showcase control center.

---

## 🌟 Key Features

- **Serverless Architecture**: Engineered with Express and pre-configured with `vercel.json` for seamless Vercel Serverless Functions deployment.
- **MongoDB Atlas Integration**: Optimized with Mongoose connection pooling for serverless cold-start efficiency.
- **Automated Gmail SMTP Mailer**: Dispatches an instant HTML thank-you confirmation email to contact submitters (*"Thank you for connecting with Prem Raj! We will message you shortly"*) and sends a notification alert to the administrator.
- **Google OAuth Admin Authentication**: Verifies Google OAuth ID Tokens via `google-auth-library` and issues JWT session tokens for allowed admin emails (`ADMIN_EMAILS`).
- **Admin Showcase Data Control**: Private API endpoints (`GET`, `PATCH`, `DELETE`) for searching, filtering, updating status, and managing user contact inquiries.

---

## 📂 Project Structure

```
api/
├── config/
│   └── db.js            # MongoDB Atlas connection helper with connection pooling
├── middleware/
│   └── auth.js          # Admin JWT & email authorization middleware
├── models/
│   └── Contact.js       # Contact submission Mongoose schema
├── routes/
│   ├── admin.js         # Google OAuth login & admin contact management routes
│   └── contact.js       # Public contact submission & mailer dispatch route
├── services/
│   └── mailer.js        # Gmail SMTP Nodemailer service for automated notifications
├── .env.example         # Environment variable template
├── .gitignore           # Git ignore file for secrets and dependencies
├── index.js             # Express app entrypoint & local development server
├── package.json         # Project dependencies and scripts
└── vercel.json          # Vercel serverless routing configuration
```

---

## 🚀 Environment Configuration

Create a `.env` file in the `api` root directory based on `.env.example`:

```env
# Server Port & Client URL
PORT=5000
CLIENT_URL=http://localhost:3000

# MongoDB Atlas Connection URI
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/portfolio?retryWrites=true&w=majority

# Gmail SMTP Email Dispatch (App Password)
GMAIL_USER=web.premraj@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# Google OAuth Admin Authentication
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_super_secret_jwt_key
ADMIN_EMAILS=web.premraj@gmail.com
```

---

## 🛠️ API Endpoints Summary

### Public Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint |
| `POST` | `/api/contact` | Submits contact data, saves to MongoDB Atlas, and dispatches automated thank-you email |

### Admin Protected Endpoints (Requires Google Auth / Bearer Token)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/admin/login` | Authenticates Google OAuth ID Token & returns JWT session token |
| `GET` | `/api/admin/contacts` | Retrieves list of all user inquiries, stats overview, and domain distribution |
| `PATCH` | `/api/admin/contacts/:id` | Toggles inquiry read/unread status |
| `DELETE` | `/api/admin/contacts/:id` | Deletes an inquiry record |

---

## 💻 Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Server in Watch Mode**:
   ```bash
   npm run dev
   ```
   The API server will run at `http://localhost:5000`.

---

## ☁️ Deployment on Vercel

1. Push this repository or import the `api` folder into [Vercel](https://vercel.com).
2. Configure Environment Variables in the Vercel Project Settings (`MONGODB_URI`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `JWT_SECRET`, `ADMIN_EMAILS`).
3. Vercel automatically detects `vercel.json` and builds `index.js` as a Serverless Function.
