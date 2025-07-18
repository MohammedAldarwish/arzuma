# ArtConnect / SocialArt Platform

A fullstack social art platform empowering artists to connect, share, learn, and monetize their creativity.  
Built with a modern React frontend and a robust Django backend, featuring real-time chat, online courses, stories, and advanced media handling.

---

## 🚀 Features

### Frontend (React)

- **Modern SPA**: Fast, responsive, and mobile-first UI with smooth transitions.
- **State & Theme Persistence**: User preferences, scroll, and theme saved across sessions.
- **Art Feed**: Post, like, and comment on artworks.
- **Stories**: Upload and view 24-hour stories (with video trimming).
- **Online Courses**: Browse, enroll, and review courses; Stripe payments for paid content.
- **Real-time Chat**: 1:1 and group chat with WebSocket support.
- **Admin Panel**: Manage users, posts, and courses.
- **PWA**: Installable, offline support, and performance optimizations.
- **Accessibility**: ARIA, keyboard navigation, and responsive design.

### Backend (Django)

- **RESTful API**: JWT-authenticated endpoints for all features.
- **User System**: Registration, login, profiles, following, and permissions.
- **Art Posts**: CRUD for posts, likes, comments, and feed.
- **Stories**: Upload images/videos, automatic video trimming to 60s, expiry after 24h.
- **Courses**:
  - Instructors: Create/manage free or paid courses, lessons, and Stripe Connect payouts.
  - Students: Enroll, pay, and review courses.
  - Platform: 10% commission, advanced permissions.
- **Payments**: Stripe integration for secure payments and payouts.
- **Real-time**: Django Channels for chat and notifications.
- **Media Processing**: FFmpeg-powered video trimming and validation.
- **Robust Security**: Input validation, secure headers, and error boundaries.

---

## 🛠️ Tech Stack

- **Frontend**: React, React Router, Tailwind CSS, CRACO, PWA, Axios
- **Backend**: Django, Django REST Framework, Django Channels, SimpleJWT, Stripe, FFmpeg, Redis (for channels)
- **Database**: SQLite (dev) / PostgreSQL (prod-ready)
- **DevOps**: Docker-ready, Nginx, Gunicorn/Uvicorn

---

## 📁 Project Structure

```
arzuma/
  backend/         # Django backend (API, models, media, courses, stories, chat)
  SocialArt-FrontEnd/
    frontend/      # React frontend (SPA, PWA, UI components)
  nginx/           # Nginx config for deployment
```

---

## ⚡ Quickstart

### 1. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp env.example .env
# Edit .env for your DB/Stripe keys
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

- For video stories: Install FFmpeg (`sudo apt install ffmpeg`)
- For real-time features: Ensure Redis is running (`sudo apt install redis-server`)

### 2. Frontend Setup

```bash
cd SocialArt-FrontEnd/frontend
yarn install
yarn start
```

- The frontend will proxy API requests to the backend.

---

## 🔑 Environment Variables

**Backend** (`backend/.env`):

```
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=arzuma_db
DATABASE_USER=arzuma_user
DATABASE_PASSWORD=arzuma_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`SocialArt-FrontEnd/frontend/.env`):

```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=development
```

---

## 🧩 Key Modules

### Art Feed & Posts

- Post, like, comment, and view art in a social feed.
- Real-time updates via WebSockets.

### Stories

- Upload images/videos as stories.
- Videos are automatically trimmed to 60 seconds (see [`backend/story/README_VIDEO_TRIMMING.md`](backend/story/README_VIDEO_TRIMMING.md)).

### Online Courses

- Instructors can create/manage courses and lessons.
- Students can enroll, pay (Stripe), and review.
- See [`backend/courses/README.md`](backend/courses/README.md) for full API and model details.

### Real-time Chat

- 1:1 and group chat using Django Channels and WebSockets.

---

## 📝 API Overview

- **Accounts**: `/api/accounts/` (register, login, profile, follow)
- **Posts**: `/api/posts/` (art feed, comments, likes)
- **Stories**: `/api/stories/` (upload/view stories)
- **Courses**: `/api/courses/` (courses, lessons, enrollments, reviews)
- **Chat**: `/ws/` (WebSocket endpoints)

See backend/courses/README.md and backend/story/README_VIDEO_TRIMMING.md for detailed API usage.

---

## 🐳 Docker & Deployment

- Dockerfiles and Nginx config provided for production deployment.
- Example commands:
  ```bash
  docker-compose up --build
  ```
- For custom deployment, see `DEPLOYMENT.md`.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Make your changes (+ tests)
4. Submit a pull request

---

## 📄 License

MIT License

---

## 📚 References

- [`backend/courses/README.md`](backend/courses/README.md): Full online courses system documentation (Arabic)
- [`backend/story/README_VIDEO_TRIMMING.md`](backend/story/README_VIDEO_TRIMMING.md): Video trimming and story system (Arabic)

---

**ArtConnect** – Empowering artists through technology and community.
