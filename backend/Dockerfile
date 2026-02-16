FROM maven:3-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

FROM eclipse-temurin:17-jre
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
# Render: parse DATABASE_URL (postgresql://user:password@host:port/database) into Spring env vars.
# Uses last @ to split (so password may contain : and @); first : in user part splits user and password.
ENTRYPOINT ["sh", "-c", "\
if [ -n \"$DATABASE_URL\" ]; then \
  rest=${DATABASE_URL#postgresql://}; \
  userpart=$(echo \"$rest\" | sed 's/@[^@]*$//'); \
  hostpart=$(echo \"$rest\" | sed 's/.*@//'); \
  export DB_USERNAME=${userpart%%:*}; \
  export DB_PASSWORD=${userpart#*:}; \
  export SPRING_DATASOURCE_URL=\"jdbc:postgresql://$hostpart\"; \
fi; \
exec java -jar app.jar"]
