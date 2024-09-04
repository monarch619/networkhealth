"use client";
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface NetworkHealthData {
  timestamp: number;
  activeAddresses: number;
  transactionCount: number;
  averageBlockTime: number;
  networkHashRate: number;
  difficulty: number;
  fees: number;
}

interface NetworkOption {
  value: string;
  label: string;
  color: string;
}

const networkOptions: NetworkOption[] = [
  { value: 'bitcoin', label: 'Bitcoin', color: '#F7931A' },
  { value: 'ethereum', label: 'Ethereum', color: '#627EEA' },
  { value: 'cardano', label: 'Cardano', color: '#0033AD' },
  { value: 'polkadot', label: 'Polkadot', color: '#E6007A' },
  { value: 'solana', label: 'Solana', color: '#00FFA3' },
  { value: 'binance', label: 'Binance Smart Chain', color: '#F0B90B' },
];

const timeframeOptions = [
  { value: '1h', label: 'Last 1 hour' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];

const fetchNetworkHealthData = async (network: string, timeframe: string): Promise<NetworkHealthData[]> => {
  // Simulating API call with different data based on network and timeframe
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.1) {  // 10% chance of error for demonstration
        reject(new Error('Network error: Failed to fetch data'));
        return;
      }

      const now = Date.now();
      const data: NetworkHealthData[] = [];
      const intervals = timeframe === '1h' ? 60 : timeframe === '24h' ? 24 : timeframe === '7d' ? 7 : 30;
      const step = timeframe === '1h' ? 60 * 1000 : timeframe === '24h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

      for (let i = intervals - 1; i >= 0; i--) {
        data.push({
          timestamp: now - i * step,
          activeAddresses: Math.floor(Math.random() * 50000) + 100000,
          transactionCount: Math.floor(Math.random() * 200000) + 300000,
          averageBlockTime: Math.random() * 5 + 10,
          networkHashRate: Math.floor(Math.random() * 50000000) + 100000000,
          difficulty: Math.floor(Math.random() * 1000000) + 1000000,
          fees: Math.random() * 10 + 1,
        });
      }
      resolve(data);
    }, 1000);
  });
};

const NetworkHealthMonitor: React.FC = () => {
  const [healthData, setHealthData] = useState<NetworkHealthData[]>([]);
  const [network, setNetwork] = useState<string>('bitcoin');
  const [timeframe, setTimeframe] = useState<string>('24h');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNetworkHealthData(network, timeframe);
      setHealthData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [network, timeframe]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button onClick={fetchData} className="mt-2">Retry</Button>
      </Alert>
    );
  }

  const latestData = healthData[healthData.length - 1];
  const previousData = healthData[healthData.length - 2] || latestData;

  const MetricCard: React.FC<{ title: string; value: number; previousValue: number; format: (n: number) => string }> = ({ title, value, previousValue, format }) => {
    const percentChange = ((value - previousValue) / previousValue) * 100;
    const isPositive = percentChange >= 0;

    return (
      <Card className="bg-gray-800 text-white border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-gray-300">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{format(value)}</div>
          <div className={`flex items-center mt-2 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
            <span>{Math.abs(percentChange).toFixed(2)}%</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const selectedNetwork = networkOptions.find(n => n.value === network) || networkOptions[0];

  return (
    <div className="p-4 max-w-7xl mx-auto bg-gray-900 text-white min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0"
      >
        <h1 className="text-3xl font-bold">Network Health Monitor</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Select value={network} onValueChange={setNetwork}>
            <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select network" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {networkOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: option.color }}></div>
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {timeframeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
      >
        <MetricCard title="Active Addresses" value={latestData.activeAddresses} previousValue={previousData.activeAddresses} format={n => n.toLocaleString()} />
        <MetricCard title="Transaction Count" value={latestData.transactionCount} previousValue={previousData.transactionCount} format={n => n.toLocaleString()} />
        <MetricCard title="Average Block Time" value={latestData.averageBlockTime} previousValue={previousData.averageBlockTime} format={n => `${n.toFixed(2)}s`} />
        <MetricCard title="Network Hash Rate" value={latestData.networkHashRate} previousValue={previousData.networkHashRate} format={n => `${(n / 1000000).toFixed(2)} MH/s`} />
        <MetricCard title="Difficulty" value={latestData.difficulty} previousValue={previousData.difficulty} format={n => n.toLocaleString()} />
        <MetricCard title="Average Transaction Fees" value={latestData.fees} previousValue={previousData.fees} format={n => `$${n.toFixed(2)}`} />
      </motion.div>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-300">Active Addresses Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={healthData}>
                <XAxis dataKey="timestamp" tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()} stroke="#718096" />
                <YAxis stroke="#718096" />
                <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none' }} labelStyle={{ color: '#A0AEC0' }} />
                <Legend />
                <Line type="monotone" dataKey="activeAddresses" stroke={selectedNetwork.color} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-300">Transaction Count Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={healthData}>
                <XAxis dataKey="timestamp" tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()} stroke="#718096" />
                <YAxis stroke="#718096" />
                <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none' }} labelStyle={{ color: '#A0AEC0' }} />
                <Legend />
                <Bar dataKey="transactionCount" fill={selectedNetwork.color} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-300">Network Hash Rate Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={healthData}>
                <XAxis dataKey="timestamp" tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()} stroke="#718096" />
                <YAxis stroke="#718096" />
                <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none' }} labelStyle={{ color: '#A0AEC0' }} />
                <Legend />
                <Area type="monotone" dataKey="networkHashRate" stroke={selectedNetwork.color} fill={`${selectedNetwork.color}33`} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-300">Average Transaction Fees Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={healthData}>
                <XAxis dataKey="timestamp" tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()} stroke="#718096" />
                <YAxis stroke="#718096" />
                <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none' }} labelStyle={{ color: '#A0AEC0' }} />
                <Legend />
                <Line type="monotone" dataKey="fees" stroke={selectedNetwork.color} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
export default NetworkHealthMonitor;