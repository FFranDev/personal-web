# Personal Website (`franfdez.dev`)

<p align="center">
  <strong>[ <a href="#-english-documentation">🇬🇧 English</a> | <a href="#-documentación-en-español">🇪🇸 Español</a> ]</strong>
</p>

---

## 🇬🇧 English Documentation

Full-stack personal website, interactive project portfolio, and technical blog developed for **Francisco Fernández Ugidos** ([franfdez.dev](https://franfdez.dev)). Designed with a custom retro monochrome terminal aesthetic, bilingual support (`ES`/`EN`), and a containerized microservice architecture.

### Key Features & Views

* **Home:** Personal introduction with technical profile overview, and academic/professional milestones.
* **Projects:** Interactive showcase of software engineering and game development projects with custom image carousels, technology tags, and repository links.
* **Blog:** Full-featured technical blog supporting:
  * Dynamic keyword search and server-side pagination.
  * Multi-image post galleries.
  * Two-level comment threads (public visitor comments and verified `[AUTHOR]` replies).
  * Hidden keyboard-triggered **Author Mode** (`Bearer` token session management) for publishing/deleting posts and moderating comments directly from the UI.
* **Contact:** Direct contact links (LinkedIn, Email, downloadable CV) and an integrated contact form powered by **Gmail SMTP**, featuring live character counters and retro status alerts.
* **Security & Abuse Prevention:**
  * **Honeypot fields** on public forms (Contact and Blog Comments) to silently filter automated spam bots.
  * **IP-based Rate Limiting** (`429 Too Many Requests`) for contact emails, blog comments, and brute-force protection on Admin login (`5` failed attempts lockout).
  * **Constant-time password comparison** (`MessageDigest.isEqual`) to prevent timing attacks.

---

### Tech Stack

#### Frontend
* **React 19** (`^19.2.8`) & **React Router DOM** (`^7.18.4`)[cite: 14]
* **Vite 8** (`^8.3.0`) & **Oxlint** (`^1.81.0`)[cite: 14]
* **i18next** (`^26.4.2`) & **react-i18next** (`^17.0.15`) for full Spanish/English internationalization[cite: 14]
* **Custom CSS3:** Retro terminal design system, custom scrollbars, SVG noise filters, and responsive mobile layouts.

#### Backend
* **Java 25** & **Spring Boot 4.1.1**[cite: 7]
* **Spring Data JPA (Hibernate)** & **PostgreSQL 15**
* **Spring Mail (JavaMailSender)** for SMTP email delivery[cite: 3, 7]
* **Bean Validation (Jakarta Validation)** for DTO payload enforcement[cite: 5, 6, 7, 9]
* **JUnit 5 & Mockito** for unit testing

#### Infrastructure & DevOps
* **Docker & Docker Compose** (Multi-container orchestration with persistent volumes for PostgreSQL and blog media uploads)
* **Cloudflare** (DNS & Reverse Proxy) / **Oracle Cloud Infrastructure (OCI)**

---

### Project Structure

```text
personal-web/
├── backend/                  # Spring Boot 4 REST API (Java 25)
│   ├── src/main/java/        # Controllers, Services, JPA Entities, DTOs & Security
│   ├── src/main/resources/   # application.properties & metadata
│   ├── src/test/java/        # JUnit 5 + Mockito unit test suites
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                 # React 19 Single Page Application (Vite 8)
│   ├── public/               # Static assets (CV PDF, Favicon, OpenGraph preview)
│   ├── src/                  # Views (Home, Projects, Blog, Contact), Components & i18n
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml        # Container orchestration (db, backend, frontend)
├── .env.example              # Environment variable template
└── README.md
```

---

### Getting Started (Local Development)

#### Prerequisites
* **Docker** and **Docker Compose** installed on your machine.
* *(Optional for running outside Docker)*: **JDK 25** and **Node.js 22+**.

#### 1. Clone the repository
```bash
git clone [https://github.com/FFranDev/personal-web.git](https://github.com/FFranDev/personal-web.git)
cd personal-web
```

#### 2. Configure environment variables
Copy the `.env.example` template to create your local `.env` file:
```bash
cp .env.example .env
```
Edit `.env` with your local credentials:
```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=examplePassword
POSTGRES_DB=personalwebdb
CORS_ALLOWED_ORIGINS=http://localhost:5173
MAIL_USERNAME=example@gmail.com
MAIL_PASSWORD= xxxx xxxx xxxx xxxx
ADMIN_PASSWORD=exampleAdminPassword
```

#### 3. Build and start the containers
```bash
docker compose up --build
```
* **Frontend:** `http://localhost:5173`
* **Backend API:** `http://localhost:8080/api`

---

### Running Backend Unit Tests

To run the JUnit 5 and Mockito unit test suites (`AdminAuthServiceTest`, `BlogServiceTest`, and `ContactServiceTest`):

```bash
cd backend
./mvnw test
```

---

### 🔌 REST API Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/contact` | Public (Rate Limited) | Sends an email via SMTP (`ContactRequestDto`)[cite: 5, 8] |
| `GET` | `/api/blog/posts` | Public | Retrieves paginated blog posts with optional `search` query[cite: 6] |
| `GET` | `/api/blog/images/{filename}` | Public | Serves uploaded post images from persistent volume[cite: 6] |
| `POST` | `/api/blog/posts/{id}/comments` | Public / Admin | Adds a visitor comment or an `[AUTHOR]` reply[cite: 6] |
| `POST` | `/api/blog/admin/login` | Public (Brute-force protected) | Authenticates author password and returns `Bearer` token[cite: 6] |
| `POST` | `/api/blog/admin/logout` | Admin (`Bearer`) | Invalidates current active admin token[cite: 6] |
| `POST` | `/api/blog/posts` | Admin (`Bearer`) | Creates a new blog post (`multipart/form-data`)[cite: 6] |
| `DELETE` | `/api/blog/posts/{id}` | Admin (`Bearer`) | Deletes a post, its comments, and stored image files[cite: 6] |
| `DELETE` | `/api/blog/comments/{id}` | Admin (`Bearer`) | Deletes a comment (and its replies if it is a root comment)[cite: 6] |

---
---

## 🇪🇸 Documentación en Español

Web personal full-stack, portfolio interactivo de proyectos y blog técnico desarrollado para **Francisco Fernández Ugidos** ([franfdez.dev](https://franfdez.dev)). Diseñada con una estética retro inspirada en terminales monocromas clásicas, soporte bilingüe (`ES`/`EN`) y una arquitectura contenerizada con Docker.

### Características y Vistas Principales

* **Home:** Presentación personal con resumen de perfil técnico e hitos académicos/profesionales.
* **Projects:** Catálogo interactivo de proyectos de ingeniería de software y desarrollo de videojuegos con galerías de imágenes a medida, etiquetas tecnológicas y enlaces a repositorios.
* **Blog:** Blog técnico completo con soporte para:
  * Búsqueda dinámica por palabras clave y paginación en el servidor.
  * Galerías de múltiples imágenes por publicación.
  * Hilos de comentarios en dos niveles (comentarios públicos de visitantes y respuestas verificadas con insignia `[AUTOR]`).
  * **Modo Autor oculto** activable mediante atajo de teclado (gestión de sesión por token `Bearer`) para publicar/eliminar entradas y moderar comentarios desde la propia interfaz.
* **Contact:** Enlaces directos (LinkedIn, Email, descarga de CV en PDF) y formulario de contacto integrado con **Gmail SMTP**, contador de caracteres en tiempo real y alertas de estado con estética retro.
* **Seguridad y Prevención de Abuso:**
  * **Campos Honeypot** en los formularios públicos (Contacto y Comentarios) para filtrar bots de spam de forma silenciosa.
  * **Rate Limiting por IP** (`429 Too Many Requests`) en el envío de correos, publicación de comentarios y protección contra fuerza bruta en el login de administrador (bloqueo temporal tras `5` intentos fallidos).
  * **Comparación criptográfica en tiempo constante** (`MessageDigest.isEqual`) para evitar ataques de temporización (*timing attacks*).

---

### Stack Tecnológico

#### Frontend
* **React 19** (`^19.2.8`) y **React Router DOM** (`^7.18.4`)[cite: 14]
* **Vite 8** (`^8.3.0`) y **Oxlint** (`^1.81.0`)[cite: 14]
* **i18next** (`^26.4.2`) y **react-i18next** (`^17.0.15`) para internacionalización completa en Español e Inglés[cite: 14]
* **CSS3 a medida:** Sistema de diseño estilo terminal retro, barras de desplazamiento personalizadas, filtro de ruido SVG y diseño adaptable a dispositivos móviles.

#### Backend
* **Java 25** y **Spring Boot 4.1.1**[cite: 7]
* **Spring Data JPA (Hibernate)** y **PostgreSQL 15**
* **Spring Mail (JavaMailSender)** para envío de correos por SMTP[cite: 3, 7]
* **Bean Validation (Jakarta Validation)** para validación estricta de DTOs[cite: 5, 6, 7, 9]
* **JUnit 5 y Mockito** para pruebas unitarias

#### Infraestructura y DevOps
* **Docker y Docker Compose** (Orquestación multicontenedor con volúmenes persistentes para PostgreSQL y subida de imágenes del blog)
* **Cloudflare** (DNS y Reverse Proxy) / **Oracle Cloud Infrastructure (OCI)**

---

### Puesta en Marcha (Entorno Local)

#### Requisitos previos
* **Docker** y **Docker Compose** instalados en el sistema.
* *(Opcional para ejecución sin Docker)*: **JDK 25** y **Node.js 22+**.

#### 1. Clonar el repositorio
```bash
git clone [https://github.com/FFranDev/personal-web.git](https://github.com/FFranDev/personal-web.git)
cd personal-web
```

#### 2. Configurar las variables de entorno
Copia la plantilla `.env.example` para generar tu archivo `.env` local:
```bash
cp .env.example .env
```
Edita el archivo `.env` con tus credenciales:
```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=examplePassword
POSTGRES_DB=personalwebdb
CORS_ALLOWED_ORIGINS=http://localhost:5173
MAIL_USERNAME=example@gmail.com
MAIL_PASSWORD= xxxx xxxx xxxx xxxx
ADMIN_PASSWORD=exampleAdminPassword
```

#### 3. Construir y levantar los contenedores
```bash
docker compose up --build
```
* **Frontend:** `http://localhost:5173`
* **API Backend:** `http://localhost:8080/api`

---

### Ejecución de Tests Unitarios (Backend)

Para ejecutar la suite de pruebas unitarias con JUnit 5 y Mockito (`AdminAuthServiceTest`, `BlogServiceTest` y `ContactServiceTest`):

```bash
cd backend
./mvnw test
```

---

### Autor y Contacto

* **Francisco Fernández Ugidos**
* **Web:** [https://franfdez.dev](https://franfdez.dev)
* **LinkedIn:** [Francisco Fernández Ugidos](https://www.linkedin.com/in/francisco-fern%C3%A1ndez-ugidos-aa687a384)
* **GitHub:** [@FFranDev](https://github.com/FFranDev)