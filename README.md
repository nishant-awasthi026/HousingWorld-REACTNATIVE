# HousingWorld

A modern, high-performance real estate mobile application built using React Native and Expo. Users can securely log in, list properties, search and filter listings, and bookmark their favorite properties.

---

## Tech Stack
*   **Frontend**: React Native (Expo Router), TypeScript, Zustand, Reanimated, StyleSheet
*   **Backend & DB**: Supabase (PostgreSQL, Storage Buckets, RLS policies)
*   **Authentication**: Clerk Auth (Expo Secure Store integration)

---

## Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/nishant-awasthi026/HousingWorld-REACTNATIVE.git
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and add the following keys:
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key
```

### 3. Database Setup (Supabase)
Run the SQL schemas, Row-Level Security (RLS) policies, storage buckets setup, and seed data in the **Supabase SQL Editor**:
*   Refer to the full instructions and code in [SUPABASE_QUERIES.md](SUPABASE_QUERIES.md)

### 4. Run the Project
```bash
# Start Expo development server
npx expo start

# Or run directly on platforms
npm run android
npm run ios
npm run web
```

---

## Screenshots

| Sign-In | Sign-Up |
| :---: | :---: |
| ![Sign-In](screenshots/Sign-In%20Page.jpg) | ![Sign-Up](screenshots/Sign-Up%20Page.jpg) |

| Home Page | Search & Filters |
| :---: | :---: |
| ![Home](screenshots/Home%20Page.jpg) | ![Search](screenshots/Search%20Page.jpg) |

| Create Listing | Property Details |
| :---: | :---: |
| ![Create](screenshots/Create%20Page.jpg) | ![Details](screenshots/Prop%20Detailed%20Page.jpg) |

| Saved Properties | Profile Page |
| :---: | :---: |
| ![Saved](screenshots/Saved%20Page.jpg) | ![Profile](screenshots/Profile%20Page.jpg) |
