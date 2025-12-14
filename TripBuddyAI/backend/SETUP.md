# 🔧 Backend Setup Guide

## Quick Start (Demo Mode)

Backend works WITHOUT API keys using mock data:

```bash
cd backend
npm run dev
```

## Full Setup with Real APIs

### 1. Create `.env` file

```bash
cd backend
touch .env
```

### 2. Add API Keys

Edit `backend/.env`:

```env
PORT=3001
NODE_ENV=development

# OpenAI API Key (Required for AI route generation)
# Get it from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-key-here

# Google Places API Key (Optional - uses mock Paris data without it)
# Get it from: https://console.cloud.google.com/apis/credentials
# Enable: Places API, Maps JavaScript API
GOOGLE_PLACES_API_KEY=AIza-your-key-here

# PostgreSQL Database (Optional - works in memory without it)
# Supabase: https://supabase.com
DATABASE_URL=postgresql://user:password@host:5432/tripbuddy
```

## Getting API Keys

### OpenAI API Key
1. Go to https://platform.openai.com
2. Sign up / Log in
3. Go to API Keys section
4. Create new secret key
5. Copy and paste into `.env`

**Pricing**: ~$0.01 per plan generation

### Google Places API Key
1. Go to https://console.cloud.google.com
2. Create new project
3. Enable APIs:
   - Places API
   - Maps JavaScript API  
   - Geocoding API
4. Go to Credentials → Create API Key
5. Restrict key to your domains (optional)
6. Copy and paste into `.env`

**Pricing**: $200 free credit/month

### PostgreSQL Database (Optional)

**Option A: Supabase (Recommended)**
1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy connection string
5. Add to `.env` as `DATABASE_URL`

**Option B: Local PostgreSQL**
```bash
# macOS
brew install postgresql
brew services start postgresql
createdb tripbuddy

# .env
DATABASE_URL=postgresql://localhost:5432/tripbuddy
```

## Check Status

After starting the server, check API status:

```bash
curl http://localhost:3001/api/status
```

Response:
```json
{
  "success": true,
  "services": {
    "openai": true,
    "googlePlaces": true,
    "database": false
  },
  "mode": "production",
  "message": "All AI services configured"
}
```

## Demo Mode Features

Without API keys, you get:
- ✅ Mock Paris places data (16 real locations)
- ✅ Generated itineraries (template-based)
- ✅ Full app functionality
- ✅ No costs

## Production Deployment

### Vercel

```bash
cd backend
vercel --prod
```

Set environment variables in Vercel Dashboard.

### Railway

```bash
railway login
railway init
railway up
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

