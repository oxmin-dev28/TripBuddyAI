import OpenAI from 'openai';
import { UserPreferences, Location, PlaceOption, TimeSlot, DayPlan } from '../types';

// Initialize OpenAI client only if API key is available
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

interface GeneratePlanParams {
  preferences: UserPreferences;
  location: Location;
  nearbyPlaces: PlaceOption[];
  weather?: string;
}

export async function generateTripPlan(params: GeneratePlanParams): Promise<DayPlan[]> {
  const { preferences, location, nearbyPlaces, weather } = params;
  
  // If no OpenAI API key, use default plan generation
  if (!openai) {
    console.log('⚠️ OpenAI API key not configured, using default plan generation');
    return generateDefaultPlan(preferences, nearbyPlaces);
  }
  
  const systemPrompt = `You are a professional travel planner AI. Generate a detailed day-by-day travel itinerary based on user preferences and available places. 
  
  IMPORTANT: Return ONLY valid JSON, no markdown, no explanations.`;

  const userPrompt = `Create a ${preferences.days}-day travel plan with the following:
  
User Preferences:
- Countries of interest: ${preferences.countries.join(', ')}
- Favorite cuisines: ${preferences.cuisines.join(', ')}
- Activity style: ${preferences.activityType}
- Budget level: ${preferences.budget}
- Interests: ${preferences.interests.join(', ')}

Current location: ${location.city || 'Unknown'}, ${location.country || 'Unknown'}
Weather: ${weather || 'Pleasant'}

Available nearby places:
${nearbyPlaces.slice(0, 20).map(p => `- ${p.name} (${p.type}, rating: ${p.rating}, price: ${p.priceLevel})`).join('\n')}

Generate a JSON array of day plans with this exact structure:
[
  {
    "dayNumber": 1,
    "date": "2024-01-01",
    "slots": [
      {
        "time": "09:00",
        "type": "breakfast",
        "title": "Завтрак",
        "options": [
          {
            "id": "unique-id-1",
            "googlePlaceId": "place-id",
            "name": "Place Name",
            "type": "breakfast",
            "rating": 4.5,
            "priceLevel": "$$",
            "distance": "300m",
            "duration": "5 мин",
            "address": "Address string",
            "isOpen": true
          }
        ]
      }
    ]
  }
]

Requirements:
1. Each day should have 4-6 time slots covering breakfast, activities, lunch, more activities, and dinner
2. Times should be realistic (breakfast 8-10am, lunch 12-2pm, dinner 7-9pm)
3. Include 2-3 options per slot when possible
4. Match activities to user interests
5. Consider budget level for price recommendations
6. Use Russian language for titles (e.g., "Завтрак", "Обед", "Ужин", "Прогулка")
7. Distance in meters or kilometers, duration in minutes

Return ONLY the JSON array, no additional text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || '{"days": []}';
    
    // Parse the response
    const parsed = JSON.parse(responseText);
    
    // Handle both array and object with days property
    const days: DayPlan[] = Array.isArray(parsed) ? parsed : (parsed.days || []);
    
    // Validate and enrich the plan
    return enrichPlanWithPlaces(days, nearbyPlaces);
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Return a default plan if AI fails
    return generateDefaultPlan(preferences, nearbyPlaces);
  }
}

function enrichPlanWithPlaces(days: DayPlan[], nearbyPlaces: PlaceOption[]): DayPlan[] {
  // Match AI-generated places with actual Google Places data
  return days.map(day => ({
    ...day,
    slots: day.slots.map(slot => ({
      ...slot,
      options: slot.options.map(option => {
        // Try to find matching place from nearby places
        const matchingPlace = nearbyPlaces.find(
          p => p.name.toLowerCase().includes(option.name.toLowerCase()) ||
               option.name.toLowerCase().includes(p.name.toLowerCase())
        );
        
        if (matchingPlace) {
          return {
            ...option,
            googlePlaceId: matchingPlace.googlePlaceId,
            rating: matchingPlace.rating,
            priceLevel: matchingPlace.priceLevel,
            photoUrl: matchingPlace.photoUrl,
            address: matchingPlace.address,
          };
        }
        
        return option;
      }),
    })),
  }));
}

function generateDefaultPlan(preferences: UserPreferences, places: PlaceOption[]): DayPlan[] {
  const days: DayPlan[] = [];
  const restaurants = places.filter(p => ['restaurant', 'cafe', 'bakery'].includes(p.type));
  const attractions = places.filter(p => !['restaurant', 'cafe', 'bakery'].includes(p.type));
  
  for (let i = 0; i < preferences.days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    const slots: TimeSlot[] = [
      {
        time: '09:00',
        type: 'breakfast',
        title: 'Завтрак',
        options: restaurants.slice(0, 2).map((p, idx) => ({
          ...p,
          id: `breakfast-${i}-${idx}`,
        })),
      },
      {
        time: '11:00',
        type: 'attraction',
        title: 'Достопримечательность',
        options: attractions.slice(0, 2).map((p, idx) => ({
          ...p,
          id: `attraction-${i}-${idx}`,
        })),
      },
      {
        time: '13:00',
        type: 'lunch',
        title: 'Обед',
        options: restaurants.slice(2, 4).map((p, idx) => ({
          ...p,
          id: `lunch-${i}-${idx}`,
        })),
      },
      {
        time: '15:00',
        type: 'activity',
        title: 'Активность',
        options: attractions.slice(2, 4).map((p, idx) => ({
          ...p,
          id: `activity-${i}-${idx}`,
        })),
      },
      {
        time: '19:00',
        type: 'dinner',
        title: 'Ужин',
        options: restaurants.slice(4, 6).map((p, idx) => ({
          ...p,
          id: `dinner-${i}-${idx}`,
        })),
      },
    ];

    days.push({
      dayNumber: i + 1,
      date: date.toISOString().split('T')[0],
      slots,
    });
  }

  return days;
}

