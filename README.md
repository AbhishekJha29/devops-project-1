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
