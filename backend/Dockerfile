# MediPulse backend — multi-stage build.
# Build:  docker build -t medipulse-backend ./backend
# Run:    docker run -p 8080:8080 --env-file .env -e SPRING_PROFILES_ACTIVE=prod medipulse-backend

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw mvnw.cmd ./
COPY src src
RUN ./mvnw -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/backend-*.jar app.jar
VOLUME /app/uploads
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
