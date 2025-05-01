import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Users, Wifi, Server, AlertTriangle, Globe, ArrowUpRight,
  Calendar, Clock, BarChart3, PieChart as PieChartIcon,
  Download, Upload, ChevronRight, MoreHorizontal, Map, Search
} from 'lucide-react';
import Layout from "./home-components/Layout.tsx";

// Sample data
const revenueData = [
  { month: 'Jan', amount: 3500000 },
  { month: 'Feb', amount: 3720000 },
  { month: 'Mar', amount: 3850000 },
  { month: 'Apr', amount: 4100000 },
  { month: 'May', amount: 4250000 },
  { month: 'Jun', amount: 4300000 },
  { month: 'Jul', amount: 4500000 },
];

const bandwidthData = [
  { time: '12AM', bandwidth: 120 },
  { time: '3AM', bandwidth: 80 },
  { time: '6AM', bandwidth: 200 },
  { time: '9AM', bandwidth: 450 },
  { time: '12PM', bandwidth: 620 },
  { time: '3PM', bandwidth: 580 },
  { time: '6PM', bandwidth: 740 },
  { time: '9PM', bandwidth: 520 },
];

const customerData = [
  { name: 'Home Fiber', value: 12400 },
  { name: 'Business', value: 2800 },
  { name: 'Enterprise', value: 450 },
  { name: 'Mobile Data', value: 8700 },
];

const issueData = [
  { id: 1, location: 'Nairobi CBD', issue: 'Network Outage', status: 'Critical', time: '10 mins ago' },
  { id: 2, location: 'Mombasa Road', issue: 'Slow Connection', status: 'Medium', time: '35 mins ago' },
  { id: 3, location: 'Westlands', issue: 'Router Failure', status: 'High', time: '1 hour ago' },
  { id: 4, location: 'Kiambu Road', issue: 'Fiber Cut', status: 'Critical', time: '2 hours ago' },
];

const coverageData = [
  { county: 'Nairobi', coverage: 95 },
  { county: 'Mombasa', coverage: 87 },
  { county: 'Kisumu', coverage: 78 },
  { county: 'Nakuru', coverage: 72 },
  { county: 'Eldoret', coverage: 65 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function HomePage() {
  const [activeChart, setActiveChart] = useState('bar');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('grid');

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    // Set current time and date
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-KE'));
      setCurrentDate(now.toLocaleDateString('en-KE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    };

    updateDateTime();
    const clockInterval = setInterval(updateDateTime, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(clockInterval);
    };
  }, []);

  // Format currency for KES
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Status color mapping
  const getStatusColor = (status) => {
    switch(status) {
      case 'Critical': return 'text-red-500 bg-red-100';
      case 'High': return 'text-orange-500 bg-orange-100';
      case 'Medium': return 'text-yellow-500 bg-yellow-100';
      case 'Low': return 'text-green-500 bg-green-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
        <Layout>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        </Layout>
    );
  }

  return (
      <Layout>
        <div className="bg-gray-50 min-h-screen">
          <div className="p-4 md:p-6">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 animate-fadeIn">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
                <div className="flex items-center text-gray-500 mt-1">
                  <Calendar className="h-4 w-4 mr-1"/>
                  <span className="text-sm">{currentDate}</span>
                  <Clock className="h-4 w-4 ml-4 mr-1"/>
                  <span className="text-sm">{currentTime}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2  gap-4 mb-6 animate-fadeInUp"
                 style={{animationDelay: '0.2s'}}>
              <div
                  className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500 transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Customers</p>
                    <h3 className="text-2xl font-bold">24,350</h3>
                    <div className="flex items-center mt-2 text-sm text-green-500">
                      <ArrowUpRight className="h-4 w-4 mr-1"/>
                      <span>12.5% from last month</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-500">
                    <Users className="h-6 w-6"/>
                  </div>
                </div>
              </div>

              <div
                  className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500 transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Active Connections</p>
                    <h3 className="text-2xl font-bold">18,742</h3>
                    <div className="flex items-center mt-2 text-sm text-green-500">
                      <ArrowUpRight className="h-4 w-4 mr-1"/>
                      <span>8.3% from last month</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center text-green-500">
                    <Wifi className="h-6 w-6"/>
                  </div>
                </div>
              </div>

              <div
                  className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500 transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Network Uptime</p>
                    <h3 className="text-2xl font-bold">99.87%</h3>
                    <div className="flex items-center mt-2 text-sm text-green-500">
                      <ArrowUpRight className="h-4 w-4 mr-1"/>
                      <span>0.2% from last month</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-500">
                    <Server className="h-6 w-6"/>
                  </div>
                </div>
              </div>

              <div
                  className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500 transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Active Issues</p>
                    <h3 className="text-2xl font-bold">12</h3>
                    <div className="flex items-center mt-2 text-sm text-red-500">
                      <ArrowUpRight className="h-4 w-4 mr-1"/>
                      <span>3 critical issues</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center text-red-500">
                    <AlertTriangle className="h-6 w-6"/>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className={`grid ${activeView === 'grid' ? 'grid-cols-1 lg:grid-cols-2 gap-6' : 'grid-cols-1 gap-6'}`}>
              {/* Left Column - Revenue Chart */}
              <div
                  className={`bg-white rounded-lg shadow-sm p-5 ${activeView === 'list' ? 'mb-6' : ''} animate-fadeInLeft`}
                  style={{animationDelay: '0.3s'}}>
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-lg font-semibold text-gray-800">Monthly Revenue</h2>
                  <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setActiveChart('bar')}
                        className={`p-1 rounded ${activeChart === 'bar' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                    >
                      <BarChart3 className="h-4 w-4"/>
                    </button>
                    <button
                        onClick={() => setActiveChart('line')}
                        className={`p-1 rounded ${activeChart === 'line' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                    >
                      <ArrowUpRight className="h-4 w-4"/>
                    </button>
                    <button
                        onClick={() => setActiveChart('pie')}
                        className={`p-1 rounded ${activeChart === 'pie' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                    >
                      <PieChartIcon className="h-4 w-4"/>
                    </button>
                  </div>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    {activeChart === 'bar' ? (
                        <BarChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                          <XAxis dataKey="month"/>
                          <YAxis tickFormatter={(value) => `${value / 1000000}M`}/>
                          <Tooltip formatter={(value) => formatCurrency(value)}/>
                          <Bar dataKey="amount" fill="#4F46E5" radius={[4, 4, 0, 0]}/>
                        </BarChart>
                    ) : activeChart === 'line' ? (
                        <LineChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                          <XAxis dataKey="month"/>
                          <YAxis tickFormatter={(value) => `${value / 1000000}M`}/>
                          <Tooltip formatter={(value) => formatCurrency(value)}/>
                          <Line type="monotone" dataKey="amount" stroke="#4F46E5" strokeWidth={2} dot={{r: 4}}
                                activeDot={{r: 6}}/>
                        </LineChart>
                    ) : (
                        <PieChart>
                          <Pie
                              data={customerData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {customerData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                            ))}
                          </Pie>
                          <Legend/>
                          <Tooltip formatter={(value) => `${value} customers`}/>
                        </PieChart>
                    )}
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Revenue (YTD)</p>
                    <p className="text-xl font-bold">{formatCurrency(24220000)}</p>
                  </div>
                  <div className="flex items-center">
                    <button className="text-blue-600 text-sm font-medium flex items-center">
                      View detailed report
                      <ChevronRight className="h-4 w-4 ml-1"/>
                    </button>
                  </div>
                </div>
              </div>

              {/* Middle Column - Network Usage */}
              <div className={`bg-white rounded-lg shadow-sm p-5 ${activeView === 'list' ? 'mb-6' : ''} animate-fadeIn`}
                   style={{animationDelay: '0.4s'}}>
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-lg font-semibold text-gray-800">Network Bandwidth Usage</h2>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="h-5 w-5"/>
                  </button>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={bandwidthData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                      <XAxis dataKey="time"/>
                      <YAxis tickFormatter={(value) => `${value}GB`}/>
                      <Tooltip formatter={(value) => `${value} GB/s`}/>
                      <Line type="monotone" dataKey="bandwidth" stroke="#10B981" strokeWidth={2} dot={{r: 4}}
                            activeDot={{r: 6}}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <div
                          className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3">
                        <Download className="h-4 w-4"/>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Download</p>
                        <p className="font-semibold">5.2 TB</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <div
                          className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                        <Upload className="h-4 w-4"/>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Upload</p>
                        <p className="font-semibold">1.8 TB</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Network Coverage */}
              <div
                  className={`bg-white col-span-2 rounded-lg shadow-sm p-5 ${activeView === 'list' ? 'mb-6' : ''} animate-fadeInRight`}
                  style={{animationDelay: '0.5s'}}>
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-lg font-semibold text-gray-800">Network Coverage</h2>
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-gray-400 mr-2"/>
                    <Map className="h-5 w-5 text-gray-400"/>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mb-4 relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="font-semibold text-blue-800">Kenya Coverage Map</h3>
                    <p className="text-blue-600 text-sm mt-1">45 out of 47 counties covered</p>
                  </div>
                  <div className="absolute right-0 bottom-0 opacity-20">
                    <Globe className="h-24 w-24 text-blue-500"/>
                  </div>
                </div>

                <div className="overflow-hidden">
                  <h3 className="text-sm font-medium text-gray-600 mb-3">Top Counties by Coverage</h3>
                  {coverageData.map((item, index) => (
                      <div key={index} className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.county}</span>
                          <span className="font-medium">{item.coverage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{width: `${item.coverage}%`, transition: 'width 1s ease-in-out'}}
                          ></div>
                        </div>
                      </div>
                  ))}
                  <button className="text-blue-600 text-sm font-medium flex items-center mt-3">
                    View full coverage report
                    <ChevronRight className="h-4 w-4 ml-1"/>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Section - Active Issues */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-5 animate-fadeInUp" style={{animationDelay: '0.6s'}}>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-semibold text-gray-800">Active Network Issues</h2>
                <div className="flex space-x-2">
                  <select
                      className="rounded-md border border-gray-300 text-sm py-1 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="all">All Issues</option>
                    <option value="critical">Critical Only</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                  {issueData.map((issue) => (
                      <tr key={issue.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">#{issue.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{issue.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{issue.issue}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                      <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                        {issue.status}
                      </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{issue.time}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-blue-600 hover:text-blue-800">View Details</button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Custom Animation Styles */}
          <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from { 
            opacity: 0;
            transform: translate3d(0, 30px, 0);
          }
          to { 
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        
        @keyframes fadeInLeft {
          from { 
            opacity: 0;
            transform: translate3d(-30px, 0, 0);
          }
          to { 
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        
        @keyframes fadeInRight {
          from { 
            opacity: 0;
            transform: translate3d(30px, 0, 0);
          }
          to { 
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-fadeInLeft {
          animation: fadeInLeft 0.8s ease-out forwards;
        }
        
        .animate-fadeInRight {
          animation: fadeInRight 0.8s ease-out forwards;
        }
      `}</style>
        </div>
      </Layout>
  );
}