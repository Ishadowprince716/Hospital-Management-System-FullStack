# --- Stage 1: Build Frontend ---
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
COPY hospital-management-react/package*.json ./
RUN npm install
COPY hospital-management-react/ ./
RUN npm run build

# --- Stage 2: Build Backend ---
FROM maven:3.9.6-amazoncorretto-21 AS backend-build
WORKDIR /app/backend
COPY hospital-management-backend/pom.xml .
RUN mvn dependency:go-offline
COPY hospital-management-backend/src ./src

# Inject Frontend Build into Backend Static Folder
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static/

# Build the JAR, skipping tests for speed
RUN mvn clean package -DskipTests

# --- Stage 3: Production Image ---
FROM amazoncorretto:21-alpine
WORKDIR /app

# Create a non-root user for security
RUN addgroup -S hms && adduser -S hms -G hms
USER hms

# Copy the built backend JAR
COPY --from=backend-build /app/backend/target/hospital-management-*.jar app.jar

# Copy the built frontend (Spring Boot serves it from static/ if we configure it)
# Professional Tip: For real production, we would use Nginx for frontend,
# but for a self-contained JAR, we copy into resources/static before backend build.
# For this implementation, we will assume the backend JAR already contains static files
# if the maven build was correctly configured, or we let the JAR be the API server.

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
