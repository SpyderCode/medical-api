# Medical API Project

A Kubernetes-ready medical appointment management API with monitoring capabilities using Prometheus and Grafana.

## Features

- User authentication and authorization
- Doctor and patient management
- Appointment scheduling and tracking
- Containerized with Docker
- Kubernetes deployment configuration
- Monitoring with Prometheus and custom Grafana dashboards
- Automatic scaling based on CPU usage

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Docker
- Kubernetes
- Prometheus
- Grafana

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB
- Docker and Docker Compose (for containerization)
- Kubernetes cluster (for deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SpyderCode/medical-api.git
cd medical-api
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the application:
```bash
npm start
```

### Docker Deployment

```bash
docker pull spinneowo/medical-api:latest
docker run -p 3000:3000 spinneowo/medical-api
```

### Kubernetes Deployment

```bash
kubectl apply -f kubernetes/
```

## Monitoring

The application comes with built-in monitoring using Prometheus and Grafana dashboards:

- Medical API Dashboard: Shows overall system health, pod counts, and resource usage
- API Metrics Dashboard: Displays detailed API request metrics and performance data

## License

MIT License

## Author

- SpyderCode (GitHub)
- spinneowo (DockerHub)