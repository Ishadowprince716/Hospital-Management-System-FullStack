# Railway Free Deployment

This repo is prepared for Railway using the root `Dockerfile`. The Docker build creates the React production build, copies it into the Spring Boot app, and runs the app as one service.

## 1. Push this project to GitHub

```powershell
git add .
git commit -m "Prepare Railway deployment"
git push origin main
```

## 2. Create the Railway project

1. Go to https://railway.com
2. Create a new project from your GitHub repo.
3. Add a MySQL database service.
4. Open the app service variables and add the database settings below.

## 3. Required Railway variables

Use Railway's MySQL service variables to fill these values:

```text
SPRING_DATASOURCE_URL=jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=${{MySQL.MYSQLUSER}}
SPRING_DATASOURCE_PASSWORD=${{MySQL.MYSQLPASSWORD}}
SPRING_DATASOURCE_DRIVER_CLASS_NAME=com.mysql.cj.jdbc.Driver
SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.MySQLDialect
H2_CONSOLE_ENABLED=false
```

Optional variables:

```text
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
JWT_SECRET=replace_with_a_long_random_secret
```

## 4. Deploy

Railway will deploy automatically after the GitHub push. After deploy finishes, open the generated Railway domain and test:

```text
/health
/ready
```
