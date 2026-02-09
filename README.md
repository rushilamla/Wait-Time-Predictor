# Wait Time Predictor

A web application that predicts waiting time based on queue size using regression models and simulation. Built with FastAPI backend, React frontend, and scikit-learn for machine learning.

## Features

- **Queue Simulation**: Generate synthetic queue data using Poisson arrivals and exponential service times
- **ML Prediction**: Train and use regression models (Linear Regression, Random Forest) to predict wait times
- **Interactive Visualization**: Chart.js charts showing queue size vs wait time with prediction overlay
- **REST API**: FastAPI endpoints for prediction and model training
- **Model Persistence**: Save and load trained models using joblib
- **Clean UI**: Modern dark theme interface with Tailwind CSS

## Tech Stack

- **Backend**: Python 3.8+, FastAPI, scikit-learn, pandas, numpy, joblib
- **Frontend**: React 18, Vite, Tailwind CSS, Chart.js, Axios
- **ML**: scikit-learn (LinearRegression, RandomForestRegressor)

## Project Structure

```
Wait Time Predictor/
├── backend/
│   ├── main.py              # FastAPI app with /predict and /train endpoints
│   ├── train.py             # Model training logic
│   ├── simulation.py        # Queue simulation data generation
│   ├── model.py             # Model persistence (save/load with joblib)
│   └── __init__.py
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API service
│   │   └── App.jsx          # Main app component
│   └── package.json
├── data/                    # Generated synthetic data (CSV)
├── models/                  # Saved ML models (joblib)
├── requirements.txt
└── README.md
```

## Installation

### Prerequisites

- Python 3.8 or higher
- Node.js 16+ and npm

### Backend Setup

1. Navigate to the project root directory
2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the backend server:
   ```bash
   cd backend
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```

The backend will automatically train a model on startup if one doesn't exist.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000` (or the port shown in the terminal).

## Usage

1. **Start the backend** (port 8000)
2. **Start the frontend** (port 3000)
3. Open your browser and navigate to `http://localhost:3000`
4. Enter queue parameters:
   - Queue Size: Number of people currently in the queue
   - Average Service Time: Time in seconds to serve one person
   - Arrival Rate: (Optional) People arriving per minute
5. Click "Predict Wait Time" to get the prediction
6. View the result card and chart visualization

## API Endpoints

### `POST /predict`

Predict wait time based on queue parameters.

**Request Body:**
```json
{
  "queue_size": 10,
  "avg_service_time": 60,
  "arrival_rate": 2.0  // optional
}
```

**Response:**
```json
{
  "predicted_wait_time_seconds": 600.0,
  "predicted_wait_time_minutes": 10.0,
  "queue_size": 10,
  "avg_service_time": 60.0,
  "arrival_rate": 2.0
}
```

### `POST /train`

Retrain the prediction model.

**Query Parameters:**
- `model_type`: "linear" or "random_forest" (default: "linear")

**Response:**
```json
{
  "status": "success",
  "model_type": "linear",
  "r2_score": 0.95,
  "mse": 1234.56
}
```

### `GET /health`

Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

## Model Training

The model is automatically trained on startup if no saved model exists. The training process:

1. Generates synthetic queue data (300 samples, queue sizes 1-200)
2. Uses features: `queue_size`, `avg_service_time`, `arrival_rate`
3. Trains a Linear Regression model (or Random Forest)
4. Saves the model to `models/wait_time_model.joblib`

To manually retrain:
- Use the `/train` API endpoint
- Or run: `python backend/train.py`

## Simulation Logic

The synthetic data generation uses:
- **Base formula**: `waiting_time ≈ queue_size * avg_service_time`
- **Noise**: Random variance (15% standard deviation) for realism
- **Queue sizes**: 1-200 people
- **Service times**: 30-300 seconds per person
- **Arrival rates**: 0.5-10 people per minute

## Development

### Backend Development

- FastAPI auto-reloads on code changes when using `--reload` flag
- Model files are saved in `models/` directory
- Generated data is saved in `data/queue_data.csv`

### Frontend Development

- Vite provides hot module replacement
- Tailwind CSS is configured for dark theme
- API calls use axios with error handling

## Production Deployment

### Backend

1. Set up a production WSGI server (e.g., Gunicorn with Uvicorn workers)
2. Configure CORS origins in `backend/main.py` for your frontend domain
3. Set environment variables for configuration

### Frontend

1. Build the production bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. Serve the `dist/` folder with a web server (nginx, Apache, etc.)
3. Configure API URL via environment variable `VITE_API_URL`

## Docker (Bonus)

A Dockerfile can be added for containerized deployment:

```dockerfile
# Backend Dockerfile example
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ ./backend/
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## License

This project is built for hackathon/demo purposes.

## Contributing

Feel free to fork and modify for your own projects!
