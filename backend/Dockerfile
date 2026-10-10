# syntax=docker/dockerfile:1

### Build stage ###
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Cache dependencies separately from source so `docker build` does not re-download them on every
# source change.
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -q package -DskipTests

### Runtime stage ###
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

RUN addgroup -S project_name && adduser -S project_name -G project_name
COPY --from=build /build/target/project-name-*.jar app.jar

USER project_name
EXPOSE 8080

ENV JAVA_OPTS=""
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget -qO- http://localhost:8080/actuator/health/liveness || exit 1
