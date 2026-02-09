/**
 * Component for displaying prediction results in a card format.
 */
const PredictionResult = ({ prediction, error }) => {
  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
        <div className="flex items-center">
          <svg
            className="w-6 h-6 text-red-400 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-red-400">Error</h3>
        </div>
        <p className="mt-2 text-red-300">{error}</p>
      </div>
    );
  }

  if (!prediction) {
    return null;
  }

  const { predicted_wait_time_minutes, predicted_wait_time_seconds, queue_size, avg_service_time, arrival_rate } = prediction;

  // Format time display
  const hours = Math.floor(predicted_wait_time_minutes / 60);
  const minutes = Math.floor(predicted_wait_time_minutes % 60);
  const seconds = Math.floor(predicted_wait_time_seconds % 60);

  const formatTime = () => {
    const parts = [];
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
    if (seconds > 0 && hours === 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
    return parts.join(', ') || 'Less than a second';
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
      <div className="flex items-center mb-4">
        <svg
          className="w-8 h-8 text-blue-400 mr-3"
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
        <h2 className="text-2xl font-bold text-gray-100">Prediction Result</h2>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Estimated Wait Time</p>
          <p className="text-3xl font-bold text-blue-400">
            {predicted_wait_time_minutes.toFixed(2)} minutes
          </p>
          <p className="text-lg text-gray-300 mt-1">
            ({formatTime()})
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {predicted_wait_time_seconds.toFixed(2)} seconds total
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
          <div>
            <p className="text-sm text-gray-400">Queue Size</p>
            <p className="text-lg font-semibold text-gray-200">{queue_size} people</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Service Time</p>
            <p className="text-lg font-semibold text-gray-200">
              {avg_service_time.toFixed(1)}s per person
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Arrival Rate</p>
            <p className="text-lg font-semibold text-gray-200">
              {arrival_rate ? `${arrival_rate.toFixed(1)}/min` : '2.0/min (default)'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionResult;
