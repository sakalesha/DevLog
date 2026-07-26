# 🚀 DevLog — Developer Learning Journal & Activity Studio

A full-stack editorial platform designed for developers to record, categorize, and reflect on their daily learning entries. Built with Swiss Modernism 2.0 aesthetics, interactive code syntax highlighting, GitHub-style activity matrices, and native Markdown ingestion.

---

## ✨ Features

- **📰 Editorial Blog Layout**: Effortless reading experience (~700px reading width, 1.85 line height, high-contrast headings, and dynamic progress tracking).
- **📝 Smart Rich Editor**: Powered by ReactQuill with **native Markdown auto-detection**. Paste markdown headers, bullet lists, inline code snippets (`` `code` ``), or GitHub alerts (`> [!IMPORTANT]`), and watch them convert instantly into formatted rich text.
- **🛡️ Bulletproof List & Alert Styling**: Custom CSS markers (`•` and decimals) ensure bullet points and numbered lists never disappear in the reading view.
- **🔥 GitHub-Style Activity Matrix**: Track continuous learning intensity across days with interactive filters, search, and sorting.
- **📋 "Copy Cheat Sheet" Export**: Instantly export any learning log into formatted Markdown outline for presentations, slide decks, or documentation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Vanilla CSS + TailwindCSS, ReactQuill, Marked, Highlight.js, Lucide Icons |
| **Backend** | Node.js, Express, TypeScript, Mongoose (MongoDB), JSON Web Tokens (JWT), BcryptJS, Helmet |

---

## 📦 Prerequisites & System Requirements

To install and run DevLog locally, make sure you have the following installed on your system:
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)
- **MongoDB** (Local instance running on `mongodb://127.0.0.1:27017` or a MongoDB Atlas Cloud URI)

---

## 🚀 Installation & Setup Instructions

Unlike Python projects that use a `requirements.txt` file, Node.js applications manage dependencies via `package.json`. Follow these exact steps to install packages for both the server and the client:

### 1. Backend Server Setup
The backend API handles authentication, learning entry persistence, streak calculations, and category management.

```bash
cd server
npm install
```

**Environment Variables (`server/.env`):**
Create a `.env` file inside the `server/` folder (if not already present) with the following configuration:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/devlog
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

**Run Backend in Development Mode:**
```bash
npm run dev
```
*The API server will start on `http://localhost:5000`.*

---

### 2. Frontend Client Setup
The client is a Vite-powered React single-page application.

Open a new terminal window and navigate to the client folder:
```bash
cd client
npm install
```

**Run Frontend in Development Mode:**
```bash
npm run dev
```
*The UI will be accessible at `http://localhost:5173`.*

---

## 📋 Available Scripts

### In `/server`:
- `npm run dev` — Start backend with `nodemon` and TypeScript hot-reload.
- `npm run build` — Compile TypeScript source code into `/dist`.
- `npm start` — Run production server from `/dist/server.js`.

### In `/client`:
- `npm run dev` — Start Vite development server.
- `npm run build` — Compile and bundle production static assets into `/dist`.
- `npm run preview` — Preview the production build locally.

---

## 💡 Markdown Ingestion & Normalization

DevLog features a **Universal Markdown Normalizer**:
1. **While Editing**: When you paste raw markdown (e.g. from ChatGPT, GitHub, or VS Code) into the editor box, a capture-phase listener intercepts the clipboard and converts markdown headers, lists, code blocks, and GitHub callout badges (`[!IMPORTANT]`, `[!NOTE]`, `[!TIP]`) into rich text.
2. **While Reading**: If any legacy entries in your database were saved as raw markdown strings, the reading view automatically detects unparsed headers (`# `) or bullet lists (`- `) and parses them dynamically before rendering.
