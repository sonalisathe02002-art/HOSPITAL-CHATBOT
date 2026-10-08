# AuraCare Health — AI Hospital Customer Support & Management System

> **A luxury private-hospital web application with a 24/7 AI Virtual Concierge, doctor directory, department showcase, real-time appointment booking system with double-booking prevention, patient dashboard, and full administrative governance.**

---

## 🌟 Technology Stack

- **Frontend**: React 19 + Vite 8 + Tailwind CSS (v4 via `@tailwindcss/vite`) + Lucide Icons + Axios + React Router DOM
- **Backend**: Python 3.14 + FastAPI + Pydantic v2
- **Database**: SQLite + SQLAlchemy ORM (auto-seeded with realistic hospital data)
- **Security**: JWT Authentication (PyJWT) + Direct Bcrypt Password Hashing
- **AI Concierge**: Dual-Mode Architecture:
  - **Live AI Model**: Configurable Google Gemini / OpenAI API key via `AI_API_KEY` in `.env`
  - **Intelligent Local Knowledge Engine**: Automatically activates when no API key is provided or if network fails, delivering accurate context-aware responses directly from the live database.

---

## 🚀 Quick Start Guide

### 1. Backend Setup & Run

Open a terminal in the project directory:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The FastAPI backend server will start at: **`http://127.0.0.1:8000`**
Interactive Swagger API documentation: **`http://127.0.0.1:8000/docs`**

---

### 2. Frontend Setup & Run

Open a second terminal in the project directory:

```powershell
cd frontend
npm install
npm run dev
```

The modern React application will launch at: **`http://127.0.0.1:5173`**

---

## 🔑 Demo Accounts (One-Click Login on UI)

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@hospital.com` | `patient123` | Patient dashboard, booking appointments, viewing consultation history, rescheduling, cancelling, personal profile |
| **Administrator** | `admin@hospital.com` | `admin123` | Operational stats, managing appointments, adding/editing/deleting specialist doctors and clinical departments |

*Note: You can also register a new patient account directly through the registration screen.*

---

## 🏥 Key Features

### 1. Premium Private-Hospital Landing Page
- Rich medical aesthetic with dark/slate gradients, ambient lighting, and Google Fonts typography (`Outfit` + `Plus Jakarta Sans`).
- Emergency trauma callout banner (1-800-AURACARE / 911).
- Quick doctor & department search bar.
- Interactive department showcase and featured specialist directory.
- Hospital services portfolio (Emergency, 3T MRI, Robotic Surgery, ICU, Pharmacy, Telehealth).

### 2. Dual-Engine AI Hospital Concierge ("Aura AI")
- **Live on Every Page**: Accessible via floating widget or full-page chat interface (`/chat`).
- Answers questions about hospital departments, specialist doctor qualifications, consultation fees, visiting hours (10AM–12PM & 4PM–7PM), parking, and insurance.
- **Suggested Question Chips & Quick Buttons**: One-click prompt triggers.
- **Direct Appointment Integration**: Triggers the interactive booking modal directly from chat prompts.
- **Safety Disclaimers**: Strict medical triage notice and emergency hotline advice without giving medical diagnoses.
- **Zero-Config Local Fallback**: Works immediately out of the box without requiring paid external API keys.

### 3. Online Appointment Booking System
- Multi-step booking flow: **Department → Doctor → Date → Live Available Time Slot → Symptoms/Reason → Confirmation**.
- **Double Booking Prevention**: Automatically detects conflicting bookings for the same specialist and date/time slot, returning HTTP 409 Conflict.
- Generates unique appointment tracking codes (e.g. `APT-2026-9812`).
- Integrated appointment rescheduling and cancellation workflows.

### 4. Patient Dashboard
- Personalized welcome banner with Medical Record Number (MRN) and blood group indicator.
- Upcoming appointment spotlight with quick reschedule & cancel actions.
- Recent consultation history table.
- One-click shortcuts to book appointments, open AI concierge, and review hospital services.

### 5. Administrative Dashboard
- Real-time statistics: Total patients, specialists, departments, total bookings, today's appointments, and status breakdown.
- Appointment governance: Update status between `pending`, `confirmed`, `completed`, and `cancelled`.
- Specialist Management: Add new doctors, edit existing schedules/fees, delete doctors.
- Department Governance: Add/edit departments, floor locations, and department heads.
- Patient Records: Comprehensive roster of registered patient profiles.

---

## ⚙️ Environment Variables

Located in `backend/.env` (sample provided in `backend/.env.example`):

```ini
PROJECT_NAME="AuraCare Health AI System"
DATABASE_URL="sqlite:///./hospital.db"
SECRET_KEY="auracare_super_secret_jwt_key_98374982734982734"
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# AI Provider Configuration
# Optional: Add your Google Gemini or OpenAI API Key below.
# If left empty, the intelligent local hospital knowledge fallback engine is active.
AI_API_KEY=""
AI_PROVIDER="gemini"
AI_MODEL="gemini-1.5-flash"
```

---

## 📊 Database Schema Models

- **`User`**: Patient and Admin profiles, credentials, contact information, blood group, emergency contact.
- **`Department`**: Clinical departments, floor location, head of department, contact extension, emergency flag.
- **`Doctor`**: Medical specialists, department foreign key, qualification, experience, consultation fee, available days, time slots, portrait photo, rating.
- **`Appointment`**: Unique code, patient ID, doctor ID, department ID, date, time slot, status, reason, notes.
- **`HospitalService`**: Institutional capabilities, category, availability, pricing tier, icons.
- **`ChatSession` & `ChatMessage`**: Conversation memory and session histories.
- **`Notification`**: System alerts for booking confirmations, lab results, and cancellations.
