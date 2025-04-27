const client = require('prom-client');

// Create a Registry to register metrics
const register = new client.Registry();

// Add default metrics (GC, memory usage, etc.)
client.collectDefaultMetrics({
  register,
  prefix: 'medical_api_'
});

// Create HTTP request counter
const httpRequestCounter = new client.Counter({
  name: 'medical_api_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Create HTTP request duration histogram
const httpRequestDuration = new client.Histogram({
  name: 'medical_api_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register]
});

// Create active appointments gauge
const activeAppointmentsGauge = new client.Gauge({
  name: 'medical_api_active_appointments',
  help: 'Number of active (scheduled) appointments',
  registers: [register]
});

// Create users gauge
const usersGauge = new client.Gauge({
  name: 'medical_api_users_total',
  help: 'Total number of registered users',
  labelNames: ['role'],
  registers: [register]
});

// Create database connection status gauge
const dbConnectionGauge = new client.Gauge({
  name: 'medical_api_db_connection_status',
  help: 'Database connection status (1 = connected, 0 = disconnected)',
  registers: [register]
});

// Create API response time by endpoint gauge
const apiResponseTimeGauge = new client.Gauge({
  name: 'medical_api_endpoint_response_time',
  help: 'API endpoint response time in milliseconds',
  labelNames: ['method', 'route'],
  registers: [register]
});

// Middleware to track HTTP request metrics
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Record the end of the request
  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.route ? req.route.path : req.path;
    const method = req.method;
    
    // Increment request counter
    httpRequestCounter.inc({
      method,
      route,
      status_code: res.statusCode
    });
    
    // Record request duration
    httpRequestDuration.observe(
      {
        method,
        route,
        status_code: res.statusCode
      },
      duration / 1000
    );
  });
  
  next();
};

// Metrics endpoint handler
const metricsEndpoint = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
};

// Update metrics functions
const updateActiveAppointments = (count) => {
  activeAppointmentsGauge.set(count);
};

const updateUsersCount = (role, count) => {
  usersGauge.set({ role }, count);
};

module.exports = {
  metricsMiddleware,
  metricsEndpoint,
  updateActiveAppointments,
  updateUsersCount,
  dbConnectionGauge
};