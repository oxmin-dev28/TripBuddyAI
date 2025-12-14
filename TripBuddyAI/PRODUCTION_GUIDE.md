# 🌍 TripBuddy AI - Production Setup

## ✅ Current Status

Your app is ready with **REAL APIs**:

- ✅ **OpenAI API** - AI route generation
- ✅ **Google Places API** - Real places for ALL cities (Paris, Rome, Barcelona, London, Madrid, Berlin, etc.)
- ✅ **35+ Cities** across Europe, USA, Japan, Thailand

---

## 🚀 Quick Start

### Option 1: Automatic (Recommended)

```bash
cd /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI
./start-app.sh
```

### Option 2: Manual

**Terminal 1 - Backend:**
```bash
cd /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI/backend
npm run dev
```

**Terminal 2 - Mobile App:**
```bash
cd /Users/vladyslav/Desktop/js/tripgid/TripBuddyAI
npx expo start
```

Then:
- Press **`a`** for Android
- Press **`i`** for iOS Simulator
- Scan **QR code** with Expo Go app on your phone
- Press **`w`** for web browser

---

## 🔧 API Configuration

Your `.env` file is configured with:
- ✅ OpenAI API Key
- ✅ Google Places API Key

### Test APIs:

```bash
# Check API status
curl http://localhost:3001/api/status

# Test Paris restaurants
curl "http://localhost:3001/api/places?lat=48.8566&lng=2.3522&type=restaurant"

# Test Rome attractions
curl "http://localhost:3001/api/places?lat=41.9028&lng=12.4964&type=attraction"

# Test Barcelona cafes
curl "http://localhost:3001/api/places?lat=41.3851&lng=2.1734&type=cafe"
```

---

## 🌍 Supported Cities

### 🇫🇷 France
- Paris, Nice, Lyon, Marseille

### 🇮🇹 Italy
- Rome, Milan, Florence, Venice, Naples

### 🇪🇸 Spain
- Madrid, Barcelona, Seville, Valencia

### 🇬🇧 UK
- London, Edinburgh, Manchester

### 🇩🇪 Germany
- Berlin, Munich, Hamburg, Frankfurt

### 🇵🇹 Portugal
- Lisbon, Porto

### 🇬🇷 Greece
- Athens, Santorini

### 🇳🇱 Netherlands
- Amsterdam

### 🇹🇷 Turkey
- Istanbul, Antalya

### 🇯🇵 Japan
- Tokyo, Kyoto, Osaka

### 🇺🇸 USA
- New York, Los Angeles, San Francisco, Miami

### 🇹🇭 Thailand
- Bangkok, Phuket

**Total: 35+ cities** with real Google Places data!

---

## 📱 Features

### ✅ Production Features
- **AI Route Generation** - OpenAI creates personalized itineraries
- **Real Places** - Google Places API for ALL cities
- **Smart Filters** - Cuisine, budget, interests
- **Opening Hours** - Shows if restaurants/places are open
- **Location-Aware**:
  - Home screen → Your GPS location
  - Route planning → Destination city
- **Trip Management** - Save, edit, delete, reorder trips
- **User Profile** - Stats, achievements, preferences

### 🎯 How It Works
1. **Onboarding** - Set preferences (cuisines, budget, interests)
2. **Home Screen** - Shows places near your current location
3. **Generate Route** - AI creates itinerary for chosen city
4. **Map View**:
   - Main map → Your location + nearby places
   - Route map → Destination city places
5. **Day View** - See daily itinerary, vote on places
6. **Profile** - View stats, manage trips

---

## 🛠️ Development

### Build for Production
```bash
cd backend
npm run build
npm start
```

### Check TypeScript
```bash
cd backend
npm run build  # TypeScript compilation

cd ../
npx tsc --noEmit  # Frontend check
```

### Logs
Backend logs: `logs/backend.log`

---

## 📊 API Endpoints

- `GET /health` - Health check
- `GET /api/status` - Check configured services
- `GET /api/places` - Search places by location
  - Query params: `lat`, `lng`, `type`, `cuisines`, `budget`, `interests`, `time`, `openOnly`
- `GET /api/places/:placeId` - Get place details
- `POST /api/plans/generate` - Generate AI route
- `POST /api/vote` - Vote on places
- `GET /api/weather` - Get weather (mock)

---

## 🔒 Environment Variables

Backend `.env`:
```env
PORT=3001
OPENAI_API_KEY=sk-...
GOOGLE_PLACES_API_KEY=AIza...
```

---

## 🎨 Tech Stack

**Frontend:**
- React Native + Expo
- TypeScript
- React Navigation
- react-native-maps
- Context API (state management)
- AsyncStorage (persistence)

**Backend:**
- Node.js + Express
- TypeScript
- OpenAI API
- Google Places API
- Nodemon (hot reload)

---

## 📞 Support

For issues:
1. Check `logs/backend.log`
2. Run `curl http://localhost:3001/api/status`
3. Restart with `./start-app.sh`

---

**Built with ❤️ for smart travel planning**

