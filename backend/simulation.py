"""
Queue simulation module for generating synthetic queue data.
Simulates waiting times based on queue size, service time, and arrival rate.
"""

import numpy as np
import pandas as pd
import os


def generate_queue_data(
    min_queue_size: int = 1,
    max_queue_size: int = 200,
    num_samples: int = 300,
    noise_level: float = 0.15
) -> pd.DataFrame:
    """
    Generate synthetic queue data for training the wait time prediction model.
    
    Formula: waiting_time ≈ queue_size * avg_service_time + noise
    
    Args:
        min_queue_size: Minimum queue size to simulate
        max_queue_size: Maximum queue size to simulate
        num_samples: Number of data points to generate
        noise_level: Standard deviation of noise as fraction of mean (0.15 = 15%)
    
    Returns:
        DataFrame with columns: queue_size, avg_service_time, arrival_rate, waiting_time
    """
    np.random.seed(42)  # For reproducibility
    
    data = []
    
    for _ in range(num_samples):
        # Random queue size between min and max
        queue_size = np.random.randint(min_queue_size, max_queue_size + 1)
        
        # Random average service time (between 30 seconds and 5 minutes)
        avg_service_time = np.random.uniform(30, 300)
        
        # Random arrival rate (between 0.5 and 10 people per minute)
        arrival_rate = np.random.uniform(0.5, 10.0)
        
        # Base waiting time: queue_size * avg_service_time
        # This represents the time to serve all people currently in queue
        base_wait_time = queue_size * avg_service_time
        
        # Add realistic noise (variance increases with queue size)
        noise = np.random.normal(0, base_wait_time * noise_level)
        waiting_time = max(0, base_wait_time + noise)  # Ensure non-negative
        
        data.append({
            'queue_size': queue_size,
            'avg_service_time': avg_service_time,
            'arrival_rate': arrival_rate,
            'waiting_time': waiting_time
        })
    
    df = pd.DataFrame(data)
    return df


def save_queue_data(df: pd.DataFrame, filepath: str = "data/queue_data.csv"):
    """
    Save generated queue data to CSV file.
    
    Args:
        df: DataFrame containing queue data
        filepath: Path to save the CSV file
    """
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    df.to_csv(filepath, index=False)
    print(f"Queue data saved to {filepath}")


if __name__ == "__main__":
    # Generate and save data when run directly
    print("Generating synthetic queue data...")
    data = generate_queue_data()
    save_queue_data(data)
    print(f"Generated {len(data)} data points")
    print(data.head())
