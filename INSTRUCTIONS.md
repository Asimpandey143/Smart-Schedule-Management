# How to Run this Project

This project contains a **Client** (React), **Server** (Node/Express), and a **Local Database** (MongoDB).

## Prerequisites
1.  **Node.js** installed.
2.  **MongoDB Community Server** installed and running locally.

## Setup Instructions

### 1. Database Setup (CRITICAL for Logins)
To keep the same Login IDs and Passwords as the original project, you must run MongoDB using the provided data folder.

1.  Open a terminal in the `server` folder.
2.  Run this command:
    ```bash
    mongod --dbpath "./mongodb_data"
    ```
    *Keep this terminal OPEN. Do not close it.*

### 2. Backend Setup
1.  Open a **new** terminal.
2.  Navigate to the `server` folder: `cd server`
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Start the server:
    ```bash
    npm run dev
    ```
    *(It should say "Server running... on port 5001" and "MongoDB Connected")*

### 3. Frontend Setup
1.  Open a **new** terminal.
2.  Navigate to the `client` folder: `cd client`
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Start the React app:
    ```bash
    npm run dev
    ```
5.  Open the link shown (usually `http://localhost:5173`) in your browser.

## Troubleshooting
-   **Logins not working?** Make sure you ran the `mongod` command in step 1 correctly pointing to the `./mongodb_data` folder.
-   **API Errors?** Ensure the backend is running on `port 5001`.
