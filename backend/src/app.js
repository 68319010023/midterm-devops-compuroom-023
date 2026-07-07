const express      = require('express');
const cors         = require('cors');
const comRoutes    = require('./routes/comRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status:    'ok',
    service:   'Computer API',
    timestamp: new Date(),
  });
});

// API Routes
app.use('/api/computers', comRoutes);

module.exports = app;