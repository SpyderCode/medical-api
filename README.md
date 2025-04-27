# Medical Appointment API

A RESTful API for managing medical appointments between patients and doctors with secure authentication, comprehensive metrics monitoring, and Kubernetes-based deployment with automatic scaling.

## Features

- **User Authentication**: Secure JWT-based authentication for patients and doctors
- **Appointment Management**: Schedule, view, update, and cancel appointments
- **Role-Based Access Control**: Different permissions for patients and doctors
- **API Documentation**: Comprehensive API documentation with Swagger
- **Metrics Monitoring**: Detailed metrics tracking with Prometheus and Grafana
- **Container Orchestration**: Kubernetes deployment with automatic scaling
- **Security**: Protection against common web attacks (CSRF, XSS, injections)

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger/OpenAPI
- **Monitoring**: Prometheus and Grafana
- **Containerization**: Docker
- **Orchestration**: Kubernetes with HorizontalPodAutoscaler
- **Security**: Helmet, rate-limiting, input validation

## API Endpoints

The API provides the following main endpoints:

- `/api/users`: User management (registration, profile)
- `/api/doctors`: Doctor management (registration, availability)
- `/api/appointments`: Appointment management (create, update, cancel)
- `/api-docs`: Swagger API documentation
- `/health`: Health check endpoint
- `/metrics`: Prometheus metrics endpoint

## Deployment Guide

### Prerequisites

- Docker and Docker Compose
- Kubernetes cluster (local like Minikube or cloud-based)
- kubectl CLI
- MongoDB instance (local or cloud-based)

### Environment Variables

Create a `.env` file with the following variables:

```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://username:password@mongodb-host:27017/medical-appointments
JWT_SECRET=your_jwt_secret_key
JWT_LIFETIME=7d
API_URL=https://your-api-domain.com
```

### Local Development

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/medical-appointment-api.git
   cd medical-appointment-api
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

### Docker Deployment

1. Build the Docker image:
   ```
   docker build -t medical-api:latest .
   ```

2. Push to Docker Hub (optional):
   ```
   docker tag medical-api:latest yourusername/medical-api:latest
   docker push yourusername/medical-api:latest
   ```

3. Run with Docker Compose:
   ```
   docker-compose up -d
   ```

### Kubernetes Deployment

1. Update the deployment image repository in `kubernetes/deployment.yaml` if needed.

2. Create a Secret for sensitive data:
   ```
   kubectl create secret generic medical-api-secrets \
     --from-literal=mongodb_uri='mongodb://username:password@mongodb-host:27017/medical-appointments' \
     --from-literal=jwt_secret='your_jwt_secret_key'
   ```

3. Deploy the application:
   ```
   kubectl apply -f kubernetes/deployment.yaml
   kubectl apply -f kubernetes/service.yaml
   kubectl apply -f kubernetes/autoscaler.yaml
   ```

4. Deploy monitoring stack:
   ```
   # Create monitoring namespace
   kubectl create namespace monitoring

   # Deploy Prometheus
   kubectl apply -f kubernetes/monitoring/prometheus-config.yaml
   kubectl apply -f kubernetes/monitoring/prometheus-deployment.yaml
   kubectl apply -f kubernetes/monitoring/prometheus-service.yaml
   
   # Deploy Grafana
   kubectl apply -f kubernetes/monitoring/grafana-secrets.yaml
   kubectl apply -f kubernetes/monitoring/grafana-datasources-configmap.yaml
   kubectl apply -f kubernetes/monitoring/grafana-dashboards-configmap.yaml
   kubectl apply -f kubernetes/monitoring/grafana-deployment.yaml
   kubectl apply -f kubernetes/monitoring/grafana-service.yaml
   
   # Deploy Kubernetes Dashboard
   kubectl apply -f kubernetes/monitoring/dashboard-deployment.yaml
   kubectl apply -f kubernetes/monitoring/dashboard-service.yaml
   ```

5. Access the services:
   - API: http://localhost:30000 (or your cluster IP)
   - Swagger Documentation: http://localhost:30000/api-docs
   - Grafana Dashboard: http://localhost:30300 (user: admin, password: from secret)
   - Kubernetes Dashboard: https://localhost:30001

## Automatic Scaling

The API is configured to automatically scale when:
- CPU usage exceeds 50%
- Memory usage exceeds 50%

This is defined in the `kubernetes/autoscaler.yaml` file and can be monitored through the Grafana dashboard.

## Security Features

- JWT-based authentication
- Rate limiting to prevent brute force attacks
- Helmet for secure HTTP headers
- Input validation to prevent injection attacks
- HTTPS for secure communication (in production)
- Secure cookie settings for session management
- Proper error handling without leaking sensitive information

## Monitoring and Visualization

### Metrics Available

- API request counts and response times
- CPU and memory usage
- Active appointments count
- Registered users by role
- Database connection status
- Pod status and count

### Grafana Dashboards

Two pre-configured dashboards are available:

1. **Medical API Dashboard**: Shows system metrics, pod counts, and business metrics like active appointments and user counts.

2. **Medical API Request Metrics**: Focuses on API performance with request rates, duration, and status codes.

## License

This project is licensed under the MIT License - see the LICENSE file for details.