"""
Model persistence module for saving and loading trained models.
Uses joblib for efficient model serialization.
"""

import os
import joblib
from typing import Optional


def model_exists(model_path: str = "models/wait_time_model.joblib") -> bool:
    """
    Check if a model file exists at the given path.
    
    Args:
        model_path: Path to the model file
    
    Returns:
        True if model exists, False otherwise
    """
    return os.path.exists(model_path)


def save_model(model, model_path: str = "models/wait_time_model.joblib"):
    """
    Save a trained model to disk using joblib.
    
    Args:
        model: Trained scikit-learn model
        model_path: Path where to save the model
    """
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")


def load_model(model_path: str = "models/wait_time_model.joblib"):
    """
    Load a trained model from disk.
    
    Args:
        model_path: Path to the model file
    
    Returns:
        Loaded model object, or None if file doesn't exist
    """
    if not model_exists(model_path):
        return None
    
    try:
        model = joblib.load(model_path)
        print(f"Model loaded from {model_path}")
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        return None
