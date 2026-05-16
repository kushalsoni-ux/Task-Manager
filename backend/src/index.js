// Load .env file only in development (Railway injects env vars directly in production)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
}
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    const allowed = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    if (allowed.includes(origin) || origin.endsWith('.railway.app')) {
      return callback(null, true);
    }
    return callback(null, true); // allow all for now
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// Rate limiting
app.use('/api/', rateLimit({ windowMs: 15*60*1000, max: 300,
  message: { error: 'Too many requests, please try again later.' } }));
app.use('/api/auth', rateLimit({ windowMs: 15*60*1000, max: 30,
  message: { error: 'Too many auth attempts.' } }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Health
app.get('/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' }));

// Routes
app.use('/api/auth',          require('./routes/auth.routes'));
app.use('/api/users',         require('./routes/user.routes'));
app.use('/api/projects',      require('./routes/project.routes'));
app.use('/api/tasks',         require('./routes/task.routes'));
app.use('/api/dashboard',     require('./routes/dashboard.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 TeamFlow API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`));

module.exports = app;
