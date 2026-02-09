"""
Model training module for wait time prediction.
Trains regression models on synthetic queue data.
"""

import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error
import os

from backend.simulation import generate_queue_data, save_queue_data
from backend.model import save_model


def load_or_generate_data(data_path: str = "data/queue_data.csv") -> pd.DataFrame:
    """
    Load queue data from CSV or generate if it doesn't exist.
    
    Args:
        data_path: Path to the CSV file
    
    Returns:
        DataFrame with queue data
    """
    if os.path.exists(data_path):
        print(f"Loading data from {data_path}")
        return pd.DataFrame(pd.read_csv(data_path))
    else:
        print(f"Data file not found. Generating new data...")
        data = generate_queue_data()
        save_queue_data(data, data_path)
        return data


def train_linear_model(data_path: str = "data/queue_data.csv") -> tuple:
    """
    Train a Linear Regression model on queue data.
    
    Args:
        data_path: Path to the training data CSV
    
    Returns:
        Tuple of (trained_model, r2_score, mse)
    """
    # Load or generate data
    df = load_or_generate_data(data_path)
    
    # Prepare features and target
    # Features: queue_size, avg_service_time, arrival_rate
    X = df[['queue_size', 'avg_service_time', 'arrival_rate']].values
    y = df['waiting_time'].values
    
    # Split data (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Train Linear Regression model
    model = LinearRegression()
    model.fit(X_train, y_train)
    
    # Evaluate model
    y_pred = model.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    
    print(f"Linear Regression - R² Score: {r2:.4f}, MSE: {mse:.2f}")
    
    return model, r2, mse


def train_random_forest_model(data_path: str = "data/queue_data.csv") -> tuple:
    """
    Train a Random Forest Regression model on queue data.
    
    Args:
        data_path: Path to the training data CSV
    
    Returns:
        Tuple of (trained_model, r2_score, mse)
    """
    # Load or generate data
    df = load_or_generate_data(data_path)
    
    # Prepare features and target
    X = df[['queue_size', 'avg_service_time', 'arrival_rate']].values
    y = df['waiting_time'].values
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Train Random Forest model
    model = RandomForestRegressor(n_estimators=100, random_state=42, max_depth=10)
    model.fit(X_train, y_train)
    
    # Evaluate model
    y_pred = model.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    
    print(f"Random Forest - R² Score: {r2:.4f}, MSE: {mse:.2f}")
    
    return model, r2, mse


def train_and_save_model(
    model_type: str = "linear",
    data_path: str = "data/queue_data.csv",
    model_path: str = "models/wait_time_model.joblib"
) -> dict:
    """
    Train a model and save it to disk.
    
    Args:
        model_type: Type of model to train ("linear" or "random_forest")
        data_path: Path to training data
        model_path: Path to save the trained model
    
    Returns:
        Dictionary with model, metrics, and status
    """
    try:
        if model_type == "linear":
            model, r2, mse = train_linear_model(data_path)
        elif model_type == "random_forest":
            model, r2, mse = train_random_forest_model(data_path)
        else:
            raise ValueError(f"Unknown model type: {model_type}")
        
        # Save model
        save_model(model, model_path)
        
        return {
            "status": "success",
            "model_type": model_type,
            "r2_score": float(r2),
            "mse": float(mse),
            "model": model
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }


if __name__ == "__main__":
    # Train model when run directly
    print("Training wait time prediction model...")
    result = train_and_save_model()
    print(f"Training completed: {result}")
