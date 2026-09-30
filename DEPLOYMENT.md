# Rasika Tours & Travels - Production Deployment

## Production architecture

Frontend:
Vercel

Backend:
Spring Boot

Database:
Managed MySQL

## Backend environment variables

SPRING_PROFILES_ACTIVE=production
SPRING_DATASOURCE_URL=jdbc:mysql://HOST:3306/DATABASE
SPRING_DATASOURCE_USERNAME=USERNAME
SPRING_DATASOURCE_PASSWORD=PASSWORD
JWT_SECRET=LONG_RANDOM_SECRET
JWT_EXPIRATION=86400000
PORT=8080

## Frontend environment variable

REACT_APP_API_URL=https://api.example.com/api

## Deployment order

1. Create production MySQL.
2. Import required schema/data.
3. Deploy Spring Boot backend.
4. Set backend environment variables.
5. Configure production CORS.
6. Attach the API custom domain.
7. Deploy React frontend.
8. Set REACT_APP_API_URL.
9. Attach the customer domain.
10. Test authentication, bookings, seats, admin, passport and contact flows.
11. Configure backups and monitoring.

Never commit .env files, passwords, JWT secrets, payment credentials, SMTP passwords, or customer documents.
