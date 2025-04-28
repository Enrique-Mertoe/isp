import Layout from "./home-components/Layout.tsx";
import React, { useEffect, useState, useRef } from "react";
import request from "../build/request.ts";
import Config from "../assets/config.ts";
import { Inbox, Plus, RotateCw, Wifi, WifiOff, Search, Edit, Eye, X, CheckCircle, AlertCircle } from "lucide-react";
import { useDialog } from "../ui/providers/DialogProvider.tsx";
import Signal from "../lib/Signal.ts";
import { useNavigate } from "react-router-dom";
import AddMikrotikModal from "../ui/providers/AddMikrotikModal.tsx";
import { motion, AnimatePresence } from "framer-motion";

export default function RoutersPage() {
    const dialog = useDialog();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<Mikrotik[]>([]);
    const [activeTab, setActiveTab] = useState<string>("all");
    const [allCount, setAllCount] = useState(0);
    const [activeCount, setActiveCount] = useState(0);
    const [inActiveCount, setInactiveCount] = useState(0);
    const [searchText, setSearchText] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchItems(activeTab);
        Signal.on("rts-page-reload", () => fetchItems(activeTab));
        return () => {
            Signal.off("rts-page-reload");
        };
    }, [activeTab]);

    const fetchItems = (tab: string) => {
        setLoading(true);
        const fd = new FormData();
        fd.append("load_type", tab);
        request
            .post(Config.baseURL + "/api/routers/", fd)
            .then((res) => {
                const data = res.data as RoutersResponse;
                setLoading(false);
                setItems(data.routers);
                setAllCount(data.all_count);
                setActiveCount(data.active_count);
                setInactiveCount(data.inactive_count);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    const filteredItems = items.filter(
        (router) =>
            router.name.toLowerCase().includes(searchText.toLowerCase()) ||
            router.ip_address.toLowerCase().includes(searchText.toLowerCase()) ||
            router.location.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleSearchFocus = () => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    const clearSearch = () => {
        setSearchText("");
        handleSearchFocus();
    };

    return (
        <Layout>
            <div className="bg-white rounded-lg shadow-md p-6 mx-1 dark:bg-slate-800">
                {/* Card Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-amber-600 text-2xl font-semibold mb-0 dark:text-amber-500">Routers</h3>
                        <p className="text-gray-600 text-sm dark:text-gray-400">
                            Manage your network infrastructure
                        </p>
                    </div>
                    <div className="flex gap-2 mt-4 md:mt-0">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => fetchItems(activeTab)}
                            className="flex items-center cursor-pointer gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <RotateCw className="w-4 h-4" />
                            Refresh
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                dialog.create({
                                    content: <AddMikrotikModal />,
                                    cancelable: false,
                                    size: "lg",
                                    design: ["xl-down", "scrollable"],
                                });
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Link Router
                        </motion.button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-6">
                    <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => handleTabChange("all")}
                            className={`inline-flex cursor-pointer gap-2 items-center justify-center p-4 border-b-2 whitespace-nowrap ${
                                activeTab === "all"
                                    ? "text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                                    : "border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            } transition-colors`}
                        >
                            <svg
                                width="16"
                                height="16"
                                className="stroke-1 h-5 w-5 shrink-0"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 256 256"
                                fill="currentColor"
                            >
                                <path d="M216,42H40A14,14,0,0,0,26,56V200a14,14,0,0,0,14,14H216a14,14,0,0,0,14-14V56A14,14,0,0,0,216,42Zm2,158a2,2,0,0,1-2,2H40a2,2,0,0,1-2-2V56a2,2,0,0,1,2-2H216a2,2,0,0,1,2,2ZM174,88a46,46,0,0,1-92,0,6,6,0,0,1,12,0,34,34,0,0,0,68,0,6,6,0,0,1,12,0Z"></path>
                            </svg>
                            All
                            <span className="ml-2 h-6 w-6 flex justify-center items-center text-xs text-white rounded bg-amber-400 dark:bg-amber-500">
                                {allCount}
                            </span>
                        </button>
                        <button
                            onClick={() => handleTabChange("active")}
                            className={`inline-flex cursor-pointer gap-2 items-center justify-center p-4 border-b-2 whitespace-nowrap ${
                                activeTab === "active"
                                    ? "text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                                    : "border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            } transition-colors`}
                        >
                            <Wifi size={16} />
                            Online
                            <span className="ml-2 h-6 w-6 flex justify-center items-center text-xs text-white rounded bg-green-400">
                                {activeCount}
                            </span>
                        </button>
                        <button
                            onClick={() => handleTabChange("inactive")}
                            className={`inline-flex cursor-pointer gap-2 items-center justify-center p-4 border-b-2 whitespace-nowrap ${
                                activeTab === "inactive"
                                    ? "text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                                    : "border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            } transition-colors`}
                        >
                            <WifiOff size={16} />
                            Offline
                            <span className="ml-2 h-6 w-6 flex justify-center items-center text-xs text-white rounded bg-gray-400">
                                {inActiveCount}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mt-6 relative">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            ref={searchInputRef}
                            type="text"
                            id="table-search-mikrotiks"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="block w-full pl-10 pr-10 py-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Search by router name or IP address..."
                        />
                        {searchText && (
                            <button
                                onClick={clearSearch}
                                className="absolute inset-y-0 right-0 flex items-center pr-3"
                            >
                                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Router Cards */}
                <div className="mt-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
                        </div>
                    ) : (
                        <RouterGrid items={filteredItems} />
                    )}
                </div>
            </div>
        </Layout>
    );
}

const RouterGrid: React.FC<{ items: Mikrotik[] }> = ({ items }) => {
    if (items.length === 0) {
        return (
            <div className="min-h-[15rem] py-10 justify-center gap-3 flex-col items-center w-full flex">
                <Inbox size={64} className="text-gray-400" />
                <strong className="text-lg text-gray-700 dark:text-gray-300">No Devices Connected</strong>
                <p className="text-gray-500 dark:text-gray-400">
                    Add a router by clicking the "Link Router" button above
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
                {items.map((router, index) => (
                    <RouterCard key={router.id} router={router} index={index} />
                ))}
            </AnimatePresence>
        </div>
    );
};

const RouterCard: React.FC<{ router: Mikrotik; index: number }> = ({ router, index }) => {
    const dialog = useDialog();
    const navigate = useNavigate();

    // Determine if router is online based on the available data
    // In a real app, this would be determined by actual status data
    const isOnline = Math.random() > 0.3; // For demonstration purposes

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-white dark:bg-slate-700 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-600 hover:shadow-lg transition-shadow"
        >
            <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{router.name}</h3>
                    <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            isOnline
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
                        }`}
                    >
                        {isOnline ? (
                            <>
                                <CheckCircle size={12} />
                                <span>Online</span>
                            </>
                        ) : (
                            <>
                                <AlertCircle size={12} />
                                <span>Offline</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                        <div className="w-24 flex-shrink-0 font-medium">Location:</div>
                        <div className="truncate">{router.location || "Not specified"}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-24 flex-shrink-0 font-medium">IP Address:</div>
                        <div className="font-mono">{router.ip_address}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-24 flex-shrink-0 font-medium">Username:</div>
                        <div>{router.username}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-24 flex-shrink-0 font-medium">Password:</div>
                        <div className="font-mono">••••••••</div>
                    </div>
                </div>

                <div className="mt-5 flex space-x-2">
                    <button
                        onClick={() => {
                            const d = dialog.create({
                                content: <RouterEdit router={router} dismiss={() => d.dismiss()} />,
                                cancelable: false,
                            });
                        }}
                        className="flex-1 flex justify-center items-center gap-1 py-2 px-3 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-md transition-colors dark:bg-amber-900 dark:hover:bg-amber-800 dark:text-amber-100"
                    >
                        <Edit size={16} />
                        <span>Edit</span>
                    </button>
                    <button
                        onClick={() => navigate(`/mikrotiks/${router.id}/`)}
                        className="flex-1 flex justify-center items-center gap-1 py-2 px-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-100"
                    >
                        <Eye size={16} />
                        <span>Details</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const RouterEdit = ({ router, dismiss }: { router: Mikrotik; dismiss: Closure }) => {
    const [loading, setLoading] = useState(false);
    const [data, setDashData] = useState<Mikrotik>(router);

    const editRouter = (eventTarget: HTMLFormElement) => {
        setLoading(true);
        const fd = new FormData(eventTarget);
        request
            .post(Config.baseURL + "/api/routers/" + router.id + "/update/", fd)
            .then((res) => {
                setLoading(false);
                if (res.status == 200) {
                    alert("Edited successfully");
                    dismiss();
                    Signal.trigger("rts-page-reload");
                }
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDashData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="p-4 sm:p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200">Edit Router</h2>
                <button
                    onClick={dismiss}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            <form
                method="put"
                onSubmit={(event) => {
                    event.preventDefault();
                    editRouter(event.target as HTMLFormElement);
                }}
                className="space-y-6"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block font-medium text-sm text-gray-700 dark:text-gray-300 mb-1" htmlFor="name">
                            Router name
                        </label>
                        <input
                            className="border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-md shadow-sm w-full transition-colors"
                            id="name"
                            name="name"
                            type="text"
                            value={data.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-medium text-sm text-gray-700 dark:text-gray-300 mb-1" htmlFor="location">
                            Location
                        </label>
                        <input
                            className="border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-md shadow-sm w-full transition-colors"
                            id="location"
                            name="location"
                            type="text"
                            value={data.location}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block font-medium text-sm text-gray-700 dark:text-gray-300 mb-1" htmlFor="ip">
                            Router IP
                        </label>
                        <input
                            className="border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-md shadow-sm w-full transition-colors"
                            id="ip"
                            name="ip_address"
                            type="text"
                            value={data.ip_address}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-medium text-sm text-gray-700 dark:text-gray-300 mb-1" htmlFor="username">
                            Router username
                        </label>
                        <input
                            className="border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-md shadow-sm w-full transition-colors"
                            id="username"
                            name="username"
                            type="text"
                            value={data.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-medium text-sm text-gray-700 dark:text-gray-300 mb-1" htmlFor="password">
                            Router password
                        </label>
                        <input
                            className="border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-md shadow-sm w-full transition-colors"
                            id="password"
                            name="password"
                            type="text"
                            value={data.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 border border-transparent rounded-md font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex-1"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                                <span>Updating...</span>
                            </>
                        ) : (
                            <span>Update Router</span>
                        )}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => dismiss()}
                        className="flex items-center justify-center px-4 py-2 bg-gray-500 border border-transparent rounded-md font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex-1"
                    >
                        Cancel
                    </motion.button>
                </div>
            </form>
        </div>
    );
};