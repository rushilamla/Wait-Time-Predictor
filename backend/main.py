"""
FastAPI application for Wait Time Predictor.
Provides REST API endpoints for prediction and model training.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import os

from backend.model import model_exists, load_model, save_model
from backend.train import train_and_save_model


# Initialize FastAPI app
app = FastAPI(
    title="Wait Time Predictor API",
    description="API for predicting waiting times based on queue size",
    version="1.0.0"
)
origins = [
    "https://wait-time-predictor.vercel.app"  # your frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models for request validation
class PredictionRequest(BaseModel):
    """Request model for prediction endpoint."""
    queue_size: int = Field(..., gt=0, description="Number of people in queue")
    avg_service_time: float = Field(..., gt=0, description="Average service time per person in seconds")
    arrival_rate: Optional[float] = Field(None, gt=0, description="Arrival rate in people per minute (optional)")


class PredictionResponse(BaseModel):
    """Response model for prediction endpoint."""
    predicted_wait_time_seconds: float = Field(..., description="Predicted wait time in seconds")
    predicted_wait_time_minutes: float = Field(..., description="Predicted wait time in minutes")
    queue_size: int
    avg_service_time: float
    arrival_rate: Optional[float] = None


class TrainResponse(BaseModel):
    """Response model for training endpoint."""
    status: str
    model_type: Optional[str] = None
    r2_score: Optional[float] = None
    mse: Optional[float] = None
    error: Optional[str] = None


# Global model variable (loaded on startup)
model = None


def ensure_model_exists():
    """Ensure a trained model exists, train if it doesn't."""
    global model
    
    model_path = "models/wait_time_model.joblib"
    
    if not model_exists(model_path):
        print("Model not found. Training new model...")
        result = train_and_save_model(model_type="linear", model_path=model_path)
        
        if result["status"] == "error":
            raise RuntimeError(f"Failed to train model: {result.get('error')}")
        
        print(f"Model trained successfully. R² Score: {result['r2_score']:.4f}")
    
    # Load the model
    model = load_model(model_path)
    
    if model is None:
        raise RuntimeError("Failed to load model")


# Startup event: Auto-train model if it doesn't exist
@app.on_event("startup")
async def startup_event():
    """Initialize model on application startup."""
    try:
        ensure_model_exists()
        print("Wait Time Predictor API started successfully!")
    except Exception as e:
        print(f"Warning: {e}")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Wait Time Predictor API",
        "version": "1.0.0",
        "endpoints": {
            "/predict": "POST - Predict wait time",
            "/train": "POST - Retrain model",
            "/health": "GET - Health check"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    model_path = "models/wait_time_model.joblib"
    model_loaded = model is not None and model_exists(model_path)
    
    return {
        "status": "healthy" if model_loaded else "unhealthy",
        "model_loaded": model_loaded
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict_wait_time(request: PredictionRequest):
    """
    Predict waiting time based on queue parameters.
    
    Args:
        request: PredictionRequest with queue_size, avg_service_time, and optional arrival_rate
    
    Returns:
        PredictionResponse with predicted wait time in seconds and minutes
    """
    global model
    
    # Ensure model is loaded
    if model is None:
        ensure_model_exists()
    
    if model is None:
        raise HTTPException(
            status_code=500,
            detail="Model not available. Please train the model first."
        )
    
    # Use default arrival rate if not provided
    arrival_rate = request.arrival_rate if request.arrival_rate is not None else 2.0
    
    # Prepare features for prediction
    # Features: [queue_size, avg_service_time, arrival_rate]
    features = [[request.queue_size, request.avg_service_time, arrival_rate]]
    
    try:
        # Make prediction
        predicted_seconds = model.predict(features)[0]
        
        # Ensure non-negative prediction
        predicted_seconds = max(0, predicted_seconds)
        predicted_minutes = predicted_seconds / 60.0
        
        return PredictionResponse(
            predicted_wait_time_seconds=round(predicted_seconds, 2),
            predicted_wait_time_minutes=round(predicted_minutes, 2),
            queue_size=request.queue_size,
            avg_service_time=request.avg_service_time,
            arrival_rate=arrival_rate if request.arrival_rate is not None else None
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


@app.post("/train", response_model=TrainResponse)
async def train_model(model_type: str = "linear"):
    """
    Retrain the wait time prediction model.
    
    Args:
        model_type: Type of model to train ("linear" or "random_forest")
    
    Returns:
        TrainResponse with training status and metrics
    """
    global model
    
    if model_type not in ["linear", "random_forest"]:
        raise HTTPException(
            status_code=400,
            detail="model_type must be 'linear' or 'random_forest'"
        )
    
    try:
        result = train_and_save_model(
            model_type=model_type,
            model_path="models/wait_time_model.joblib"
        )
        
        if result["status"] == "success":
            # Reload the model
            model = load_model("models/wait_time_model.joblib")
            
            return TrainResponse(
                status="success",
                model_type=result["model_type"],
                r2_score=result["r2_score"],
                mse=result["mse"]
            )
        else:
            return TrainResponse(
                status="error",
                error=result.get("error", "Unknown error")
            )
    except Exception as e:
        return TrainResponse(
            status="error",
            error=str(e)
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
