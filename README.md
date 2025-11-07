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

- **flight-ticket-booking-system/**
  - **backend/**
    - **tests/**
      - `test_main.py`
    - `auth.py`
    - `database.py`
    - `init_db.py`
    - `main.py`
    - `models.py`
    - `requirements.txt`
    - `schemas.py`
  - **frontend/**
    - **src/**
      - **components/**
      - **context/**
      - **pages/**
      - `App.js`
    - `package.json`
  - **sdk_demo/**
    - `demo.py`
    - `requirements.txt`
  - **scripts/**
    - `setup.sh` / `setup.ps1`
    - `run.sh` / `run.ps1`
  - `.gitignore`
  - `README.md`

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
git clone https://github.com/S-Subramanian-44/Flight-Ticket-Booking-System
cd flight-ticket-booking-system
```
### Step 2: Configure the Backend
 1. Navigate to the backend folder:
 ```bash
 cd backend
```
 2.  Create and activate a virtual environment:

 ```bash
# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1
```

 ```bash
# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```
 3. Install Python dependencies:

 ```bash
pip install -r requirements.txt
```
 4. (Optional) Configure Admin Secret: Open `backend/auth.py` and change the `ADMIN_REGISTRATION_SECRET` to your own secure key.

 5. Initialize the Database: This step is mandatory. It creates your flights.db file with all the correct tables.

 ```bash
python init_db.py
```
   Note: If you ever change `backend/models.py`, you must delete `flights.db` and run this command again.
### Step 3: Configure the Frontend
 1. Navigate to the frontend folder:

 ```bash
# From the root directory
cd frontend
```
 2. Install Node dependencies:

 ```bash
npm install
```
---
## 🖥️ 2. Running the Application
For the best debugging experience, run the backend and frontend in two separate terminals.

### Terminal 1: Run the Backend (FastAPI)
 1. Navigate to the `backend/` folder.

 2. Activate your virtual environment (`.\venv\Scripts\Activate.ps1`).

 3. Start the server:

 ```bash
uvicorn main:app --reload --port 8000
```
Your backend is now running at `http://localhost:8000`. You can view the API docs at `http://localhost:8000/docs`.

### Terminal 2: Run the Frontend (React)
 1. Navigate to the `frontend/` folder.

 2. Start the app:

 ```bash
npm start
```
   Your browser will automatically open to `http://localhost:3000`.

### 🧑‍💻 How to Register as an Admin
 1. Go to the application at `http://localhost:3000`.

 2. Click "Need an account? Register".

 3. Fill in your email and a valid password.

 4. In the "Admin Secret (optional)" field, enter the secret key from `backend/auth.py` (default: `super-secret-admin-key`).

 5. Click Register.

 6. You will be returned to the login page. Log in with your new admin account.

 7. The "Admin Controls" panel will now be visible on your dashboard.

## 🧪 3. Running Unit Tests
The backend comes with a full `pytest` suite.

 1. Navigate to the `backend/` folder.

 2. Activate your virtual environment.
 
 3. Run `pytest`:

 ```bash
pytest
```
The tests will run against a separate, temporary `test.db` file and will not affect your main database.

## 📦 4. SDK Generation & Demo
You can generate a Python client to interact with your API.

### Step 1: Regenerate the SDK
Any time you change your API (e.g., add new endpoints in `main.py`), you must regenerate the SDK.

 1. Make sure your backend server is running (`uvicorn main:app --port 8000`).

 2. From the project root folder, delete the old SDK:

 ```bash
Remove-Item -Recurse -Force flight_sdk
```
 3. Run the generator:

 ```bash
openapi-generator-cli generate -i http://localhost:8000/openapi.json -g python -o flight_sdk
```
### Step 2: Run the SDK Demo Script
The `sdk_demo/` folder contains a script that registers an admin, logs in, adds a flight, and deletes it.

 1. Navigate to the `sdk_demo/` folder.

 2. Create and activate a virtual environment:

 ```bash
python -m venv venv
.\venv\Scripts\Activate.ps1
```
 3. Install the requirements (this also installs your local `flight_sdk`):

 ```bash
pip install -r requirements.txt
```

 4. Run the demo (make sure your backend is running!):


 ```bash
python demo.py
```
