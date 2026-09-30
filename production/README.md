# Rasika Tours & Travels - Production Deployment

## Frontend
Build command:

npm run build

The production output is located in:

frontend/build

## Backend
Build command:

./mvnw clean package -DskipTests

or:

mvn clean package -DskipTests

## Before Deployment

1. Change JWT secret to a strong production secret.
2. Do not expose database passwords in source code.
3. Use environment variables for database credentials.
4. Change CORS from localhost to your production frontend domain.
5. Disable the public admin password reset endpoint.
6. Use HTTPS in production.
7. Create a database backup before deployment.
