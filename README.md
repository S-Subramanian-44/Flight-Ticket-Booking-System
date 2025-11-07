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
```bash
