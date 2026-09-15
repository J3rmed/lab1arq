# UdeaBank

Aplicación bancaria académica para administrar clientes, realizar transferencias entre cuentas y consultar el histórico de transacciones.

El proyecto está compuesto por:

- **Backend:** Spring Boot 4.0.8, Java 17, Spring Web MVC y Spring Data JPA.
- **Base de datos:** PostgreSQL.
- **Frontend:** React 19 + Vite 8, desarrollado en JavaScript/JSX.
- **Mapeo:** MapStruct para convertir entidades JPA a DTOs.

## Requisitos

- Java 17 o superior.
- PostgreSQL en ejecución.
- Node.js 20.19 o superior para Vite 8.
- npm.

## Configuración de PostgreSQL

La configuración actual se encuentra en `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/udeabank
spring.datasource.username=postgres
spring.datasource.password=root
```

Crea la base de datos antes de iniciar la aplicación:

```sql
CREATE DATABASE udeabank;
```

Hibernate utiliza `spring.jpa.hibernate.ddl-auto=update`, por lo que crea o modifica las tablas automáticamente al iniciar. En un entorno real, se recomienda usar variables de entorno y migraciones controladas en lugar de credenciales y `ddl-auto=update`.

## Ejecución

### Backend

Desde la raíz del proyecto:

```powershell
.\mvnw spring-boot:run
```

El backend queda disponible en:

```text
http://localhost:8088
```

### Frontend

En otra terminal:

```powershell
cd frontend
npm install
npm run dev
```

El frontend queda disponible en:

```text
http://localhost:5173
```

El archivo `frontend/vite.config.js` configura un proxy para enviar las solicitudes `/api` al backend en `http://localhost:8088`.

## Comandos útiles

### Backend

```powershell
# Ejecutar todas las pruebas
.\mvnw test

# Ejecutar una prueba específica
.\mvnw -Dtest=ClassName#methodName test

# Construir el proyecto
.\mvnw package
```

### Frontend

Ejecutar desde `frontend/`:

```powershell
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Compilación de producción
npm run build

# Servir la compilación localmente
npm run preview
```

## Funcionalidades del frontend

El frontend tiene tres vistas principales:

1. **Clientes:** consulta todos los clientes, sus cuentas y saldos actuales.
2. **Transferencia:** permite seleccionar una cuenta de origen, una cuenta de destino y un monto para realizar una transferencia.
3. **Historial:** muestra las transacciones asociadas a una cuenta, indicando si son entradas o salidas.

La interfaz incluye estados de carga, estados vacíos, errores de conexión, validación de formularios y confirmación de transferencias exitosas.

## API REST

La API utiliza el prefijo `/api` y corre en el puerto `8088`.

### Clientes

#### Obtener todos los clientes

```http
GET http://localhost:8088/api/customers
```

#### Obtener un cliente por ID

```http
GET http://localhost:8088/api/customers/{id}
```

#### Crear un cliente

```http
POST http://localhost:8088/api/customers
Content-Type: application/json
```

```json
{
  "firstName": "Juan",
  "lastName": "Perez",
  "accountNumber": "123456789",
  "balance": 1000.0
}
```

### Transacciones

#### Obtener todas las transacciones

```http
GET http://localhost:8088/api/transactions
```

#### Obtener una transacción por ID

```http
GET http://localhost:8088/api/transactions/{id}
```

Devuelve `404 Not Found` si no existe.

#### Crear una transferencia

```http
POST http://localhost:8088/api/transactions
Content-Type: application/json
```

```json
{
  "senderAccountNumber": "123456789",
  "receiverAccountNumber": "987654321",
  "amount": 100.0
}
```

La respuesta incluye el ID y el `timestamp` de la transacción. El saldo del remitente disminuye y el del receptor aumenta.

#### Actualizar una transacción

```http
PUT http://localhost:8088/api/transactions/{id}
Content-Type: application/json
```

```json
{
  "senderAccountNumber": "123456789",
  "receiverAccountNumber": "987654321",
  "amount": 150.0
}
```

La operación revierte el efecto financiero anterior y aplica el nuevo. Devuelve `404` si no existe o `400` si los datos son inválidos o no hay saldo suficiente.

#### Eliminar una transacción

```http
DELETE http://localhost:8088/api/transactions/{id}
```

Devuelve `204 No Content` y revierte el efecto de la transacción sobre los saldos.

#### Obtener el histórico de una cuenta

```http
GET http://localhost:8088/api/transactions/account/{accountNumber}
```

La ruta `/account/` es necesaria para diferenciarla de `/api/transactions/{id}`. Los números de cuenta son cadenas numéricas y no pueden distinguirse de un ID únicamente por el tipo de variable.

## Arquitectura del backend

El código Java está organizado en capas:

```text
src/main/java/com/udea/lab1arq/
├── controller/   # Endpoints HTTP
├── service/      # Reglas de negocio y transacciones
├── repository/   # Interfaces Spring Data JPA
├── entity/       # Entidades persistidas
├── DTO/          # Modelos de entrada y salida de la API
└── mapper/       # Interfaces MapStruct
```

El punto de entrada es `Lab1arqApplication.java`.

## Estructura del frontend

```text
frontend/
├── src/
│   ├── components/       # Vistas y componentes reutilizables
│   ├── api.js            # Consumo de la API
│   ├── format.js         # Formateo de fechas y montos
│   ├── App.jsx           # Navegación y estado compartido
│   ├── main.jsx          # Entrada de React
│   └── styles.css        # Estilos globales
├── vite.config.js        # Proxy hacia el backend
└── package.json
```

El frontend no contiene lógica de negocio: consume las rutas REST del backend y presenta sus resultados.

## Flujo básico de prueba

1. Iniciar PostgreSQL y crear la base de datos `udeabank`.
2. Iniciar el backend en el puerto `8088`.
3. Crear dos clientes mediante Postman o `POST /api/customers`.
4. Iniciar el frontend con `npm run dev`.
5. Abrir `http://localhost:5173`.
6. Realizar una transferencia desde la vista **Transferencia**.
7. Confirmar los saldos actualizados en **Clientes**.
8. Consultar los movimientos desde **Historial**.
