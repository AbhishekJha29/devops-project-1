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

## GitHub Webhook Integration

GitHub webhooks automatically notify and trigger a Jenkins pipeline build whenever code changes (e.g. `git push`) are pushed to the remote GitHub repository.

### 1. Exposing Local Jenkins via ngrok
Since Jenkins runs locally (`localhost:8080`), GitHub's servers cannot reach it directly. `ngrok` creates a secure public URL tunnel to your local Jenkins port:

```bash
ngrok http 8080
```
Copy the generated `https` forwarding URL (e.g., `https://a1b2c3d4.ngrok-free.app`).

### 2. Configure Webhook in GitHub Repository
1. Go to your repository on GitHub -> **Settings** -> **Webhooks** -> **Add webhook**.
2. Set **Payload URL** to:
   ```text
   <YOUR_NGROK_URL>/github-webhook/
   ```
   *(Example: `https://a1b2c3d4.ngrok-free.app/github-webhook/` - **must include trailing slash!**)*
3. Set **Content type** to `application/json`.
4. Leave **Secret** empty for local setup.
5. Under **Which events would you like to trigger this webhook?**, select **Just the push event**.
6. Click **Add webhook**. Ensure a green checkmark appears after the initial ping test.

### 3. Configure Jenkins Pipeline Job
1. In Jenkins dashboard, click **New Item** -> enter name (e.g., `devops-cicd-pipeline`) -> select **Pipeline** -> click **OK**.
2. Under **Build Triggers**, check **"GitHub hook trigger for GITScm polling"**.
3. Under **Pipeline**:
   - Set **Definition** to `Pipeline script from SCM`.
   - Set **SCM** to `Git`.
   - Set **Repository URL** to your GitHub repo URL (e.g. `https://github.com/AbhishekJha29/devops-project-1.git`).
   - Set **Branch Specifier** to `*/main`.
   - Ensure **Script Path** is set to `Jenkinsfile`.
4. Click **Save**.

## CI Pipeline

The project uses a declarative Jenkins pipeline (`Jenkinsfile`) to automate continuous integration. Every push to the repository triggers the pipeline automatically via GitHub webhook integration.

### Pipeline Stages

1. **Checkout**
   - Automatically checks out the latest commit of the repository into the Jenkins workspace.
2. **Install Dependencies**
   - Executes `npm install` inside the workspace to install all dependencies defined in `package.json` (Express, Jest, Supertest).
3. **Run Tests**
   - Executes `npm test` using Jest.
   - If any test fails, Jest exits with a non-zero exit code, causing the Jenkins pipeline to **immediately fail** and stop execution before building or pushing Docker images.
4. **Build Docker Image**
   - Builds the Docker image from `Dockerfile`.
   - Multi-tags the image with both the Jenkins build number (`<DOCKER_IMAGE>:<BUILD_NUMBER>`) for immutable version tracking and `<DOCKER_IMAGE>:latest`.
5. **Push to Docker Hub**
   - Securely logs into Docker Hub using stored Jenkins credentials (ID: `dockerhub-creds`) via `withCredentials`.
   - Pushes both tags (`:<BUILD_NUMBER>` and `:latest`) to Docker Hub.
   - Logs out of Docker Hub immediately after pushing to maintain security.

### Post-Build Actions

- **`success`**: Prints a success message confirming the build number and successful push to Docker Hub.
- **`failure`**: Prints a failure message directing you to inspect the build console logs.
- **`always`**: Executes `docker image prune -f` on the Jenkins host/agent to clean up dangling and intermediate container layers, preventing disk space depletion over time.

### Viewing Build Results and Logs in Jenkins

1. Open Jenkins at [http://localhost:8080](http://localhost:8080).
2. Click into your pipeline job (e.g., `devops-cicd-pipeline`).
3. **Stage View**: The pipeline overview displays the status and execution time of each stage (green for passed, red for failed).
4. **Console Output**:
   - Click on the desired build number in the **Build History** panel on the left (e.g., `#1`, `#2`).
   - Click **Console Output** from the left navigation menu to view complete real-time execution logs for every stage, including test results and Docker push output.
5. **Pipeline Steps**: Click **Pipeline Steps** to view granular execution logs for each individual command step within a stage.

## Kubernetes Deployment

The application includes declarative Kubernetes manifests in the `/k8s` directory for container orchestration and deployment.

### Manifest Overview

1. **`k8s/deployment.yaml` (Deployment)**:
   - **Replicas**: Runs `2` identical pod replicas for high availability.
   - **Container Image**: `abhishek2906/cicd-demo-app:latest` listening on port `3000`.
   - **Resource Management**:
     - Requests: `100m` CPU, `128Mi` Memory (guaranteed minimum).
     - Limits: `250m` CPU, `256Mi` Memory (maximum threshold).
   - **Health Probes**:
     - `readinessProbe`: Queries `GET /health` on port `3000` before routing traffic to the pod.
     - `livenessProbe`: Queries `GET /health` on port `3000` to detect deadlocks and automatically restart failing containers.
   - **Labels**: Pod template tagged with `app: cicd-demo-app` for service routing.

2. **`k8s/service.yaml` (Service)**:
   - **Type**: `NodePort` (for straightforward local access in Minikube without complex ingress configuration).
   - **Selector**: Targets pods labeled with `app: cicd-demo-app`.
   - **Port Mapping**: Exposes port `80` externally and routes traffic to target port `3000` on the container.

### Deploying Manually with kubectl

1. **Start Minikube cluster**:
   ```bash
   minikube start
   ```

2. **Apply Kubernetes manifests**:
   ```bash
   kubectl apply -f k8s/
   ```

3. **Verify Deployment and Pods**:
   ```bash
   kubectl get deployments
   kubectl get pods -l app=cicd-demo-app
   ```

4. **Verify Service**:
   ```bash
   kubectl get svc cicd-demo-app-service
   ```

5. **Access the Application**:
   ```bash
   minikube service cicd-demo-app-service --url
   ```
   *Test the returned URL with curl or in a browser:*
   ```bash
   curl <MINIKUBE_SERVICE_URL>/
   curl <MINIKUBE_SERVICE_URL>/health
   ```

