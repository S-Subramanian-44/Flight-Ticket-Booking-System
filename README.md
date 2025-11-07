# 🚀 Flight Ticket Booking System

This is a full-stack flight booking application built with a FastAPI backend, React frontend, and a SQLite database. It features a complete user and admin authentication system using JWT, allowing admins to manage flights and users to book them.

---

## ✨ Features

* **User Authentication:** Secure user registration and login using JWT.
* **Admin Role:** Separate admin registration using a secret key.
* **User Actions:**
    * View all available flights.
    * Book tickets for a flight.
    * View all personal bookings ("My Bookings").
    * Cancel their own bookings.
* **Admin Actions:**
    * All regular user actions.
    * Add new flights to the system.
    * Delete any flight (which automatically cascade-deletes all associated bookings).
    * Cancel *any* user's booking.
* **API Generation:** Automatically generates a Python SDK from the backend's OpenAPI spec.

---

## 🛠️ Tech Stack

* **Backend:** FastAPI, SQLAlchemy, SQLite, `python-jose` (for JWT), `bcrypt` (for password hashing).
* **Frontend:** React, React Router, React Context (for auth), Axios.
* **Testing:** Pytest.
* **SDK:** OpenAPI Generator.

---

## 📁 Project Structure

---

## ⚙️ 1. Setup and Installation

Follow these steps to set up the project locally.

### Prerequisites

* [Python 3.8+](https://www.python.org/)
* [Node.js and npm](https://nodejs.org/en/)
* [OpenAPI Generator CLI](https://openapi-generator.tech/docs/installation/)
    ```bash
    npm install @openapitools/openapi-generator-cli -g
    ```

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd flight-ticket-booking-system
```
### Step 2: Configure the Backend
## 1. Navigate to the backend folder:
 ```bash
 cd backend
```
## 2.Create and activate a virtual environment:

 ```bash
# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1

 ```bash
# macOS/Linux
python3 -m venv venv
source venv/bin/activate

Install Python dependencies:

 ```bash
pip install -r requirements.txt

(Optional) Configure Admin Secret: Open backend/auth.py and change the ADMIN_REGISTRATION_SECRET to your own secure key.

Initialize the Database: This step is mandatory. It creates your flights.db file with all the correct tables.

 ```bash
python init_db.py
Note: If you ever change backend/models.py, you must delete flights.db and run this command again.

Step 3: Configure the Frontend
Navigate to the frontend folder:

 ```bash
# From the root directory
cd frontend
Install Node dependencies:

 ```bash
npm install

🖥️ 2. Running the Application
For the best debugging experience, run the backend and frontend in two separate terminals.

Terminal 1: Run the Backend (FastAPI)
Navigate to the backend/ folder.

Activate your virtual environment (.\venv\Scripts\Activate.ps1).

Start the server:

 ```bash
uvicorn main:app --reload --port 8000

Your backend is now running at http://localhost:8000. You can view the API docs at http://localhost:8000/docs.

Terminal 2: Run the Frontend (React)
Navigate to the frontend/ folder.

Start the app:

 ```bash
npm start
Your browser will automatically open to http://localhost:3000.

🧑‍💻 How to Register as an Admin
Go to the application at http://localhost:3000.

Click "Need an account? Register".

Fill in your email and a valid password.

In the "Admin Secret (optional)" field, enter the secret key from backend/auth.py (default: super-secret-admin-key).

Click Register.

You will be returned to the login page. Log in with your new admin account.

The "Admin Controls" panel will now be visible on your dashboard.

🧪 3. Running Unit Tests
The backend comes with a full pytest suite.

Navigate to the backend/ folder.

Activate your virtual environment.


Run pytest:

 ```bash
pytest
The tests will run against a separate, temporary test.db file and will not affect your main database.

📦 4. SDK Generation & Demo
You can generate a Python client to interact with your API.

Step 1: Regenerate the SDK
Any time you change your API (e.g., add new endpoints in main.py), you must regenerate the SDK.

Make sure your backend server is running (uvicorn main:app --port 8000).

From the project root folder, delete the old SDK:

 ```bash
Remove-Item -Recurse -Force flight_sdk
Run the generator:

 ```bash
openapi-generator-cli generate -i http://localhost:8000/openapi.json -g python -o flight_sdk

Step 2: Run the SDK Demo Script
The sdk_demo/ folder contains a script that registers an admin, logs in, adds a flight, and deletes it.

Navigate to the sdk_demo/ folder.

Create and activate a virtual environment:

 ```bash
python -m venv venv
.\venv\Scripts\Activate.ps1

Install the requirements (this also installs your local flight_sdk):


 ```bash
pip install -r requirements.txt
Run the demo (make sure your backend is running!):


 ```bash
python demo.py


write this excat readme in this file (See <attachments> above for file contents. You may not need to search or read the file again.)
# 🚀 Flight Ticket Booking System

This is a full-stack flight booking application built with a FastAPI backend, React frontend, and a SQLite database. It features a complete user and admin authentication system using JWT, allowing admins to manage flights and users to book them.

---

## ✨ Features

* **User Authentication:** Secure user registration and login using JWT.
* **Admin Role:** Separate admin registration using a secret key.
* **User Actions:**
    * View all available flights.
    * Book tickets for a flight.
    * View all personal bookings ("My Bookings").
    * Cancel their own bookings.
* **Admin Actions:**
    * All regular user actions.
    * Add new flights to the system.
    * Delete any flight (which automatically cascade-deletes all associated bookings).
    * Cancel *any* user's booking.
* **API Generation:** Automatically generates a Python SDK from the backend's OpenAPI spec.

---

## 🛠️ Tech Stack

* **Backend:** FastAPI, SQLAlchemy, SQLite, `python-jose` (for JWT), `bcrypt` (for password hashing).
* **Frontend:** React, React Router, React Context (for auth), Axios.
* **Testing:** Pytest.
* **SDK:** OpenAPI Generator.

---

## 📁 Project Structure

---

## ⚙️ 1. Setup and Installation

Follow these steps to set up the project locally.

### Prerequisites

* [Python 3.8+](https://www.python.org/)
* [Node.js and npm](https://nodejs.org/en/)
* [OpenAPI Generator CLI](https://openapi-generator.tech/docs/installation/)
    ```bash
    npm install @openapitools/openapi-generator-cli -g
    ```

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd flight-ticket-booking-system
```

### Step 2: Configure the Backend
Navigate to the backend folder:
