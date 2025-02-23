// Enhanced Responsive React Frontend with AWS Alerts, Records, and Real-Time Bar Graphs
// Install dependencies: npm install axios socket.io-client tailwindcss framer-motion @heroicons/react recharts

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { motion } from 'framer-motion';
import { BellAlertIcon, ClockIcon } from '@heroicons/react/24/solid';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';

const socket = io('http://localhost:4000'); // Replace with your AWS WebSocket URL

const dummyData = [
  { name: '10:00', value: 20 },
  { name: '10:05', value: 25 },
  { name: '10:10', value: 22 },
  { name: '10:15', value: 28 },
  { name: '10:20', value: 24 },
];

const BarGraph = ({ data, label }) => (
  <div className="w-full h-64 my-4 flex justify-center items-center">
    <div className="w-3/4">
      <h3 className="text-center text-lg font-semibold mb-2">{label}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3x 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const AlertCard = ({ alert }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ duration: 0.5 }}
    className="bg-gradient-to-r from-red-400 to-red-600 text-white p-4 rounded-2xl shadow-lg my-3 w-3/4 mx-auto"
  >
    <div className="flex items-center">
      <BellAlertIcon className="w-6 h-6 mr-2" />
      <p className="font-bold text-lg">Alert: {alert.message}</p>
    </div>
    <p className="mt-2">Sensor: {alert.sensor} | Value: {alert.value}</p>
    <p className="text-sm opacity-90">Timestamp: {new Date(alert.timestamp).toLocaleString()}</p>
  </motion.div>
);

const RecordCard = ({ record }) => (
  <div className="bg-white p-4 rounded-2xl shadow-md my-2 flex items-center w-3/4 mx-auto">
    <ClockIcon className="w-5 h-5 mr-3 text-gray-600" />
    <div>
      <p className="font-semibold">{record.sensor}</p>
      <p className="text-sm text-gray-500">Value: {record.value} | {new Date(record.timestamp).toLocaleString()}</p>
    </div>
  </div>
);

function App() {
  const [alerts, setAlerts] = useState([]);
  const [records, setRecords] = useState([]);
  const [temperatureData, setTemperatureData] = useState(dummyData);
  const [vibrationData, setVibrationData] = useState(dummyData);

  useEffect(() => {
    axios.get('https://your-aws-api-endpoint.com/alerts')
      .then(response => setAlerts(response.data))
      .catch(error => console.error('Error fetching alerts:', error));

    axios.get('https://your-aws-api-endpoint.com/records')
      .then(response => setRecords(response.data))
      .catch(error => console.error('Error fetching records:', error));

    socket.on('newAlert', alert => {
      setAlerts(prevAlerts => [alert, ...prevAlerts]);
      alertUser(alert);
    });

    socket.on('newRecord', record => {
      setRecords(prevRecords => [record, ...prevRecords]);
      if (record.sensor === 'Temperature') {
        setTemperatureData(prevData => [...prevData.slice(-9), { name: new Date(record.timestamp).toLocaleTimeString(), value: record.value }]);
        if (record.value > 50) alertUser({ sensor: 'Temperature', message: 'Temperature threshold crossed!', value: record.value });
      }
      if (record.sensor === 'Vibration') {
        setVibrationData(prevData => [...prevData.slice(-9), { name: new Date(record.timestamp).toLocaleTimeString(), value: record.value }]);
        if (record.value > 30) alertUser({ sensor: 'Vibration', message: 'Vibration threshold crossed!', value: record.value });
      }
    });

    return () => socket.disconnect();
  }, []);

  const alertUser = (alert) => {
    if (alert && alert.message) {
      window.alert(`ALERT: ${alert.sensor} - ${alert.message} (Value: ${alert.value})`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-6 flex flex-col items-center justify-center">
      <motion.h1 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1 }}
        className="text-4xl font-extrabold text-center mb-6 text-gray-800"
      >
        🚨 Prevenix Alerts & Real-Time Dashboard
      </motion.h1>

      <div className="w-full max-w-5xl">
        <section className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-3">📊 Real-Time Sensor Data</h2>
          <BarGraph data={temperatureData} label="Temperature" />
          <BarGraph data={vibrationData} label="Vibration" />
        </section>

        <section className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-3">🔔 Real-Time Alerts</h2>
          {alerts.length === 0 ? (
            <p className="text-center text-gray-500">No alerts available</p>
          ) : (
            alerts.map((alert, index) => <AlertCard key={index} alert={alert} />)
          )}
        </section>

        <section className="mt-6 text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-3">📋 Sensor Records</h2>
          {records.length === 0 ? (
            <p className="text-center text-gray-500">No records available</p>
          ) : (
            records.map((record, index) => <RecordCard key={index} record={record} />)
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
