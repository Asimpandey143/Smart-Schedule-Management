# 🎓 Smart Classroom & College ERP System

A comprehensive web-based College ERP system designed to streamline academic and administrative processes for Students, Faculty, and Administrators. This project features role-based access control, real-time notifications, leave management, and an AI-powered academic assistant.

## 🚀 Key Features

### 🔐 Authentication & Roles
*   **Secure Login:** JWT-based authentication with encrypted passwords.
*   **Role-Based Access Control (RBAC):** Distinct dashboards and features for:
    *   **Admin:** Full system control, user management, timetable scheduling, and analytics.
    *   **Faculty:** Class management, attendance marking, material uploads, and leave applications.
    *   **Student:** View timetables, track attendance, access study materials, apply for leave, and interact with the AI chatbot.

### 📚 Core Modules
1.  **Dashboard Analytics:** Real-time statistics on students, faculty, and system usage.
2.  **Timetable Management:** Dynamic scheduling for classes and labs.
3.  **Attendance System:** Digital attendance tracking with subject-wise reports.
4.  **Study Materials:** Faculty can upload resources (PDFs, images) for students to download.
5.  **Announcements:** Targeted notices for specific departments, years, or everyone.

### ✨ Advanced Features
*   **🍃 Leave Management System:**
    *   Students & Faculty can apply for various leaves (Medical, Casual, OD).
    *   Admins approve/reject requests with comments.
    *   Transparent history tracking and status updates.
*   **🤖 AI Academic Chatbot:**
    *   Integrated with **Google Gemini AI**.
    *   Answers academic queries and provides instant assistance.
*   **🔔 Notification System:**
    *   Real-time alerts for leave status updates, new announcements, and system events.
    *   Notification center with read/unread status and history clearing.

## 🛠️ Technology Stack

*   **Frontend:** React.js, Vite, Tailwind CSS, React Router, Axios, React Icons.
*   **Backend:** Node.js, Express.js.
*   **Database:** MongoDB.
*   **AI Integration:** Google Generative AI (Gemini).
*   **Tools:** Multer (File Uploads), Nodemon, Concurrently.

## 📦 Installation & Setup

### Prerequisites
*   Node.js (v14 or higher)
*   MongoDB (Local or Atlas)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Fsd pRoject 2
```

### 2. Install Dependencies
Install packages for both Client and Server:
```bash
# Server
cd server
npm install

# Client (Open new terminal)
cd ../client
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `server` directory:
```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/smartclassroom
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_google_ai_key
```

### 4. Run the Application
**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm run dev
```

## 👥 Contributors
Developed by **Priya Chaudhary** as a Full Stack Development Project.

---

### 📦 Notes for the Friend (Setup Instructions)
If you just received this project as a ZIP file, follow these steps to get it running:

1.  **Install Dependencies:** Run `npm install` inside both the `client` and `server` folders to install all necessary packages.
2.  **Database Setup:** Ensure you have MongoDB installed locally. You can seed the initial data by running `node seed_all_data.js` inside the `server` folder.
3.  **Environment Variables:** 
    *   Go to the `server` folder.
    *   Rename `.env.example` to `.env`.
    *   Update the `GEMINI_API_KEY` if you want to use the AI chatbot features.
4.  **Run:** Open two terminals:
    *   Terminal 1 (Server): `cd server && npm run dev`
    *   Terminal 2 (Client): `cd client && npm run dev`










    cd "Fsd pRoject 2/Fsd pRoject 2/client"
    npm install
     npm run dev 


cd "Fsd pRoject 2/Fsd pRoject 2/server", npm install, then npm run dev.