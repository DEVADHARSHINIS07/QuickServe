# QuickServe Smart Canteen - Spring Boot & MySQL Enterprise Backend Guide

## Architecture Overview

This production-grade Spring Boot backend manages the **QuickServe Smart Canteen System** for **AAACET College**.

### Key Highlights
- **Mandatory Domain Enforcer**: Only accounts ending in `@aaacet.ac.in` can register or authenticate.
- **BCrypt Password Hashing**: Zero plain-text password storage.
- **JWT Authentication**: Secure stateless token authentication (`JJWT`).
- **Spring JDBC (`JdbcTemplate`)**: Optimized, injection-safe SQL queries with MySQL transactions.
- **JavaMail / SMTP Service**: Asynchronous automated emails for registrations, order status, and single-use password resets.
- **Real-Time WebSockets**: STOMP over SockJS for instant order broadcasts to students and canteen admins.
- **Role-Based Access Control**: Strict separation between `ROLE_STUDENT` and `ROLE_ADMIN`.
- **Historical Order Preservation**: Stores exact item prices and food names at purchase time.

---

## 📁 Spring Boot Project Structure

```text
/
├── database/
│   └── schema.sql                  # Complete MySQL database creation script
├── pom.xml                         # Maven dependencies & build settings
├── README.md
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/smartcanteen/
│   │   │       ├── SmartCanteenApplication.java
│   │   │       ├── config/
│   │   │       │   ├── CorsConfig.java
│   │   │       │   ├── SecurityConfig.java
│   │   │       │   └── WebSocketConfig.java
│   │   │       ├── controller/
│   │   │       │   ├── AdminController.java
│   │   │       │   ├── AuthController.java
│   │   │       │   ├── FoodController.java
│   │   │       │   ├── NotificationController.java
│   │   │       │   ├── OrderController.java
│   │   │       │   └── ReportController.java
│   │   │       ├── dto/
│   │   │       │   ├── ApiResponse.java
│   │   │       │   ├── AuthDTOs.java
│   │   │       │   ├── DashboardResponse.java
│   │   │       │   ├── FoodDTOs.java
│   │   │       │   └── OrderDTOs.java
│   │   │       ├── exception/
│   │   │       │   ├── CustomExceptions.java
│   │   │       │   └── GlobalExceptionHandler.java
│   │   │       ├── model/
│   │   │       │   ├── FoodItem.java
│   │   │       │   ├── Notification.java
│   │   │       │   ├── Order.java
│   │   │       │   ├── OrderItem.java
│   │   │       │   ├── PasswordResetToken.java
│   │   │       │   └── User.java
│   │   │       ├── repository/
│   │   │       │   ├── FoodRepository.java
│   │   │       │   ├── NotificationRepository.java
│   │   │       │   ├── OrderItemRepository.java
│   │   │       │   ├── OrderRepository.java
│   │   │       │   ├── PasswordResetTokenRepository.java
│   │   │       │   └── UserRepository.java
│   │   │       ├── security/
│   │   │       │   ├── CustomUserDetailsService.java
│   │   │       │   ├── JwtAuthenticationFilter.java
│   │   │       │   ├── JwtTokenProvider.java
│   │   │       │   └── UserPrincipal.java
│   │   │       ├── service/
│   │   │       │   ├── AuthService.java
│   │   │       │   ├── EmailService.java
│   │   │       │   ├── FoodService.java
│   │   │       │   ├── NotificationService.java
│   │   │       │   ├── OrderService.java
│   │   │       │   └── ReportService.java
│   │   │       └── util/
│   │   │           └── DomainValidator.java
│   │   └── resources/
│   │       └── application.properties
│   └── services/
│       └── api.ts                  # React Frontend REST API Client
```

---

## 🛠️ Step-by-Step Backend Setup Instructions

### 1. MySQL Database Initialization

Open MySQL terminal or MySQL Workbench and execute the schema initialization script:

```bash
# Connect to local MySQL server
mysql -u root -p < database/schema.sql
```

Or manually create the database and run the schema:
```sql
CREATE DATABASE smart_canteen DEFAULT CHARACTER SET utf8mb4;
USE smart_canteen;
-- Execute script inside database/schema.sql
```

Default Seed Accounts:
- **Canteen Admin**: `admin@aaacet.ac.in` / `admin123`
- **Student User**: `24urcs029@aaacet.ac.in` / `password123`

---

### 2. Environment Variables & Properties Setup

Update `src/main/resources/application.properties` or set environment variables:

```properties
DB_URL=jdbc:mysql://localhost:3306/smart_canteen?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=canteen.aaacet@gmail.com
MAIL_PASSWORD=your_app_password

JWT_SECRET=9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b
```

---

### 3. Build & Run Spring Boot Application

Use Apache Maven to build and run the application:

```bash
# Compile and package the Spring Boot JAR
mvn clean package -DskipTests

# Run the Spring Boot Application
mvn spring-boot:run
```

Alternatively, run the JAR directly:
```bash
java -jar target/smart-canteen-backend-1.0.0.jar
```

The server will start on **port 8080** (or `http://localhost:8080`).

---

## 🌐 Connecting React Frontend to Spring Boot

1. In the React project root, configure `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   ```
2. The frontend REST client in `src/services/api.ts` handles:
   - Automated JWT Bearer token headers for protected `/api/orders` & `/api/admin` requests
   - Role verification upon login
   - Automatic college domain validation (`@aaacet.ac.in`)
