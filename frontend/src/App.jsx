import { useState } from 'react';
import PredictionForm from './components/PredictionForm';
import PredictionResult from './components/PredictionResult';
import WaitTimeChart from './components/WaitTimeChart';
import { predictWaitTime } from './services/api';

/**
 * Main application component.
 */
function App() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePredict = async (formData) => {
    setIsLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const result = await predictWaitTime(formData);

      if (result.success) {
        setPrediction(result.data);
        setError(null);
      } else {
        setError(result.error);
        setPrediction(null);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      setPrediction(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <svg
              className="w-10 h-10 text-blue-400 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h1 className="text-3xl font-bold text-gray-100">Wait Time Predictor</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Form */}
          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">
                Queue Parameters
              </h2>
              <PredictionForm onPredict={handlePredict} isLoading={isLoading} />
            </div>

            {/* Prediction Result */}
            {(prediction || error) && (
              <PredictionResult prediction={prediction} error={error} />
            )}
          </div>

          {/* Right Column: Chart */}
          <div>
            <WaitTimeChart prediction={prediction} />
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-3">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-blue-400 mb-2">1. Input Parameters</h4>
              <p>
                Enter the current queue size, average service time per person, and optionally
                the arrival rate.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-400 mb-2">2. ML Prediction</h4>
              <p>
                Our trained regression model analyzes the input and predicts the expected
                waiting time based on historical queue simulation data.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-400 mb-2">3. Visualize Results</h4>
              <p>
                View the prediction on an interactive chart showing the relationship between
                queue size and wait time.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-400 text-sm">
            Built with FastAPI, React, and scikit-learn
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
