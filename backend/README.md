# Smart Campus Operations Hub - Backend API

This backend is built using **Spring Boot 3** and follows a strictly layered **Model-View-Controller (MVC) Architecture** tailored for RESTful Web Services.

## Package Architecture & Explanations

The project is structured into the following packages ensuring high cohesion and low coupling:

* **`com.smartcampus.hub.controller`**: 
  Contains the REST API endpoints (`@RestController`). This layer only handles HTTP requests, routes them to the business logic (service layer), and returns HTTP responses.
* **`com.smartcampus.hub.service`**: 
  Contains business logic interfaces. Defining interfaces here allows for loose coupling and makes the implementation easier to swap or mock during unit testing.
* **`com.smartcampus.hub.service.impl`**: 
  Contains the concrete implementations of the service interfaces (`@Service`). This is where the core business rules, calculations, and data processing reside.
* **`com.smartcampus.hub.repository`**: 
  Contains Spring Data JPA interfaces (`@Repository`). These interfaces extend `JpaRepository` and act as the Data Access Layer (DAL) interfacing directly with the MySQL database.
* **`com.smartcampus.hub.entity`**: 
  Contains the domain models/JPA Entities (`@Entity`). These classes map directly to the tables in the MySQL database.
* **`com.smartcampus.hub.dto.request` & `com.smartcampus.hub.dto.response`**: 
  Data Transfer Objects (DTOs). Ensures that internal Database Entities are not leaked directly to the client. The `request` package holds incoming payloads (with validation annotations), and `response` holds the formatted return data.
* **`com.smartcampus.hub.enums`**: 
  Contains Java Enums to define strict, type-safe constant values (e.g., `Role`, `TicketStatus`, `BookingStatus`).
* **`com.smartcampus.hub.security`**: 
  Houses all Spring Security configurations. Includes JWT generation, validation filters, custom `UserDetailsService`, and authentication entry points.
* **`com.smartcampus.hub.config`**: 
  Contains application configuration classes (`@Configuration`). E.g., CORS configurations, OpenAPI/Swagger setups, or Bean definitions.
* **`com.smartcampus.hub.exception`**: 
  Contains centralized Error Handling. Includes custom exception classes (e.g., `ResourceNotFoundException`) and a `@ControllerAdvice` class to catch exceptions globally and map them to standardized JSON error responses.
* **`com.smartcampus.hub.util`**: 
  Contains helper or utility classes that feature common, reusable static methods (e.g., date formatters, common string manipulations).

## Getting Started
Ensure MySQL is running natively on your machine matching the credentials in `application.properties`. Navigate to `backend/` and run `mvn spring-boot:run` to launch the API on port `8080`.
