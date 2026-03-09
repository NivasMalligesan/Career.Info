# 🎯 Career Analytic Platform

> A full-stack web application that analyzes user skills and provides personalized career recommendations, skill gap analysis, and career trend analytics.

![Java](https://img.shields.io/badge/Java-17-orange?logo=java)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-green?logo=springboot)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?logo=mysql)
![JWT](https://img.shields.io/badge/Auth-JWT-yellow)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38bdf8?logo=tailwindcss)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack & Architecture](#-tech-stack--architecture)
- [System Flow](#-system-flow)
- [Database Schema](#-database-schema)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Features](#-features)
- [Branching Strategy](#-branching-strategy)
- [Deployment](#-deployment)
- [Development Phases](#-development-phases)

---

## 📌 Project Overview

The **Career Analytic Platform** is a web application that helps users make informed career decisions by:

- Managing personal profiles and skills with proficiency levels
- Receiving AI-matched career recommendations based on current skills
- Analyzing skill gaps for desired career paths
- Viewing career trend analytics including market demand and salary data
- Providing admin tools to manage careers and skills in the system

---

## 🧰 Tech Stack & Architecture

### Why This Stack?

| Layer | Technology | Justification |
|---|---|---|
| **Frontend** | React.js 18 + Vite | Component-based UI, fast HMR, large ecosystem |
| **Styling** | Tailwind CSS | Utility-first, responsive design with minimal CSS |
| **State Management** | React Hooks + Context API | Lightweight, built-in, sufficient for app complexity |
| **HTTP Client** | Axios | Interceptors for JWT injection, clean API integration |
| **Backend** | Java Spring Boot 3 | Robust, enterprise-grade REST API with Spring Security |
| **Authentication** | JWT (JSON Web Tokens) | Stateless, scalable, no session storage needed |
| **Database** | MySQL 8.0 | Relational data with strong consistency for user/career relationships |
| **ORM** | Spring Data JPA + Hibernate | Reduces boilerplate, clean entity mapping |
| **Build Tool** | Maven | Dependency management and build lifecycle |

### Architecture Pattern

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT LAYER                      │
│   React.js (Vite) + Tailwind CSS + Axios             │
│   Port: 5173                                        │
└────────────────────────┬────────────────────────────┘
                         │  HTTP / REST API
                         │  JWT Bearer Token
┌────────────────────────▼────────────────────────────┐
│                   SERVER LAYER                       │
│   Spring Boot + Spring Security + Spring Data JPA    │
│   Port: 8080                                        │
│                                                     │
│   ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │
│   │  Controllers │→│  Services   │→│ Repositories│  │
│   └─────────────┘  └─────────────┘  └────────────┘  │
└────────────────────────┬────────────────────────────┘
                         │  JDBC / JPA
┌────────────────────────▼────────────────────────────┐
│                   DATABASE LAYER                     │
│   MySQL 8.0                                         │
│   Tables: users, skills, careers,                   │
│           user_skills, career_skills                │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 System Flow

```
User Registration / Login
        │
        ▼
  JWT Token Issued
        │
        ▼
  User Dashboard ──────────────────────────────────┐
        │                                           │
        ▼                                           ▼
  Add/Manage Skills                       View Recommendations
        │                                           │
        ▼                                           ▼
  Skills saved to DB              Match % calculated per career
  (user_skills table)             (userSkills ∩ careerSkills)
                                             │
                                             ▼
                                    Skill Gap Analysis
                                    (missing / insufficient skills)
```

---

## 🗄️ Database Schema

### Entity Relationship Overview

```
┌──────────────┐       ┌─────────────────┐       ┌──────────────┐
│    users     │       │   user_skills   │       │    skills    │
│──────────────│       │─────────────────│       │──────────────│
│ id (PK)      │──────<│ id (PK)         │>──────│ id (PK)      │
│ name         │       │ user_id (FK)    │       │ skill_name   │
│ email        │       │ skill_id (FK)   │       │ category     │
│ password     │       │ proficiency     │       │ description  │
│ role         │       └─────────────────┘       └──────────────┘
└──────────────┘

┌──────────────┐       ┌─────────────────┐       ┌──────────────┐
│   careers    │       │  career_skills  │       │    skills    │
│──────────────│       │─────────────────│       │──────────────│
│ id (PK)      │──────<│ id (PK)         │>──────│ id (PK)      │
│ career_name  │       │ career_id (FK)  │       │ skill_name   │
│ description  │       │ skill_id (FK)   │       │ category     │
│ demand_level │       │ required_level  │       │ description  │
│ avg_salary   │       └─────────────────┘       └──────────────┘
└──────────────┘
```

### Table Definitions

#### `users`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| name | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| password | VARCHAR(255) | NOT NULL (BCrypt hashed) |
| role | VARCHAR(50) | NOT NULL, DEFAULT 'USER' |

#### `skills`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| skill_name | VARCHAR(255) | NOT NULL, UNIQUE |
| category | VARCHAR(100) | NOT NULL |
| description | TEXT | NULL |

#### `careers`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| career_name | VARCHAR(255) | NOT NULL, UNIQUE |
| description | TEXT | NOT NULL |
| demand_level | FLOAT | NOT NULL (1-5 scale) |
| average_salary | DOUBLE | NULL |

#### `user_skills`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| user_id | BIGINT | FOREIGN KEY → users(id) |
| skill_id | BIGINT | FOREIGN KEY → skills(id) |
| proficiency_level | VARCHAR(50) | NOT NULL (Beginner/Intermediate/Advanced/Expert) |

#### `career_skills`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| career_id | BIGINT | FOREIGN KEY → careers(id) |
| skill_id | BIGINT | FOREIGN KEY → skills(id) |
| required_level | VARCHAR(50) | NOT NULL |

---

## 📁 Project Structure

```
career-analytic-platform/
│
├── client/                          # React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js             # Axios instance + JWT interceptor
│   │   ├── auth/
│   │   │   ├── AuthContext.jsx      # Global auth state (JWT decode)
│   │   │   ├── RequireAdmin.jsx     # Admin route guard
│   │   │   └── RequireAuth.jsx      # Protected route guard
│   │   ├── components/
│   │   │   └── Navbar.jsx           # Role-aware navigation
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── user/
│   │   │   │   ├── UserDashboard.jsx
│   │   │   │   ├── UserSkill.jsx
│   │   │   │   ├── Recommendations.jsx
│   │   │   │   └── Profile.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── ManageSkills.jsx
│   │   │       └── ManageCareers.jsx
│   │   ├── App.jsx                  # Routes definition
│   │   └── main.jsx
│   ├── .env
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                          # Spring Boot Backend
│   └── src/main/java/com/CodeSpace/careerinfo/
│       ├── config/
│       │   ├── SecurityConfig.java  # Spring Security + JWT filter
│       │   └── CorsConfig.java      # CORS configuration
│       ├── controllers/
│       │   ├── AuthController.java
│       │   ├── UserController.java
│       │   ├── SkillsController.java
│       │   ├── CareerController.java
│       │   └── RecommendationController.java
│       ├── dto/
│       │   ├── RegisterDTO.java
│       │   ├── LoginDTO.java
│       │   ├── UserDTO.java
│       │   ├── UserSkillDTO.java
│       │   ├── SkillDTO.java
│       │   ├── CareerDTO.java
│       │   ├── CareerSkillDTO.java
│       │   ├── CareerRecommendationDTO.java
│       │   └── SkillGapDTO.java
│       ├── model/
│       │   ├── User.java
│       │   ├── Skill.java
│       │   ├── Career.java
│       │   ├── UserSkills.java
│       │   └── CareerSkills.java
│       ├── repository/
│       │   ├── UserRepository.java
│       │   ├── SkillRepository.java
│       │   ├── CareerRepository.java
│       │   ├── UserSkillRepository.java
│       │   └── CareerSkillRepository.java
│       ├── service/
│       │   ├── UserService.java
│       │   ├── SkillService.java
│       │   ├── CareerService.java
│       │   └── RecommendationService.java
│       └── utils/
│           ├── JwtUtils.java        # Token generation & extraction
│           └── JwtFilter.java       # Request filter for JWT validation
│   └── src/main/resources/
│       └── application.properties
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Ensure the following are installed:

- **Java** 17+
- **Node.js** 18+ and **npm**
- **MySQL** 8.0+
- **Maven** 3.8+
- **Git**

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/career-analytic-platform.git
cd career-analytic-platform
```

---

### 2. Database Setup

```sql
-- Connect to MySQL and run:
CREATE DATABASE careerinfo_db;
CREATE USER 'careerinfo_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON careerinfo_db.* TO 'careerinfo_user'@'localhost';
FLUSH PRIVILEGES;
```

---

### 3. Backend Setup

```bash
cd server

# Configure environment variables (see section below)
cp src/main/resources/application.properties.example src/main/resources/application.properties
# Edit application.properties with your DB credentials

# Build and run
mvn clean install
mvn spring-boot:run
```

Backend starts at: `http://localhost:8080`

---

### 4. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your API URL

# Start development server
npm run dev
```

Frontend starts at: `http://localhost:5173`

---

## 🔐 Environment Variables

### Backend — `server/src/main/resources/application.properties`

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/careerinfo_db
spring.datasource.username=careerinfo_user
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Server Port
server.port=8080

# JWT (Keep this secret!)
jwt.secret=ASNDIJASNDJASNDIJANSIJDNAISDH9323904889CRN9RWQNE9DSUIAUN
jwt.expiration=604800000
```

### Frontend — `client/.env`

```env
VITE_API_BASE_URL=http://localhost:8080
```

> ⚠️ **Never commit `.env` files or `application.properties` with real credentials to Git.**

---

## 📡 API Documentation

### Base URL
```
http://localhost:8080
```

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | ❌ Public | Register new user |
| POST | `/auth/login` | ❌ Public | Login and get JWT |

#### POST `/auth/register`
```json
// Request Body
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}

// Response 200
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/auth/login`
```json
// Request Body
{
  "email": "john@example.com",
  "password": "Password123"
}

// Response 200
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### User Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/user/{userId}/profile` | ✅ USER/ADMIN | Get user profile |
| PUT | `/api/user/{userId}/profile` | ✅ USER/ADMIN | Update user profile |
| POST | `/api/user/{userId}/skill` | ✅ USER/ADMIN | Add skill to user |
| GET | `/api/user/{userId}/skill` | ✅ USER/ADMIN | Get all user skills |
| PUT | `/api/user/{userId}/skill` | ✅ USER/ADMIN | Update skill proficiency |
| DELETE | `/api/user/{userId}/skill/{skillId}` | ✅ USER/ADMIN | Remove skill |

---

### Skill Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/skill` | ❌ Public | Get all skills |
| GET | `/api/skill/{skillId}` | ❌ Public | Get skill by ID |
| POST | `/api/skill/` | ✅ ADMIN | Add new skill |
| PUT | `/api/skill/{skillId}` | ✅ ADMIN | Update skill |
| DELETE | `/api/skill/{skillId}` | ✅ ADMIN | Delete skill |

---

### Career Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/career` | ❌ Public | Get all careers |
| GET | `/api/career/{careerId}` | ❌ Public | Get career by ID |
| POST | `/api/career` | ✅ ADMIN | Create new career |
| PUT | `/api/career/{careerId}` | ✅ ADMIN | Update career |
| DELETE | `/api/career/{careerId}` | ✅ ADMIN | Delete career |

---

### Recommendation Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/recommendations/{userId}` | ✅ USER/ADMIN | Get career recommendations |
| GET | `/api/analysis/{userId}/career/{careerId}` | ✅ USER/ADMIN | Get skill gap analysis |

#### GET `/api/recommendations/{userId}` — Response
```json
[
  {
    "careerId": 1,
    "careerName": "Software Engineer",
    "description": "Designs and builds software systems",
    "matchPercentage": 85.5,
    "demandLevel": 5,
    "averageSalary": 95000.00,
    "skillGaps": null
  }
]
```

#### GET `/api/analysis/{userId}/career/{careerId}` — Response
```json
{
  "careerId": 1,
  "careerName": "Software Engineer",
  "matchPercentage": 85.5,
  "demandLevel": 5,
  "averageSalary": 95000.00,
  "skillGaps": [
    {
      "skillId": 1,
      "skillName": "Java",
      "requiredLevel": "Advanced",
      "userLevel": "Expert",
      "matched": true
    },
    {
      "skillId": 5,
      "skillName": "Docker",
      "requiredLevel": "Intermediate",
      "userLevel": null,
      "matched": false
    }
  ]
}
```

---

### JWT Token Payload

```json
{
  "sub": "john@example.com",
  "userId": 123,
  "role": "USER",
  "iat": 1700000000,
  "exp": 1700604800
}
```

> Role values: `"USER"` or `"ADMIN"` — stored without the `ROLE_` prefix in the token. Spring Security adds the prefix internally via `JwtFilter`.

---

## ✨ Features

### User Features
- **Registration & Login** with JWT authentication
- **Skill Management** — add, update, remove skills with proficiency levels (Beginner → Expert)
- **Career Recommendations** — ranked list matched to your skill set
- **Skill Gap Analysis** — see exactly which skills you need for any career
- **Profile Management** — update name and view account stats
- **Responsive Dashboard** — works on mobile and desktop

### Admin Features
- **Manage Skills** — full CRUD for the skills library
- **Manage Careers** — create careers with required skills and demand data
- **Role Badge** — admins see a distinct purple badge in the navbar

### Security Features
- JWT stateless authentication (7-day expiry)
- BCrypt password hashing (strength 10)
- Spring Security role-based access control
- CORS configured for frontend origin only
- Input validation on all endpoints

---

## 🌿 Branching Strategy

```
main                  ← Production-ready code only
  └── develop         ← Integration branch (merge PRs here)
        ├── feature/auth-system
        ├── feature/skill-management
        ├── feature/career-recommendations
        ├── feature/skill-gap-analysis
        ├── feature/admin-dashboard
        └── fix/role-not-in-token
```

### Branch Naming Conventions

| Prefix | Usage | Example |
|---|---|---|
| `feature/` | New features | `feature/career-recommendations` |
| `fix/` | Bug fixes | `fix/jwt-role-issue` |
| `hotfix/` | Critical production fixes | `hotfix/login-500-error` |
| `refactor/` | Code improvements | `refactor/service-layer` |
| `docs/` | Documentation updates | `docs/update-readme` |

### Commit Message Format

```
type(scope): short description

Examples:
feat(auth): add JWT role to token payload
fix(user): set default role to USER on registration
docs(readme): add API documentation section
refactor(service): extract recommendation logic
```

---

## 🚢 Deployment

### Frontend — Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from client directory
cd client
vercel --prod
```

Add environment variable in Vercel dashboard:
```
VITE_API_BASE_URL = https://your-backend-url.onrender.com
```

### Backend — Render

1. Push code to GitHub
2. Create new **Web Service** on [render.com](https://render.com)
3. Connect your GitHub repository
4. Set **Build Command**: `mvn clean package -DskipTests`
5. Set **Start Command**: `java -jar target/*.jar`
6. Add environment variables:

```
SPRING_DATASOURCE_URL=jdbc:mysql://your-db-host:3306/careerinfo_db
SPRING_DATASOURCE_USERNAME=your_db_user
SPRING_DATASOURCE_PASSWORD=your_db_password
JWT_SECRET=your_production_secret_key
```

### Database — PlanetScale / Railway / Clever Cloud

Use any managed MySQL provider and update `SPRING_DATASOURCE_URL`.

---

## 📊 Development Phases

### Phase 1 — Foundation ✅

- [x] Tech stack selection and architecture design
- [x] ER diagram and database schema design
- [x] UI/UX wireframes (Figma — green/emerald theme)
- [x] GitHub repository setup with client/server structure
- [x] `.gitignore`, README, branching strategy
- [x] Spring Boot + React boilerplate with environment config

### Phase 2 — Core Development ✅

- [x] RESTful API implementation (Auth, User, Skills, Careers)
- [x] MySQL database connection with Spring Data JPA
- [x] JWT authentication with Spring Security
- [x] Frontend CRUD — skill management, profile management
- [x] React Context API for global auth state
- [x] Protected routes (RequireAuth, RequireAdmin)
- [x] Error handling — server-side validation + frontend error display
- [x] CORS configuration

### Phase 3 — Polish & Deployment 🔄

- [x] Responsive UI (Tailwind CSS — mobile + desktop)
- [x] Career recommendations engine (skill-matching algorithm)
- [x] Skill gap analysis with matched/unmatched breakdown
- [x] Loading states, animations, and toast notifications
- [x] Search, filter, and sort on skills and recommendations
- [ ] Unit tests (JUnit 5 + Jest)
- [ ] Swagger API documentation
- [ ] Production deployment (Vercel + Render)
- [ ] CI/CD pipeline (GitHub Actions)

---

## 🛠️ Common Issues & Fixes

### "Role not coming in frontend after registration"
**Cause:** `RegisterDTO` had a `role` field that the frontend wasn't sending, resulting in `null` stored in the DB.
**Fix:** Remove `role` from `RegisterDTO` and set `user.setRole("USER")` directly in `UserService.createUser()`.

### "403 Forbidden on /api/user/** for ADMIN"
**Cause:** `SecurityConfig` had `.hasAnyRole("USER")` only — excluded admins.
**Fix:** Change to `.hasAnyRole("USER", "ADMIN")`.

### "Navbar shows ROLE_USER instead of USER"
**Cause:** JWT token stores `"USER"` but `RequireAdmin` was comparing against `"ROLE_ADMIN"`.
**Fix:** Use `auth.role === "ADMIN"` in all frontend role checks. The `ROLE_` prefix is only added by Spring Security's `JwtFilter` for internal security context — not in the token itself.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request to `develop`

---

## 📄 License

This project is for educational purposes as part of a Web Development course assignment.

---

## 👤 Author

**Your Name**
- GitHub: [@your-username](https://github.com/your-username)
- Email: your.email@example.com

---

> Built with ☕ Java, ⚛️ React, and 💚 Tailwind CSS
