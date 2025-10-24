# StudyBuddy AI - AI-Powered Educational Assistant

## Problem Statement

Many students struggle with exam preparation due to:
- Limited access to personalized tutoring
- Difficulty understanding complex topics
- Lack of immediate feedback on their understanding
- Time constraints in getting help from teachers
- Anxiety and stress during exam preparation

**Target Users**: High school and university students preparing for exams across various subjects.

## Solution Overview

StudyBuddy AI is an intelligent chatbot that provides:
- **Personalized Learning Support**: AI-powered explanations tailored to student's level
- **24/7 Availability**: Instant help anytime, anywhere
- **Interactive Q&A**: Natural conversation interface for asking questions
- **Study Session Tracking**: Monitor learning progress over time
- **Multi-Subject Support**: Help across mathematics, sciences, humanities, and more

## Technology Stack

### Backend
- **Python 3.11+**: Core programming language
- **FastAPI**: Modern, high-performance web framework
- **PostgreSQL**: Relational database for user and session data
- **SQLAlchemy**: ORM for database operations
- **OpenAI API**: GPT-4 for advanced AI responses
- **Pydantic**: Data validation and settings management

### Frontend
- **React 18**: Modern UI library
- **Vite**: Fast build tool
- **TailwindCSS**: Utility-first CSS framework
- **Axios**: HTTP client for API communication

### DevOps
- **Docker & Docker Compose**: Containerization

## Project Architecture

```
┌─────────────┐
│   Frontend  │  (React + Vite)
│  (Port 5173)│
└──────┬──────┘
       │
       │ HTTP/REST
       ▼
┌─────────────┐
│  Backend    │  (FastAPI)
│  (Port 8000)│
└──────┬──────┘
       │
       ├──────► OpenAI API (GPT-4)
       │
       └──────► PostgreSQL DB (Port 5432)
```

## Features

### Implemented Features
1. **Intelligent Chat Interface**: Natural language conversation with AI
2. **Context-Aware Responses**: AI remembers conversation context
3. **User Management**: Registration and authentication system
4. **Session History**: Track all study sessions and conversations
5. **Subject Categorization**: Organize questions by subject area
6. **Response Quality Analysis**: AI evaluates its own response quality

## Installation & Setup

### Prerequisites
- Python 3.11 or higher
- Node.js 18+ and npm
- PostgreSQL 15+
- OpenAI API key

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
```bash
cd "/Users/arsenflorykian/Desktop/tryes/GLP/2 Indywidualny projekt "
```

2. **Create environment file**
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

3. **Start all services**
```bash
docker-compose up -d
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Initialize database**
```bash
python -m app.db.init_db
```

6. **Run the backend server**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env if needed
```

4. **Run the development server**
```bash
npm run dev
```


### API Documentation

Full API documentation is available at `/docs` (Swagger UI) when the backend is running.

Key endpoints:
- `POST /api/auth/register`: Create new user account
- `POST /api/auth/login`: Authenticate user
- `POST /api/chat/message`: Send message to AI
- `GET /api/chat/sessions`: Retrieve chat history
- `GET /api/users/profile`: Get user profile


## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── core/          # Core configuration
│   │   ├── db/            # Database models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   └── main.py        # Application entry
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom hooks
│   │   └── App.jsx        # Main component
│   └── package.json
├── docker-compose.yml
└── README.md
```