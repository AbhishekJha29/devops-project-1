# DevOps CI/CD Demo App

A lightweight Node.js Express application designed as a placeholder project for demonstrating a modern DevOps CI/CD pipeline (testing, Docker containerization, and Kubernetes deployment).

## Features

- `GET /`: Returns welcome message and application version in JSON format.
- `GET /health`: Returns health check JSON status (used for Kubernetes probes).
- Environment variable support for `PORT` (defaults to `3000`).

## Setup & Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Application
```bash
npm start
```
By default, the server runs on [http://localhost:3000](http://localhost:3000).

To specify a custom port:
```bash
PORT=8080 npm start
```

### 3. Run Tests
```bash
npm test
```

## Running with Docker

### 1. Build Docker Image
Build the Docker image using the `Dockerfile` (tags it as `devops-cicd-demo:latest`):
```bash
docker build -t devops-cicd-demo:latest .
```

### 2. Run Docker Container
Run the container in detached mode (`-d`), mapping host port 3000 to container port 3000:
```bash
docker run -d -p 3000:3000 --name cicd-demo-container devops-cicd-demo:latest
```

### 3. Verify Container & Endpoints
Check container status:
```bash
docker ps
```

Test endpoints:
```bash
curl http://localhost:3000/
curl http://localhost:3000/health
```

Verify container runs as non-root (`node`) user:
```bash
docker exec cicd-demo-container whoami
```

### 4. Stop and Remove Container
```bash
docker stop cicd-demo-container
docker rm cicd-demo-container
```

