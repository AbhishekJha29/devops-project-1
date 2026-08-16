pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'abhishek2906/cicd-demo-app'
    }

    triggers {
        githubPush()
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code from GitHub repository...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            agent {
                docker { image 'node:20-alpine' }
            }
            steps {
                echo 'Installing application dependencies...'
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            agent {
                docker { image 'node:20-alpine' }
            }
            steps {
                echo 'Running automated tests with Jest...'
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Building Docker image: ${DOCKER_IMAGE}:${BUILD_NUMBER} and ${DOCKER_IMAGE}:latest..."
                sh "docker build -t ${DOCKER_IMAGE}:${BUILD_NUMBER} -t ${DOCKER_IMAGE}:latest ."
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo 'Logging in to Docker Hub and pushing image tags...'
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                    sh "docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}"
                    sh "docker push ${DOCKER_IMAGE}:latest"
                    sh 'docker logout'
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo "Deploying build #${BUILD_NUMBER} (${DOCKER_IMAGE}:${BUILD_NUMBER}) to Kubernetes..."
                sh 'kubectl apply -f k8s/deployment.yaml'
                sh 'kubectl apply -f k8s/service.yaml'
                sh "kubectl set image deployment/cicd-demo-app cicd-demo-app=${DOCKER_IMAGE}:${BUILD_NUMBER}"
                sh 'kubectl rollout status deployment/cicd-demo-app'
            }
        }
    }

    post {
        success {
            echo "CI/CD Pipeline Succeeded! Docker image ${DOCKER_IMAGE}:${BUILD_NUMBER} built, pushed, and deployed to Kubernetes successfully."
        }
        failure {
            echo "CI/CD Pipeline Failed for build #${BUILD_NUMBER}! Review console logs above for failure details."
        }
        always {
            echo 'Cleaning up dangling Docker images on agent...'
            sh 'docker image prune -f'
        }
    }
}
