# Campus Lost & Found

An intelligent lost and found platform designed for university campuses. This full-stack MERN application helps reunite owners with their lost belongings through a user-friendly interface, automated item matching, and real-time notifications.

<!-- ![Campus Found Screenshot](https://raw.githubusercontent.com/earlhsjks/campus-lost-found/main/docs/app-screenshot.png) -->

## Key Features

*   **Dual Reporting System:** Users can report items as either 'lost' or 'found', with distinct forms and UI cues for each case.
*   **Intelligent Item Matching:** A background worker powered by a Redis queue automatically compares new items against existing ones. A scoring algorithm evaluates matches based on:
    *   Category (e.g., Electronics, Apparel)
    *   Location (e.g., Teston Hall, Gymnasium)
    *   Date proximity (lost/found date)
    *   Text similarity in titles and descriptions
    *   Shared attributes like color and brand
    *   Exact match on serial numbers for high-confidence pairing
*   **Real-time Notifications:** A notification system alerts users to key events, including potential matches for their items, new claims, and claim status updates (approved/rejected).
*   **Claim & Review Workflow:** Item reporters can review, approve, or reject claims made by other users, with a dedicated panel to manage the process.
*   **Live Discussion:** Each item has a dedicated chat/comment thread to facilitate communication and coordinate a safe return between the finder and potential owners.
*   **Image Uploads:** Users must upload a photo of the item, which is handled and optimized by Cloudinary.
*   **Secure Authentication:** A custom session management system using httpOnly cookies provides secure user authentication for reporting and claiming items.

## Technologies Used

This project is a monorepo containing a React client and a Node.js server.

*   **Frontend:**
    *   **Framework:** React (with Vite)
    *   **Styling:** Tailwind CSS
    *   **UI Components:** Custom reusable components, heavily inspired by shadcn/ui.
    *   **Animation:** Framer Motion
    *   **Routing:** React Router
    *   **State Management:** React Context API
    *   **HTTP Client:** Axios

*   **Backend:**
    *   **Framework:** Node.js with Express.js
    *   **Database:** MongoDB with Mongoose ODM
    *   **Authentication:** `bcryptjs` for password hashing and a custom cookie-based session system.
    *   **Image Handling:** Cloudinary for cloud storage and optimization, with Multer for upload handling.
    *   **Background Jobs:** Bull message queue with Redis (`ioredis`) for asynchronous item matching.
    *   **CORS:** Configured for secure cross-origin requests.

*   **Infrastructure:**
    *   **Database:** MongoDB Atlas
    *   **Queue/Cache:** Redis (e.g., Upstash)
    *   **Deployment:** Vercel (for frontend and serverless functions)

## Project Structure

The repository is organized as a monorepo with distinct `client` and `server` directories.

```
/
├── client/          # Vite + React frontend application
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/  # Reusable UI components (PostCard, Navbar, etc.)
│       ├── context/     # Global state management (AuthContext, FeedContext)
│       ├── pages/       # Route-level components (Home, ItemDetails, etc.)
│       └── services/    # API and authentication services
│
└── server/          # Express.js backend API
    ├── src/
    │   ├── config/      # DB, Cloudinary, and Redis configuration
    │   ├── controllers/ # Business logic for each route
    │   ├── middleware/  # Authentication and protection logic
    │   ├── models/      # Mongoose schemas for data modeling
    │   ├── routes/      # API endpoint definitions
    │   ├── utils/       # Shared utilities (matching algorithm, permissions)
    │   └── workers/     # Background job processors (matching, cleanup)
    └── server.js      # Main server entry point
```

## Local Development

To run this project locally, you will need Node.js, `npm`, a MongoDB database, a Redis instance, and a Cloudinary account.

### 1. Prerequisites

*   Node.js (v20.19.0 or later)
*   `npm` or a compatible package manager
*   Access to a MongoDB database (e.g., a free tier on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
*   Access to a Redis instance (e.g., a free tier on [Upstash](https://upstash.com/))
*   A [Cloudinary](https://cloudinary.com/) account for image storage.

### 2. Backend Setup

1.  Navigate to the server directory:
    ```bash
    cd server
    ```

2.  Install the required dependencies:
    ```bash
    npm install
    ```

3.  Create a `.env` file in the `server/` directory and populate it with your credentials. See the [Environment Variables](#environment-variables) section below for details.

4.  Start the development server:
    ```bash
    npm run dev
    ```
    The backend API will be available at `http://localhost:5000`.

### 3. Frontend Setup

1.  Open a new terminal and navigate to the client directory:
    ```bash
    cd client
    ```

2.  Install the required dependencies:
    ```bash
    npm install
    ```

3.  Start the Vite development server:
    ```bash
    npm run dev
    ```
    The frontend application will be available at `http://localhost:5173`.

## Environment Variables

Create a `.env` file in the `server` directory and add the following variables:

```ini
# MongoDB Connection String
MONGO_URI=your_mongodb_connection_string

# Redis Connection URL (for Bull Queue)
REDIS_URL=your_redis_connection_url

# Cloudinary Credentials
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
```

## Academic Context
This project was developed as part of a course requirement for ITPC 115 at Notre Dame of Marebel Univesity.

## Contributors
* [Zawaaaa111](https://github.com/Zawaaaa111)
* [Jezzy11](https://github.com/Jezzy11)
* [medecilo1204-gif](https://github.com/medecilo1204-gif)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
