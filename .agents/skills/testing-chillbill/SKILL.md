---
name: testing-chillbill
description: Test ChillBill app end-to-end — FastAPI backend + Expo React Native frontend. Use when verifying CRUD flows, UI rendering, or API connectivity.
---

# Testing ChillBill

## Prerequisites

- Node.js 22.13+ (Expo SDK 56 requirement)
- Python 3.x with pip
- No external credentials needed for Phase 1 (no auth)

## Environment Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- Health check: `curl http://localhost:8000/health` should return `{"status":"ok","app":"ChillBill"}`
- API docs available at `http://localhost:8000/docs`
- SQLite DB is created automatically at `backend/chillbill.db` — delete it for a fresh start

### Frontend
```bash
cd frontend
npm install --legacy-peer-deps
```

**For web testing (no emulator):**
```bash
# Install web dependencies if not present
npx expo install react-dom react-native-web @expo/metro-runtime
npx expo start --web --port 8081
```

**For Android emulator testing:**
```bash
npx expo start --android
```

### API URL Configuration

The API base URL is in `frontend/src/utils/constants.ts`:
- **Android emulator:** `http://10.0.2.2:8000` (default)
- **Web testing:** Temporarily change to `http://localhost:8000`
- **Physical device:** Use your machine's LAN IP

Remember to revert the URL after web testing.

## Key Test Flows

1. **Empty state** — HomeScreen should show "ChillBill" header, $0.00 monthly burden, 3 category sections with "No bills yet"
2. **Add bill** — Click FAB "+", fill form (category chip, provider, bill_type, amount, date, frequency), submit → bill appears in correct category on HomeScreen
3. **Category totals** — Monthly Burden card sums all bills; each category section shows its own subtotal
4. **Urgency badges** — BillCard shows colored badge based on days until billing_date: red (overdue), yellow (<=3d), blue (<=7d), green (>7d)
5. **Form validation** — Submit with empty fields should block (no navigation, no API call)
6. **API CRUD** — `curl http://localhost:8000/api/v1/bills` to verify persistence

## Known Limitations

- **`Alert.alert` on Expo web:** React Native's Alert.alert does not render a visible dialog on web. Validation logic works (blocks form submission) but no error text is shown. This works correctly on native Android. Consider testing validation behavior on Android emulator when available.
- **Expo Router header titles:** Raw route names ("index", "add-bill") may show instead of friendly titles. This is cosmetic.
- **No Firebase Auth in Phase 1:** All API endpoints are open — no authentication needed for testing.

## Devin Secrets Needed

None for Phase 1 testing. Future phases may require:
- Firebase `google-services.json` for Android auth
- LLM API key for agentic optimization loop
- Tavily API key for web search agent
