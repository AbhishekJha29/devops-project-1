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

## Jenkins CI/CD Setup

Jenkins orchestrates the continuous integration and continuous deployment pipeline for this project (running automated tests, building Docker images, and deploying to environments).

### 1. Launch Jenkins Container
Start Jenkins in detached mode using Docker Compose:
```bash
docker compose -f jenkins/docker-compose.yml up -d
```

### 2. Retrieve Initial Admin Password
Extract the auto-generated initial unlock password from the Jenkins container log:
```bash
docker exec jenkins-server cat /var/jenkins_home/secrets/initialAdminPassword
```

### 3. Unlock & Configure Jenkins UI
1. Navigate to [http://localhost:8080](http://localhost:8080) in your web browser.
2. Paste the initial admin password when prompted to unlock Jenkins.
3. Select **"Install suggested plugins"** to install essential plugins (Git, Pipeline, etc.).
4. Create your initial admin user account.
5. Confirm Jenkins URL as `http://localhost:8080/` and complete setup.

### 4. Ensure Required Plugins are Installed
Verify that the following plugins are active in **Manage Jenkins -> Plugins**:
- **Git plugin** (installed by default with suggested plugins)
- **Pipeline** (installed by default with suggested plugins)
- **Docker Pipeline** (install via *Available plugins* if not present)


