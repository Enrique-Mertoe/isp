import React, {useState, useEffect} from "react";
import {
    BarChart3,
    Bell,
    ShieldCheck,
    Zap,
    Server,
    Users,
    Settings,
    MoreHorizontal,
    Search,
    AlertTriangle,
    CheckCircle,
    Clock,
    Wifi,
    Activity,
    Download,
    Upload,
    RefreshCw,
    ChevronDown
} from "lucide-react";
import {useApp} from "../ui/AppContext.tsx";
import Layout from "./home-components/Layout.tsx";

export default function ManagementPage() {
    const {usersCount, packageCount, routerCount, activeUsersCount} = useApp();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Mock data for network health
    const [networkHealth, setNetworkHealth] = useState({
        uptime: "99.98%",
        bandwidth: "8.2 Gbps",
        alerts: 3,
        activeSessions: 2476,
        trafficToday: "14.3 TB",
        peakHour: "8:00 PM - 9:00 PM"
    });

    // Mock data for alerts
    const [alerts, setAlerts] = useState([
        {
            id: 1,
            type: "error",
            message: "Router R12 experiencing high packet loss",
            location: "Node 3, East Wing",
            time: "15 minutes ago"
        },
        {
            id: 2,
            type: "warning",
            message: "Bandwidth threshold exceeded on Business tier",
            location: "Business Network",
            time: "1 hour ago"
        },
        {
            id: 3,
            type: "info",
            message: "Scheduled maintenance on Node 5",
            location: "Node 5, Central Hub",
            time: "Tomorrow, 2:00 AM"
        }
    ]);

    // Mock data for active servers
    const [servers, setServers] = useState([
        {
            id: "srv-001",
            name: "Primary DNS",
            status: "online",
            load: 42,
            uptime: "43d 12h 54m",
            ip: "10.0.3.12"
        },
        {
            id: "srv-002",
            name: "DHCP Server",
            status: "online",
            load: 28,
            uptime: "29d 5h 12m",
            ip: "10.0.3.15"
        },
        {
            id: "srv-003",
            name: "Authentication Server",
            status: "online",
            load: 35,
            uptime: "15d 22h 38m",
            ip: "10.0.3.18"
        },
        {
            id: "srv-004",
            name: "Backup DNS",
            status: "online",
            load: 12,
            uptime: "43d 12h 41m",
            ip: "10.0.3.13"
        },
        {
            id: "srv-005",
            name: "Caching Server",
            status: "maintenance",
            load: 0,
            uptime: "0d 2h 15m",
            ip: "10.0.3.21"
        }
    ]);

    // Mock bandwidth data for the chart
    const [bandwidthData, setBandwidthData] = useState([
        {time: "00:00", download: 4.2, upload: 2.1},
        {time: "04:00", download: 2.3, upload: 1.2},
        {time: "08:00", download: 5.3, upload: 2.5},
        {time: "12:00", download: 7.8, upload: 3.8},
        {time: "16:00", download: 9.2, upload: 4.5},
        {time: "20:00", download: 10.5, upload: 5.2},
        {time: "23:59", download: 6.8, upload: 3.4}
    ]);

    useEffect(() => {
        // Simulate loading data
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    const refreshData = () => {
        setIsRefreshing(true);

        // Simulate refreshing data
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1500);
    };

    // This function would handle the status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case "online":
                return "bg-green-500";
            case "maintenance":
                return "bg-amber-500";
            case "offline":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    // This function would handle the alert icon and color
    const getAlertIcon = (type) => {
        switch (type) {
            case "error":
                return {
                    icon: <AlertTriangle size={18} className="text-red-500"/>,
                    bg: "bg-red-100 dark:bg-red-900/20"
                };
            case "warning":
                return {
                    icon: <AlertTriangle size={18} className="text-amber-500"/>,
                    bg: "bg-amber-100 dark:bg-amber-900/20"
                };
            case "success":
                return {
                    icon: <CheckCircle size={18} className="text-green-500"/>,
                    bg: "bg-green-100 dark:bg-green-900/20"
                };
            case "info":
            default:
                return {
                    icon: <Clock size={18} className="text-blue-500"/>,
                    bg: "bg-blue-100 dark:bg-blue-900/20"
                };
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                    <div className="flex flex-col items-center">
                        <div
                            className="w-16 h-16 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading management dashboard...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">ISP Management Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor and manage network resources and
                            services</p>
                    </div>
                    <div className="flex items-center space-x-3 mt-4 md:mt-0">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="px-4 py-2 pr-10 rounded-lg text-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                            <Search size={16} className="absolute right-3 top-2.5 text-gray-400"/>
                        </div>
                        <button
                            onClick={refreshData}
                            className={`p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isRefreshing ? 'animate-spin text-amber-500' : ''}`}
                        >
                            <RefreshCw size={18}/>
                        </button>
                        <button
                            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
                            <Bell size={18}/>
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                    </div>
                </div>

                {/* Nav Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <nav
                        className="flex space-x-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 pb-2">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`py-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === "overview" ? "text-amber-500 border-b-2 border-amber-500" : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"}`}
                        >
                            Network Overview
                        </button>
                        <button
                            onClick={() => setActiveTab("servers")}
                            className={`py-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === "servers" ? "text-amber-500 border-b-2 border-amber-500" : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"}`}
                        >
                            Servers & Infrastructure
                        </button>
                        <button
                            onClick={() => setActiveTab("security")}
                            className={`py-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === "security" ? "text-amber-500 border-b-2 border-amber-500" : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"}`}
                        >
                            Security
                        </button>
                        <button
                            onClick={() => setActiveTab("settings")}
                            className={`py-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === "settings" ? "text-amber-500 border-b-2 border-amber-500" : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"}`}
                        >
                            System Settings
                        </button>
                    </nav>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
                        <div className="flex justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Routers</p>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{routerCount}</h3>
                            </div>
                            <div
                                className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <Wifi size={20}/>
                            </div>
                        </div>
                        <div className="mt-3 text-xs font-medium text-green-500">
                            <span>+2 this month</span>
                        </div>
                    </div>

                    <div
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
                        <div className="flex justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Clients</p>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{activeUsersCount}</h3>
                            </div>
                            <div
                                className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Users size={20}/>
                            </div>
                        </div>
                        <div className="mt-3 text-xs font-medium text-green-500">
                            <span>+15% from last month</span>
                        </div>
                    </div>

                    <div
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
                        <div className="flex justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Network Uptime</p>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{networkHealth.uptime}</h3>
                            </div>
                            <div
                                className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                <Activity size={20}/>
                            </div>
                        </div>
                        <div className="mt-3 text-xs font-medium text-green-500">
                            <span>+0.05% improvement</span>
                        </div>
                    </div>

                    <div
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
                        <div className="flex justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Alerts</p>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{networkHealth.alerts}</h3>
                            </div>
                            <div
                                className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                                <AlertTriangle size={20}/>
                            </div>
                        </div>
                        <div className="mt-3 text-xs font-medium text-amber-500">
                            <span>+1 from yesterday</span>
                        </div>
                    </div>
                </div>

                {/* Main content area - shows different content based on selected tab */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Network Usage Chart - Takes 2/3 of the width on large screens */}
                    <div
                        className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-800 dark:text-white">Network Bandwidth Usage</h3>
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Download</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Upload</span>
                                </div>
                                <button
                                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <MoreHorizontal size={16} className="text-gray-500"/>
                                </button>
                            </div>
                        </div>

                        {/* SVG Chart Area */}
                        <div className="h-64 relative">
                            <svg viewBox="0 0 700 300" className="w-full h-full">
                                {/* X and Y axes */}
                                <line x1="50" y1="250" x2="650" y2="250" stroke="#CBD5E0" strokeWidth="1"/>
                                <line x1="50" y1="50" x2="50" y2="250" stroke="#CBD5E0" strokeWidth="1"/>

                                {/* X-axis labels */}
                                {bandwidthData.map((point, index) => {
                                    const x = 50 + index * 100;
                                    return (
                                        <text
                                            key={`x-label-${index}`}
                                            x={x}
                                            y="270"
                                            fontSize="12"
                                            textAnchor="middle"
                                            fill="#718096"
                                        >
                                            {point.time}
                                        </text>
                                    );
                                })}

                                {/* Y-axis labels */}
                                {[0, 3, 6, 9, 12].map((value, index) => {
                                    const y = 250 - index * 50;
                                    return (
                                        <text
                                            key={`y-label-${index}`}
                                            x="35"
                                            y={y + 5}
                                            fontSize="12"
                                            textAnchor="end"
                                            fill="#718096"
                                        >
                                            {value} Gbps
                                        </text>
                                    );
                                })}

                                {/* Download Line */}
                                <path
                                    d={`M${bandwidthData.map((point, index) => {
                                        const x = 50 + index * 100;
                                        const y = 250 - (point.download / 12) * 200;
                                        return `${index === 0 ? 'M' : 'L'}${x},${y}`;
                                    }).join(' ')}`}
                                    fill="none"
                                    stroke="#3B82F6"
                                    strokeWidth="2"
                                />

                                {/* Upload Line */}
                                <path
                                    d={`M${bandwidthData.map((point, index) => {
                                        const x = 50 + index * 100;
                                        const y = 250 - (point.upload / 12) * 200;
                                        return `${index === 0 ? 'M' : 'L'}${x},${y}`;
                                    }).join(' ')}`}
                                    fill="none"
                                    stroke="#F59E0B"
                                    strokeWidth="2"
                                />

                                {/* Data points for Download */}
                                {bandwidthData.map((point, index) => {
                                    const x = 50 + index * 100;
                                    const y = 250 - (point.download / 12) * 200;
                                    return (
                                        <circle
                                            key={`download-point-${index}`}
                                            cx={x}
                                            cy={y}
                                            r="4"
                                            fill="#3B82F6"
                                        />
                                    );
                                })}

                                {/* Data points for Upload */}
                                {bandwidthData.map((point, index) => {
                                    const x = 50 + index * 100;
                                    const y = 250 - (point.upload / 12) * 200;
                                    return (
                                        <circle
                                            key={`upload-point-${index}`}
                                            cx={x}
                                            cy={y}
                                            r="4"
                                            fill="#F59E0B"
                                        />
                                    );
                                })}
                            </svg>
                        </div>

                        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                            <p>Peak hour: {networkHealth.peakHour} • Total traffic
                                today: {networkHealth.trafficToday}</p>
                        </div>
                    </div>

                    {/* Alerts Panel - Takes 1/3 of the width on large screens */}
                    <div
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-800 dark:text-white">System Alerts</h3>
                            <button
                                className="text-xs font-medium text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 transition-colors">
                                View All
                            </button>
                        </div>

                        <div className="space-y-3">
                            {alerts.map(alert => {
                                const alertStyle = getAlertIcon(alert.type);
                                return (
                                    <div key={alert.id}
                                         className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                        <div className="flex items-start">
                                            <div className={`p-2 rounded-lg mr-3 ${alertStyle.bg}`}>
                                                {alertStyle.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-gray-800 dark:text-white">{alert.message}</h4>
                                                <div className="mt-1 flex items-center justify-between">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{alert.location}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{alert.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            className="w-full mt-4 py-2 text-center text-sm font-medium text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 border border-amber-500 dark:border-amber-400 rounded-lg transition-colors">
                            Manage Alerts
                        </button>
                    </div>
                </div>

                {/* Server Status Table Section */}
                <div
                    className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-800 dark:text-white">Server Status</h3>
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <select
                                    className="appearance-none pl-3 pr-10 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                                    <option>All Servers</option>
                                    <option>Production</option>
                                    <option>Development</option>
                                    <option>Testing</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-2 text-gray-500"/>
                            </div>
                            <button
                                className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm transition-colors">
                                Add Server
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="px-3 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                                <th className="px-3 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Server
                                    Name
                                </th>
                                <th className="px-3 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">IP
                                    Address
                                </th>
                                <th className="px-3 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Load</th>
                                <th className="px-3 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Uptime</th>
                                <th className="px-3 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {servers.map(server => (
                                <tr key={server.id}
                                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                    <td className="px-3 py-3">
                                        <span
                                            className={`inline-block w-2 h-2 rounded-full ${getStatusColor(server.status)}`}></span>
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="flex items-center">
                                            <Server size={16} className="text-gray-500 mr-2"/>
                                            <span
                                                className="text-sm font-medium text-gray-800 dark:text-white">{server.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{server.ip}</span>
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${
                                                    server.load > 70 ? 'bg-red-500' : server.load > 40 ? 'bg-amber-500' : 'bg-green-500'
                                                }`}
                                                style={{width: `${server.load}%`}}
                                            ></div>
                                        </div>
                                        <span
                                            className="text-xs text-gray-500 dark:text-gray-400 mt-1">{server.load}%</span>
                                    </td>
                                    <td className="px-3 py-3">
                                        <span
                                            className="text-sm text-gray-600 dark:text-gray-400">{server.uptime}</span>
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="flex space-x-2">
                                            <button
                                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400">
                                                <Zap size={16}/>
                                            </button>
                                            <button
                                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400">
                                                <Settings size={16}/>
                                            </button>
                                            <button
                                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400">
                                                <MoreHorizontal size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer with quick stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <h4 className="text-xs font-medium text-amber-800 dark:text-amber-300">Active Sessions</h4>
                            <p className="text-xl font-bold text-amber-900 dark:text-amber-200 mt-1">{networkHealth.activeSessions}</p>
                        </div>
                        <div
                            className="p-3 rounded-lg bg-amber-100 dark:bg-amber-800/30 text-amber-600 dark:text-amber-400">
                            <Users size={20}/>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <h4 className="text-xs font-medium text-blue-800 dark:text-blue-300">Current Bandwidth</h4>
                            <p className="text-xl font-bold text-blue-900 dark:text-blue-200 mt-1">{networkHealth.bandwidth}</p>
                        </div>
                        <div className="flex gap-2">
                            <div
                                className="p-3 rounded-lg bg-blue-100 dark:bg-blue-800/30 text-blue-600 dark:text-blue-400">
                                <Download size={20}/>
                            </div>
                            <div
                                className="p-3 rounded-lg bg-blue-100 dark:bg-blue-800/30 text-blue-600 dark:text-blue-400">
                                <Upload size={20}/>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <h4 className="text-xs font-medium text-green-800 dark:text-green-300">Network Security</h4>
                            <p className="text-xl font-bold text-green-900 dark:text-green-200 mt-1">Protected</p>
                        </div>
                        <div
                            className="p-3 rounded-lg bg-green-100 dark:bg-green-800/30 text-green-600 dark:text-green-400">
                            <ShieldCheck size={20}/>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}