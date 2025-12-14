import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initDatabase } from './config/database';

// Import routes
import plansRouter from './routes/plans';
import placesRouter from './routes/places';
import votesRouter from './routes/votes';
import usersRouter from './routes/users';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API status - check which services are configured
app.get('/api/status', async (req, res) => {
  const { testGooglePlacesApi } = await import('./services/googlePlaces');
  const googleTest = await testGooglePlacesApi();
  
  res.json({
    success: true,
    services: {
      openai: !!process.env.OPENAI_API_KEY,
      googlePlaces: !!process.env.GOOGLE_PLACES_API_KEY,
      googlePlacesWorking: googleTest.working,
      database: !!process.env.DATABASE_URL,
    },
    mode: process.env.OPENAI_API_KEY ? 'production' : 'demo',
    message: process.env.OPENAI_API_KEY 
      ? 'All AI services configured' 
      : 'Running in demo mode with mock data',
    googlePlacesStatus: googleTest.message,
  });
});

// Test Google Places API endpoint
app.get('/api/test-places', async (req, res) => {
  console.log('🧪 [API] Testing Google Places API...');
  const { testGooglePlacesApi, searchNearbyPlaces } = await import('./services/googlePlaces');
  
  const apiTest = await testGooglePlacesApi();
  const samplePlaces = await searchNearbyPlaces({
    location: { lat: 48.8566, lng: 2.3522 },
    type: 'restaurant',
  });
  
  res.json({
    success: true,
    apiTest,
    samplePlaces: samplePlaces.slice(0, 5),
    totalPlaces: samplePlaces.length,
  });
});

// API Routes
app.use('/api', plansRouter);
app.use('/api/places', placesRouter);
app.use('/api/vote', votesRouter);
app.use('/api/groups', votesRouter);
app.use('/api/users', usersRouter);

// Weather endpoint (mock for now)
app.get('/api/weather', (req, res) => {
  const { lat, lng } = req.query;
  
  // Mock weather data
  res.json({
    success: true,
    data: {
      temperature: Math.floor(15 + Math.random() * 15),
      condition: ['sunny', 'cloudy', 'partly_cloudy'][Math.floor(Math.random() * 3)],
      humidity: Math.floor(40 + Math.random() * 40),
      icon: '☀️',
    },
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Start server
async function start() {
  try {
    // Initialize database (optional, will log warning if not configured)
    if (process.env.DATABASE_URL) {
      await initDatabase();
    } else {
      console.log('⚠️ Database not configured, running in memory-only mode');
    }

    // Log configuration
    const mode = process.env.NODE_ENV || 'development';
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasGooglePlaces = !!process.env.GOOGLE_PLACES_API_KEY;
    
    console.log('\n' + '='.repeat(60));
    console.log(`🚀 TripBuddy API Server`);
    console.log('='.repeat(60));
    console.log(`📦 Environment: ${mode.toUpperCase()}`);
    console.log(`🔌 Port: ${PORT}`);
    console.log(`\n🔧 Services:`);
    console.log(`   ${hasOpenAI ? '✅' : '❌'} OpenAI API ${hasOpenAI ? '(READY)' : '(Mock mode)'}`);
    console.log(`   ${hasGooglePlaces ? '✅' : '❌'} Google Places API ${hasGooglePlaces ? '(READY)' : '(Mock mode)'}`);
    console.log(`   ${process.env.DATABASE_URL ? '✅' : '❌'} Database ${process.env.DATABASE_URL ? '(Connected)' : '(In-memory)'}`);
    
    if (!hasOpenAI || !hasGooglePlaces) {
      console.log(`\n⚠️  WARNING: Running in ${!hasOpenAI && !hasGooglePlaces ? 'FULL DEMO' : 'PARTIAL DEMO'} mode`);
      if (!hasOpenAI) console.log('   → Add OPENAI_API_KEY to .env for AI route generation');
      if (!hasGooglePlaces) console.log('   → Add GOOGLE_PLACES_API_KEY to .env for real places');
    } else {
      console.log(`\n✨ Production mode: All APIs configured!`);
    }
    
    console.log(`\n📍 Endpoints:`);
    console.log(`   http://localhost:${PORT}/health`);
    console.log(`   http://localhost:${PORT}/api/status`);
    console.log(`   http://localhost:${PORT}/api/test-places`);
    console.log('='.repeat(60) + '\n');

    app.listen(PORT, () => {
      console.log(`✅ Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

export default app;

