// e.g. in frontend/src/components/SimpleWaitTimeChart.jsx
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SimpleWaitTimeChart = ({ prediction, queueSizes = [], waitTimes = [] }) => {
  // queueSizes: e.g. [0, 5, 10, 15, 20]
  // waitTimes: corresponding predicted wait times from model or simple formula

  const data = {
    labels: queueSizes.length > 0 ? queueSizes : ['0', '5', '10', '15', '20'], // fallback
    datasets: [
      {
        label: 'Expected Wait Time',
        data: waitTimes.length > 0 ? waitTimes : queueSizes.map(q => q * 120), // fallback example: 2 min/person
        borderColor: '#3b82f6', // blue
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.3, // slight curve
        fill: false,
      },
      // Your new prediction point
      ...(prediction
        ? [{
            label: 'Your Prediction',
            data: Array(queueSizes.length).fill(null).concat([prediction.waitTimeSeconds]), // only show at end or find index
            borderColor: '#ef4444',
            backgroundColor: '#ef4444',
            pointRadius: 8,
            pointHoverRadius: 12,
            type: 'scatter', // mix line + point
          }]
        : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#e5e7eb' } }, // light text for dark mode
      title: { display: true, text: 'Wait Time vs Queue Size', color: '#e5e7eb' },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: {
        title: { display: true, text: 'People in Queue', color: '#9ca3af' },
        ticks: { color: '#9ca3af' },
        grid: { color: '#374151' },
      },
      y: {
        title: { display: true, text: 'Estimated Wait (seconds)', color: '#9ca3af' },
        ticks: { color: '#9ca3af' },
        grid: { color: '#374151' },
      },
    },
  };

  return <div className="h-80 w-full"><Line data={data} options={options} /></div>;
};

export default SimpleWaitTimeChart;