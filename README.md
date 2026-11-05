# SafeHaul Smart Truck Route Planner

SafeHaul plans truck routes, samples checkpoints along each route, and evaluates checkpoint weather against wind, rain, snow, and load rules. Routes and weather require the backend's external routing, geocoding, and forecast services.

## Features

- Enter an origin, destination, departure date/time, and a load weight with a continuous slider.
- Request real driving routes and compare the alternatives returned by the routing service.
- Review checkpoint weather, load-rule notes, route risk, and checkpoint intervals of 10, 25, or 50 miles.
- View a 48-hour forecast timeline and weather risk overlay when forecast data is available.
- Departure input uses the device's local time zone. The backend matches departure and checkpoint arrival instants against UTC forecast timestamps, so browser and route time zones do not shift the selected weather hour.
- If forecast data is unavailable, the app reports that condition and leaves missing checkpoint and route-level safety results uncalculated. It does not create substitute weather values.

The app does not currently provide forecast auto-play, a moving truck animation, or a hosting-guide control.

## Run locally

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py runserver
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

The frontend uses `http://localhost:8000/api` when opened on localhost. Set `VITE_API_BASE_URL` to the deployed backend API base URL for other deployments.
