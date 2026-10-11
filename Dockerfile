# Imagen de ejecución para el backend Spring Boot (UdeaBank).
# El JAR se genera ANTES de construir la imagen con: .\mvnw.cmd package -DskipTests
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copia el único JAR ejecutable generado por el plugin de Spring Boot.
COPY target/*.jar app.jar

# El backend escucha en el puerto 8088 (ver application.properties).
EXPOSE 8088

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
