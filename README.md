# TripBuddyAI repo layout

This repo has an extra top-level folder. To run the app:

```bash
cd TripBuddyAI          # enter the app folder that holds package.json
npm install             # frontend deps
cd backend && npm install
cd ..
npm run web             # or: npx expo start
```

If you run `npx expo start` from the parent without `cd TripBuddyAI`, Expo will error with `package.json does not exist`.
