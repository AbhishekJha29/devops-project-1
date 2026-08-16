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
    }

    post {
        success {
            echo "CI Pipeline Succeeded! Docker image ${DOCKER_IMAGE}:${BUILD_NUMBER} and ${DOCKER_IMAGE}:latest pushed successfully."
        }
        failure {
            echo "CI Pipeline Failed for build #${BUILD_NUMBER}! Review console logs above for failure details."
        }
        always {
            echo 'Cleaning up dangling Docker images on agent...'
            sh 'docker image prune -f'
        }
    }
}
