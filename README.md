# Smart Campus Operations Hub 🚀

A professional-grade, full-stack management platform for academic campuses. This system streamlines resource booking, maintenance tracking, and administrative oversight with a modern, high-performance architecture.

## 🌟 Key Features

### 🔐 Multi-Role Authentication
- **Secure Access**: JWT-based authentication with role-based access control (ADMIN, TECHNICIAN, USER).
- **Social Integration**: Google OAuth2 integration for seamless login.
- **Security**: Robust password hashing and OTP-based verification for password resets.

### 🏢 Resource Management
- **Centralized Hub**: Manage campus rooms, labs, and equipment with real-time availability tracking.
- **Interactive Dashboard**: Visual insights into resource utilization and status.

### 📅 Booking System
- **Intelligent Scheduling**: Conflict-resolution logic to prevent double bookings.
- **Admin Oversight**: Dedicated approval workflow for administrators with rejection reasons and notifications.

### 🛠️ Maintenance & Ticketing
- **Ticket Lifecycle**: End-to-end tracking from creation to resolution.
- **Technician Portal**: Specialized view for technicians to manage assigned tasks and update status.
- **Attachments & Comments**: Multi-media support for tickets and real-time collaboration.

### 📊 Admin Analytics & Auditing
- **Visual Intelligence**: Dynamic charts (Recharts) for system-wide statistics.
- **Audit Trail**: Comprehensive system activity logs tracking every critical administrative and user action.
- **Report Export**: High-quality PDF generation for Users, Bookings, and Maintenance data.

### 🔔 Real-time Notifications
- **Instant Alerts**: Automated notifications for booking status, ticket assignments, and comments.
- **In-app Feed**: Persistent notification bell with read/unread tracking.

## 💻 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Recharts.
- **Backend**: Spring Boot 3.2.3, Java 17+, Spring Security, Spring Data JPA.
- **Database**: MySQL 8.
- **Documentation**: Swagger UI / OpenAPI 3.0.
- **Reports**: OpenPDF (LibrePDF).

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- JDK 17+
- MySQL 8

### Backend Setup
1. Create a MySQL database named `smart_campus_db`.
2. Configure `src/main/resources/application.properties` with your credentials.
3. Run with Maven: `./mvnw spring-boot:run`
4. Access API docs: `http://localhost:8080/swagger-ui/index.html`

### Frontend Setup
1. `npm install`
2. `npm run dev`
3. Access app: `http://localhost:5173`

## 🛡️ Security & Quality
- **Validation**: Strict server-side validation using Jakarta Validation (`@Valid`).
- **Error Handling**: Global exception handling with structured JSON responses.
- **UI/UX**: Premium Glassmorphism design with responsive Tailwind layouts.

## 🛠️ Maintenance & Logistics
For system logs and audit trails, navigate to the **System Logs** module in the Admin Dashboard. All critical actions are recorded with high-precision timestamps and operator details.

---
*Built for the Smart Campus Ecosystem.*
