# ChillBill

Personal finance bill management app — track, categorize, and optimize your recurring expenses.

## Architecture

- **Backend**: FastAPI + SQLite (Python)
- **Frontend**: React Native (Expo SDK 56) with TypeScript
- **State Management**: Zustand
- **Categories**: Home & Mortgage, Personal & Investing, Subscriptions

## Project Structure

```
ChillBill/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app + CORS + routes
│   │   ├── database.py      # SQLAlchemy engine + session
│   │   ├── models.py        # Bill, Reminder, AgentInsight models
│   │   ├── schemas.py       # Pydantic request/response schemas
│   │   └── routers/
│   │       ├── bills.py     # CRUD endpoints for bills
│   │       ├── reminders.py # Reminder management
│   │       └── insights.py  # Agent insight endpoints
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/             # Expo Router file-based routes
│   │   │   ├── _layout.tsx  # Root layout (Stack navigator)
│   │   │   ├── index.tsx    # HomeScreen (categories + insights)
│   │   │   └── add-bill.tsx # Add bill form
│   │   ├── components/
│   │   │   ├── BillCard.tsx
│   │   │   ├── CategorySection.tsx
│   │   │   └── AgentInsightBanner.tsx
│   │   ├── store/
│   │   │   └── useBillStore.ts  # Zustand store
│   │   ├── services/
│   │   │   └── api.ts           # Axios API client
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript types
│   │   └── utils/
│   │       └── constants.ts     # Category config, API URL
│   ├── app.json
│   └── package.json
└── README.md
```

## Quick Start

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npx expo start
```

Scan the QR code with Expo Go or press `a` to open in Android emulator.

### Build APK

```bash
cd frontend
npx expo install expo-dev-client
eas build --platform android --profile preview
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/bills | List all bills (filter by ?category=) |
| POST | /api/v1/bills | Create a new bill |
| PUT | /api/v1/bills/{id} | Update a bill |
| DELETE | /api/v1/bills/{id} | Delete a bill |
| GET | /api/v1/reminders | List reminders |
| POST | /api/v1/reminders | Create a reminder |
| GET | /api/v1/insights | Get active agent insights |
| PATCH | /api/v1/insights/{id} | Update insight status |
| GET | /health | Health check |

## Roadmap

- [ ] Firebase Auth (Android)
- [ ] Push notifications via FCM
- [ ] Agentic optimization loop (LangChain + Tavily)
- [ ] APK build via EAS
