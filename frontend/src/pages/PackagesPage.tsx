import {useState, useEffect} from "react";
import Layout from "./home-components/Layout.tsx";
import { $, request } from "../build/request.ts";

interface Package {
    id: number;
    name: string;
    price: number;
    speed: string;
    duration: number; 
    subscribers: number;
    isPopular: boolean;
    status: "active" | "inactive";
    created: string;
    router_id?: number;
    router_identity?: string;
}

interface Router {
    id: number;
    name: string;
    ip_address: string;
    location: string;
    username: string;
    password: string;
    identity:string
}

interface NewPackage {
    name: string;
    price: string;
    speed: string;
    duration: string;
    isPopular: boolean;
    status: "active" | "inactive";
    router_id: number | null;
    router_identity?: string;
}

export default function PackagesPage() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [routers, setRouters] = useState<Router[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeFilter, setActiveFilter] = useState("all");
    const [newPackage, setNewPackage] = useState<NewPackage>({
        name: "",
        price: "",
        speed: "",
        duration: "30",
        isPopular: false,
        status: "active",
        router_id: null,
        router_identity:""
    });

    // Mock data - replace with actual API call
    useEffect(() => {
        // Simulate API fetch
        setTimeout(() => {
            setPackages([
                {
                    id: 1,
                    name: "Basic Internet",
                    price: 29.99,
                    speed: "25 Mbps",
                    duration: 30,
                    subscribers: 124,
                    isPopular: false,
                    status: "active",
                    created: "2024-12-10"
                },
                {
                    id: 2,
                    name: "Premium Internet",
                    price: 59.99,
                    speed: "100 Mbps",
                    duration: 30,
                    subscribers: 312,
                    isPopular: true,
                    status: "active",
                    created: "2024-11-05"
                },
                {
                    id: 3,
                    name: "Business Internet",
                    price: 99.99,
                    speed: "500 Mbps",
                    duration: 30,
                    subscribers: 87,
                    isPopular: false,
                    status: "active",
                    created: "2024-10-20"
                },
                {
                    id: 4,
                    name: "Summer Special",
                    price: 39.99,
                    speed: "50 Mbps",
                    duration: 90,
                    subscribers: 45,
                    isPopular: false,
                    status: "inactive",
                    created: "2024-09-15"
                },
                {
                    id: 5,
                    name: "Fiber Optic Ultra",
                    price: 129.99,
                    speed: "1 Gbps",
                    duration: 30,
                    subscribers: 76,
                    isPopular: false,
                    status: "active",
                    created: "2024-10-01"
                }
            ]);
            setIsLoading(false);
        }, 800);
    }, []);

    // Fetch routers
    useEffect(() => {
        (async() => {
            try {
                const res = await request.post('/api/routers/')
                console.log(res.data)
                if (res.data && res.data.routers) {
                    setRouters(res.data.routers);
                }
            } catch(error) {
                console.log(error)
            }
        })()
    }, [])

    const handleRouterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const routerId = parseInt(e.target.value);
        if (routerId) {
            const selectedRouter = routers.find(router => router.id === routerId);
            console.log(selectedRouter)
            if (selectedRouter) {
                setNewPackage({
                    ...newPackage,
                    router_id: routerId,
                    router_identity: selectedRouter.identity,
                });
            }
        } else {
            setNewPackage({
                ...newPackage,
                router_id: null,
                router_identity:''
            });
        }
    };

    const handleAddPackage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Cast newPackage to Record<string, unknown> to satisfy the type requirement
        const packageData: Record<string, unknown> = {
            ...newPackage
        };
        
        try {
            const response = await fetch('http://localhost:8000/api/pkgs/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(packageData),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data: Package = await response.json();
            console.log(data);
            
            // Add the new package to the existing packages list
            // setPackages(prevPackages => [...prevPackages, data]);
            
            // Close the modal
            setShowAddModal(false);
            
            // Reset the form data
            setNewPackage({
                name: "",
                price: "",
                speed: "",
                duration: "30",
                isPopular: false,
                status: "active",
                router_id: null,
                router_identity:""
            });
        } catch (error) {
            console.error("Failed to add package:", error instanceof Error ? error.message : String(error));
            // You could add error state handling here
        }
    };

    const filteredPackages = packages.filter((pkg: Package) => {
        const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === "all" || pkg.status === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const handleFilterChange = (filter: string) => {
        setActiveFilter(filter);
    };

    return (
        <Layout>
            <div className="p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
                {/* Page Header */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Packages</h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Manage your internet service packages and pricing
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                            >
                                <i className="bi bi-plus-circle mr-2"></i>
                                Add Package
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleFilterChange("all")}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                                    activeFilter === "all"
                                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => handleFilterChange("active")}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                                    activeFilter === "active"
                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                }`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => handleFilterChange("inactive")}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                                    activeFilter === "inactive"
                                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                }`}
                            >
                                Inactive
                            </button>
                        </div>
                        <div className="relative w-full md:w-64">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <i className="bi bi-search text-gray-400"></i>
                            </div>
                            <input
                                type="text"
                                className="w-full p-2 pl-10 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                placeholder="Search packages..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Package Cards */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                                <div className="flex justify-between items-center mt-6">
                                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredPackages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPackages.map((pkg: Package) => (
                            <div
                                key={pkg.id}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-t-4 border-blue-500 hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{pkg.name}</h3>
                                    <span
                                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                                            pkg.status === "active"
                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                        }`}
                                    >
                                        {pkg.status === "active" ? "Active" : "Inactive"}
                                    </span>
                                </div>

                                {pkg.isPopular && (
                                    <span
                                        className="inline-block mt-2 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full dark:bg-amber-900 dark:text-amber-200">
                                        <i className="bi bi-star-fill mr-1"></i> Popular
                                    </span>
                                )}

                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                                        <i className="bi bi-cash-coin mr-2"></i>
                                        <span className="text-lg font-semibold">${pkg.price}</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">/ month</span>
                                    </div>
                                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                                        <i className="bi bi-speedometer2 mr-2"></i>
                                        <span>{pkg.speed}</span>
                                    </div>
                                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                                        <i className="bi bi-calendar-event mr-2"></i>
                                        <span>{pkg.duration} days</span>
                                    </div>
                                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                                        <i className="bi bi-people mr-2"></i>
                                        <span>{pkg.subscribers} subscribers</span>
                                    </div>
                                    {pkg.router_identity && (
                                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                                            <i className="bi bi-router mr-2"></i>
                                            <span>{pkg.router_identity}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex justify-between items-center">
                                    <button
                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                                        <i className="bi bi-pencil-square mr-1"></i> Edit
                                    </button>
                                    <button
                                        className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300">
                                        <i className="bi bi-three-dots-vertical"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                        <div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                            <i className="bi bi-search text-gray-500 dark:text-gray-400 text-2xl"></i>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No packages found</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {searchTerm
                                ? `No packages matching "${searchTerm}"`
                                : "No packages match the selected filters"}
                        </p>
                    </div>
                )}

                {/* Add Package Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                                 onClick={() => setShowAddModal(false)}></div>
                            <div
                                className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-lg">
                                <div className="bg-white dark:bg-gray-800 px-6 py-4">
                                    <div className="flex justify-between items-center border-b pb-3">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Package</h3>
                                        <button
                                            onClick={() => setShowAddModal(false)}
                                            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                                        >
                                            <i className="bi bi-x-lg"></i>
                                        </button>
                                    </div>

                                    <form onSubmit={handleAddPackage} className="mt-4">
                                        <div className="mb-4">
                                            <label
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Package Name
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                value={newPackage.name}
                                                onChange={(e) => setNewPackage({...newPackage, name: e.target.value})}
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Price ($/month)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    value={newPackage.price}
                                                    onChange={(e) => setNewPackage({
                                                        ...newPackage,
                                                        price: e.target.value
                                                    })}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Speed
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., 100 Mbps"
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    value={newPackage.speed}
                                                    onChange={(e) => setNewPackage({
                                                        ...newPackage,
                                                        speed: e.target.value
                                                    })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Duration (days)
                                                </label>
                                                <select
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    value={newPackage.duration}
                                                    onChange={(e) => setNewPackage({
                                                        ...newPackage,
                                                        duration: e.target.value
                                                    })}
                                                >
                                                    <option value="30">30 days</option>
                                                    <option value="90">90 days</option>
                                                    <option value="180">180 days</option>
                                                    <option value="365">365 days</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Router
                                                </label>
                                                <select
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    value={newPackage.router_id || ""}
                                                    onChange={handleRouterChange}
                                                    required
                                                >
                                                    <option value="">Select a router</option>
                                                    {routers.map(router => (
                                                        <option key={router.id} value={router.id}>
                                                            {router.name} ({router.ip_address})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex items-center mb-4">
                                            <input
                                                type="checkbox"
                                                id="isPopular"
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                                checked={newPackage.isPopular}
                                                onChange={(e) => setNewPackage({
                                                    ...newPackage,
                                                    isPopular: e.target.checked
                                                })}
                                            />
                                            <label htmlFor="isPopular"
                                                   className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Mark as popular
                                            </label>
                                        </div>

                                        <div className="mt-6 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => setShowAddModal(false)}
                                                className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                Add Package
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}