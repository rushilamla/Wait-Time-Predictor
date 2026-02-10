import { useState } from 'react';

/**
 * Form component for inputting queue parameters and triggering predictions.
 */
const PredictionForm = ({ onPredict, isLoading }) => {
  const [formData, setFormData] = useState({
    image: null,
    avg_service_time: '',
    arrival_rate: '',
  });

  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, image: file }));
    if (errors.image) setErrors((prev) => ({ ...prev, image: '' }));

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.image) {
      newErrors.image = 'Please upload a queue image';
    }

    if (!formData.avg_service_time || formData.avg_service_time <= 0) {
      newErrors.avg_service_time = 'Average service time must be greater than 0';
    }

    if (formData.arrival_rate && formData.arrival_rate <= 0) {
      newErrors.arrival_rate = 'Arrival rate must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onPredict({
      image: formData.image,
      avg_service_time: parseFloat(formData.avg_service_time),
      arrival_rate: formData.arrival_rate ? parseFloat(formData.arrival_rate) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="image"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Upload Queue Image <span className="text-red-400">*</span>
        </label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/*"
          onChange={handleFileChange}
          required
          className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 ${
            errors.image ? 'border-red-500' : 'border-gray-700'
          }`}
        />
        {errors.image && (
          <p className="mt-1 text-sm text-red-400">{errors.image}</p>
        )}
        {previewUrl && (
          <div className="mt-3">
            <img
              src={previewUrl}
              alt="Queue preview"
              className="w-full max-h-64 object-contain rounded-lg border border-gray-700"
            />
            <p className="mt-1 text-xs text-gray-400">
              We’ll count people in the image to estimate queue size.
            </p>
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="avg_service_time"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Average Service Time (seconds) <span className="text-red-400">*</span>
        </label>
        <input
          type="number"
          id="avg_service_time"
          name="avg_service_time"
          value={formData.avg_service_time}
          onChange={handleChange}
          min="1"
          step="0.1"
          required
          className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 ${
            errors.avg_service_time ? 'border-red-500' : 'border-gray-700'
          }`}
          placeholder="e.g., 60 (1 minute per person)"
        />
        {errors.avg_service_time && (
          <p className="mt-1 text-sm text-red-400">{errors.avg_service_time}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="arrival_rate"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Arrival Rate (people per minute) <span className="text-gray-500 text-xs">(Optional)</span>
        </label>
        <input
          type="number"
          id="arrival_rate"
          name="arrival_rate"
          value={formData.arrival_rate}
          onChange={handleChange}
          min="0.1"
          step="0.1"
          className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 ${
            errors.arrival_rate ? 'border-red-500' : 'border-gray-700'
          }`}
          placeholder="e.g., 2.0 (default: 2.0)"
        />
        {errors.arrival_rate && (
          <p className="mt-1 text-sm text-red-400">{errors.arrival_rate}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          Leave empty to use default value (2.0 people/minute)
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${
          isLoading
            ? 'bg-gray-700 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Predicting...
          </span>
        ) : (
          'Predict Wait Time'
        )}
      </button>
    </form>
  );
};

export default PredictionForm;
