import React, {useState} from "react";
import {
    Wifi,
    Server,
    Settings,
    Activity,
    Users,
    Clock,
    Shield,
    Cpu,
    HardDrive,
    BarChart2,
    Zap,
    ArrowLeft,
    RefreshCw
} from "lucide-react";
import "../main.scss";
import LayoutNavigator from "./home-components/LayoutNavigator.tsx";

// TypeScript interfaces
interface DeviceStats {
    cpuUsage: number;
    memoryUsage: number;
    temperature: number;
    uptime: string;
    connectedClients: number;
    bandwidth: {
        download: number;
        upload: number;
    };
}

interface InterfaceStatus {
    name: string;
    status: "active" | "inactive";
    type: "ethernet" | "wireless" | "bridge";
    rxData: number;
    txData: number;
}

interface MikrotikDevice {
    id: string;
    model: string;
    serialNumber: string;
    firmwareVersion: string;
    ipAddress: string;
    lastSeen: string;
    status: "online" | "offline" | "warning";
    stats: DeviceStats;
    interfaces: InterfaceStatus[];
}

// Mock data
const mockDevice: MikrotikDevice = {
    id: "MKT-12345",
    model: "RouterBOARD 3011UiAS",
    serialNumber: "H78G4J2L5K1P",
    firmwareVersion: "6.49.2",
    ipAddress: "192.168.1.1",
    lastSeen: "Just now",
    status: "online",
    stats: {
        cpuUsage: 32,
        memoryUsage: 47,
        temperature: 41,
        uptime: "157 days, 14 hours",
        connectedClients: 18,
        bandwidth: {
            download: 78.5,
            upload: 12.3
        }
    },
    interfaces: [
        {name: "ether1", status: "active", type: "ethernet", rxData: 128.5, txData: 42.3},
        {name: "ether2", status: "active", type: "ethernet", rxData: 85.2, txData: 13.1},
        {name: "wlan1", status: "active", type: "wireless", rxData: 43.7, txData: 8.6},
        {name: "bridge1", status: "active", type: "bridge", rxData: 22.1, txData: 5.4},
        {name: "ether3", status: "inactive", type: "ethernet", rxData: 0, txData: 0}
    ]
};

// Utility functions
const formatBandwidth = (value: number): string => {
    return value < 1 ? `${(value * 1000).toFixed(0)} Kbps` : `${value.toFixed(1)} Mbps`;
};

const formatData = (value: number): string => {
    return value < 1 ? `${(value * 1024).toFixed(0)} KB` : `${value.toFixed(1)} MB`;
};

export default function MikrotikDevicePreview() {
    // @ts-ignore
    const [darkMode, setDarkMode] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [device, setDevice] = useState<MikrotikDevice>(mockDevice);
    const [isRefreshing, setIsRefreshing] = useState(false);


    // Simulate refresh data
    const refreshData = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            // Simulate updating values
            const updatedDevice = {
                ...device,
                stats: {
                    ...device.stats,
                    cpuUsage: Math.floor(Math.random() * 60) + 10,
                    memoryUsage: Math.floor(Math.random() * 50) + 30,
                    connectedClients: Math.floor(Math.random() * 10) + 15,
                    bandwidth: {
                        download: parseFloat((Math.random() * 100 + 50).toFixed(1)),
                        upload: parseFloat((Math.random() * 20 + 10).toFixed(1))
                    }
                }
            };
            setDevice(updatedDevice);
            setIsRefreshing(false);
        }, 1000);
    };

    // Status indicator colors
    const getStatusColor = (status: string) => {
        switch (status) {
            case "online":
                return "bg-green-500";
            case "offline":
                return "bg-red-500";
            case "warning":
                return "bg-yellow-500";
            default:
                return "bg-gray-500";
        }
    };

    return (
        <div
            className={`min-h-screen mtk-view ${darkMode ? "dark bg-gray-900" : "bg-gray-50"} transition-colors duration-300`}>
            {/* Header */}
            <LayoutNavigator
            title={"Mikrotik Device Details"}
            description={""}
            >
                <button
                    onClick={refreshData}
                    className="flex items-center px-3 py-1 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-all"
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}/>
                    Refresh
                </button>
            </LayoutNavigator>

            {/* Main content */}
            <div className="container  mx-auto px-4 py-6">
                {/* Device header */}
                <div
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 transition-all duration-300 transform hover:shadow-lg">
                    <div className="flex flex-col md:flex-row justify-between">
                        <div className="flex items-start space-x-4">
                            <div
                                className="hidden md:flex items-center justify-center h-16 w-16 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                <Server className="h-10 w-10 text-blue-500 dark:text-blue-400"/>
                            </div>

                            <div>
                                <div className="flex items-center">
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{device.model}</h2>
                                    <div
                                        className={`ml-3 h-3 w-3 rounded-full ${getStatusColor(device.status)} animate-pulse`}></div>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400">ID: {device.id} •
                                    IP: {device.ipAddress}</p>
                                <div className="mt-2 flex items-center">
                  <span
                      className="text-sm px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium">
                    RouterOS v{device.firmwareVersion}
                  </span>
                                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    Last seen: {device.lastSeen}
                  </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 md:mt-0 flex flex-col items-end">
                            <div className="flex items-center space-x-2">
                                <span
                                    className="text-sm font-medium text-gray-600 dark:text-gray-300">Serial Number:</span>
                                <span className="text-sm text-gray-800 dark:text-white">{device.serialNumber}</span>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-3">
                                <div className="flex items-center space-x-2">
                                    <Cpu className="h-4 w-4 text-gray-500 dark:text-gray-400"/>
                                    <span
                                        className="text-sm text-gray-600 dark:text-gray-300">{device.stats.cpuUsage}%</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <HardDrive className="h-4 w-4 text-gray-500 dark:text-gray-400"/>
                                    <span
                                        className="text-sm text-gray-600 dark:text-gray-300">{device.stats.memoryUsage}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors duration-200 ${
                                activeTab === "overview"
                                    ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab("interfaces")}
                            className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors duration-200 ${
                                activeTab === "interfaces"
                                    ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                        >
                            Interfaces
                        </button>
                        <button
                            onClick={() => setActiveTab("clients")}
                            className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors duration-200 ${
                                activeTab === "clients"
                                    ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                        >
                            Clients
                        </button>
                        <button
                            onClick={() => setActiveTab("settings")}
                            className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors duration-200 ${
                                activeTab === "settings"
                                    ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                        >
                            Settings
                        </button>
                    </nav>
                </div>

                {/* Tab content */}
                <div className="transition-all duration-300">
                    {activeTab === "overview" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                            {/* CPU & Memory card */}
                            <div
                                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-all duration-300 hover:shadow-md">
                                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">System
                                    Resources</h3>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CPU Usage</span>
                                            <span
                                                className="text-sm font-medium text-gray-700 dark:text-gray-300">{device.stats.cpuUsage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all duration-500 ease-out"
                                                style={{width: `${device.stats.cpuUsage}%`}}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Memory Usage</span>
                                            <span
                                                className="text-sm font-medium text-gray-700 dark:text-gray-300">{device.stats.memoryUsage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-purple-500 dark:bg-purple-400 h-2 rounded-full transition-all duration-500 ease-out"
                                                style={{width: `${device.stats.memoryUsage}%`}}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <div className="mr-2 h-3 w-3 rounded-full bg-rose-500"></div>
                                                <span
                                                    className="text-sm font-medium text-gray-700 dark:text-gray-300">Temperature</span>
                                            </div>
                                            <span
                                                className="text-sm font-medium text-gray-700 dark:text-gray-300">{device.stats.temperature}°C</span>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <Clock className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400"/>
                                                <span
                                                    className="text-sm font-medium text-gray-700 dark:text-gray-300">Uptime</span>
                                            </div>
                                            <span
                                                className="text-sm font-medium text-gray-700 dark:text-gray-300">{device.stats.uptime}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bandwidth card */}
                            <div
                                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-all duration-300 hover:shadow-md">
                                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Bandwidth
                                    Usage</h3>

                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <div className="flex items-center">
                                                <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
                                                <span
                                                    className="text-sm font-medium text-gray-700 dark:text-gray-300">Download</span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {formatBandwidth(device.stats.bandwidth.download)}
                      </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                                                style={{width: `${(device.stats.bandwidth.download / 150) * 100}%`}}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <div className="flex items-center">
                                                <div className="mr-2 h-3 w-3 rounded-full bg-blue-500"></div>
                                                <span
                                                    className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload</span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {formatBandwidth(device.stats.bandwidth.upload)}
                      </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                                                style={{width: `${(device.stats.bandwidth.upload / 30) * 100}%`}}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center p-4 mt-4">
                                        <div className="text-center">
                                            <div
                                                className="text-3xl font-bold text-gray-800 dark:text-white flex items-center justify-center">
                                                <Users className="mr-2 h-5 w-5 text-indigo-500"/>
                                                {device.stats.connectedClients}
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Connected
                                                Clients</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick actions card */}
                            <div
                                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-all duration-300 hover:shadow-md">
                                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Quick
                                    Actions</h3>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                        <Wifi className="h-6 w-6 text-blue-500 mb-2"/>
                                        <span
                                            className="text-sm font-medium text-gray-700 dark:text-gray-300">Wireless</span>
                                    </button>

                                    <button
                                        className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                        <Shield className="h-6 w-6 text-green-500 mb-2"/>
                                        <span
                                            className="text-sm font-medium text-gray-700 dark:text-gray-300">Firewall</span>
                                    </button>

                                    <button
                                        className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                        <Activity className="h-6 w-6 text-purple-500 mb-2"/>
                                        <span
                                            className="text-sm font-medium text-gray-700 dark:text-gray-300">Monitoring</span>
                                    </button>

                                    <button
                                        className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                        <Settings className="h-6 w-6 text-gray-500 mb-2"/>
                                        <span
                                            className="text-sm font-medium text-gray-700 dark:text-gray-300">Configure</span>
                                    </button>

                                    <button
                                        className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors col-span-2">
                                        <Zap className="h-6 w-6 text-yellow-500 mb-2"/>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reboot Device</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "interfaces" && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow animate-fadeIn">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Network
                                    Interfaces</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Status and traffic information for all device interfaces
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Interface
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            RX Data
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            TX Data
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {device.interfaces.map((iface, _index) => (
                                        <tr key={iface.name}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div
                                                    className="text-sm font-medium text-gray-800 dark:text-white">{iface.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div
                                                    className="text-sm text-gray-600 dark:text-gray-300 capitalize">{iface.type}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              iface.status === "active"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}>
                            {iface.status}
                          </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div
                                                    className="text-sm text-gray-600 dark:text-gray-300">{formatData(iface.rxData)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div
                                                    className="text-sm text-gray-600 dark:text-gray-300">{formatData(iface.txData)}</div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === "clients" && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-fadeIn">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Connected Clients</h3>
                                <span
                                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold px-3 py-1 rounded-full">
                  {device.stats.connectedClients} Active
                </span>
                            </div>

                            <div className="text-center py-12">
                                <div
                                    className="inline-flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-700 rounded-full mb-4">
                                    <BarChart2 className="h-12 w-12 text-blue-500"/>
                                </div>
                                <h3 className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-2">Client list
                                    visualization</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                    This section would display connected client details with bandwidth usage and
                                    connection information.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === "settings" && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-fadeIn">
                            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-6">Device Settings</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Device Name
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400"
                                        defaultValue={device.model}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        IP Address
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400"
                                        defaultValue={device.ipAddress}
                                    />
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Update Channel
                                    </label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400">
                                        <option>Long-term</option>
                                        <option>Stable</option>
                                        <option>Testing</option>
                                        <option>Development</option>
                                    </select>
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <div
                                        className="flex items-center justify-between py-4 border-t border-gray-200 dark:border-gray-700">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-800 dark:text-white">Automatic
                                                Updates</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Enable automatic
                                                firmware updates</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked/>
                                            <div
                                                className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                        </label>
                                    </div>

                                    <div
                                        className="flex items-center justify-between py-4 border-t border-gray-200 dark:border-gray-700">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-800 dark:text-white">Remote
                                                Access</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Allow remote
                                                management access</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer"/>
                                            <div
                                                className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                        </label>
                                    </div>
                                </div>

                                <div className="col-span-1 md:col-span-2 mt-4">
                                    <button
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md transition-colors duration-200 shadow-sm">
                                        Save Changes
                                    </button>
                                    <button
                                        className="ml-4 px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition-colors duration-200 shadow-sm">
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}