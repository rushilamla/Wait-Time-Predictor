import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Chart component for visualizing queue size vs wait time with prediction overlay.
 */
const WaitTimeChart = ({ prediction, historicalData }) => {
  const chartRef = useRef(null);

  // Generate sample data points for visualization if no historical data
  const generateSampleData = () => {
    const queueSizes = [];
    const waitTimes = [];
    
    // Generate data points for queue sizes 1-200
    for (let i = 1; i <= 200; i += 5) {
      queueSizes.push(i);
      // Simulate wait time: queue_size * avg_service_time (using default 60s)
      const baseWaitTime = i * 60;
      const noise = baseWaitTime * 0.1 * (Math.random() * 2 - 1); // ±10% noise
      waitTimes.push(Math.max(0, baseWaitTime + noise) / 60); // Convert to minutes
    }
    
    return { queueSizes, waitTimes };
  };

  const { queueSizes, waitTimes } = historicalData || generateSampleData();

  // Prepare chart data
  const chartData = {
    labels: queueSizes,
    datasets: [
      {
        label: 'Expected Wait Time',
        data: waitTimes,
        borderColor: 'rgb(59, 130, 246)', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  // Add prediction point if available
  if (prediction) {
    chartData.datasets.push({
      label: 'Your Prediction',
      data: [
        ...Array(prediction.queue_size - 1).fill(null),
        prediction.predicted_wait_time_minutes,
      ],
      borderColor: 'rgb(34, 197, 94)', // green-500
      backgroundColor: 'rgba(34, 197, 94, 0.8)',
      borderWidth: 0,
      pointRadius: 8,
      pointHoverRadius: 10,
      pointBackgroundColor: 'rgb(34, 197, 94)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      showLine: false,
    });
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#e5e7eb', // gray-200
          font: {
            size: 12,
          },
          usePointStyle: true,
          padding: 15,
        },
      },
      title: {
        display: true,
        text: 'Queue Size vs Wait Time',
        color: '#f3f4f6', // gray-100
        font: {
          size: 18,
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)', // gray-900
        titleColor: '#f3f4f6',
        bodyColor: '#e5e7eb',
        borderColor: '#374151', // gray-700
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(2)} minutes`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Queue Size (people)',
          color: '#d1d5db', // gray-300
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        ticks: {
          color: '#9ca3af', // gray-400
          maxTicksLimit: 10,
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)', // gray-600 with opacity
        },
      },
      y: {
        title: {
          display: true,
          text: 'Wait Time (minutes)',
          color: '#d1d5db', // gray-300
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        ticks: {
          color: '#9ca3af', // gray-400
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)', // gray-600 with opacity
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
      <div className="h-96">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
      {prediction && (
        <p className="mt-4 text-sm text-gray-400 text-center">
          Green dot shows your prediction: {prediction.queue_size} people →{' '}
          {prediction.predicted_wait_time_minutes.toFixed(2)} minutes
        </p>
      )}
    </div>
  );
};

export default WaitTimeChart;
