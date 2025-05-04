import Layout from "./home-components/Layout.tsx";
import {useEffect, useState, useRef, useCallback} from "react";
import request from "../build/request.ts";
import Config from "../assets/config.ts";
import {Inbox, Plus, RotateCw, Wifi, WifiOff, Search, Edit, Eye, X, CheckCircle, AlertCircle} from "lucide-react";
import {useDialog} from "../ui/providers/DialogProvider.tsx";
import Signal from "../lib/Signal.ts";
import {useNavigate} from "react-router-dom";
import AddMikrotikModal from "../ui/providers/AddMikrotikModal.tsx";
import {motion, AnimatePresence} from "framer-motion";

export default function RoutersPage() {
    const dialog = useDialog();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [activeTab, setActiveTab] = useState("all");
    const [allCount, setAllCount] = useState(0);
    const [activeCount, setActiveCount] = useState(0);
    const [inActiveCount, setInactiveCount] = useState(0);
    const [searchText, setSearchText] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Enhanced pagination states
    const [page, setPage] = useState(1);
    const [, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [itemsPerPage,] = useState(9); // Default per page count matching backend
    const observerRef = useRef<IntersectionObserver>(null);
    const loaderRef = useRef(null);

    // Debounce search
    const [debouncedSearchText, setDebouncedSearchText] = useState("");
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            setDebouncedSearchText(searchText);
            // Reset pagination when search changes
            setPage(1);
        }, 500); // 500ms delay

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchText]);

    useEffect(() => {
        // Reset pagination when tab or search changes
        setItems([]);
        setPage(1);
        setHasMore(true);
        fetchItems(activeTab, 1, debouncedSearchText);

        const reloadHandler = () => {
            setItems([]);
            setPage(1);
            setHasMore(true);
            fetchItems(activeTab, 1, debouncedSearchText);
        };

        Signal.on("rts-page-reload", reloadHandler);

        return () => {
            Signal.off("rts-page-reload", reloadHandler);
            // Clean up observer
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [activeTab, debouncedSearchText]);

    // Setup intersection observer for infinite scrolling
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                const [entry] = entries;
                if (entry && entry.isIntersecting && hasMore && !loadingMore && !loading) {
                    loadMoreItems();
                }
            },
            {threshold: 0.5}
        );

        observerRef.current = observer;

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (observer && loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };
    }, [hasMore, loadingMore, loading, items]);

    const fetchItems = (tab: string, currentPage: number, searchQuery = "") => {
        if (currentPage === 1) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        const fd = new FormData();
        fd.append("load_type", tab);
        fd.append("page", currentPage.toString());
        fd.append("search", searchQuery);
        fd.append("per_page", itemsPerPage.toString());

        request
            .post(Config.baseURL + "/api/routers/", fd)
            .then((res) => {
                const data = res.data;

                if (currentPage === 1) {
                    setItems(data.routers);
                } else {
                    // @ts-ignore
                    setItems(prev => [...prev, ...data.routers]);
                }

                setAllCount(data.all_count);
                setActiveCount(data.active_count);
                setInactiveCount(data.inactive_count);
                setTotalPages(data.total_pages);

                // Check if we've loaded all items
                setHasMore(data.has_next);

                setLoading(false);
                setLoadingMore(false);
            })
            .catch((err) => {
                console.error("Error fetching routers:", err);
                setLoading(false);
                setLoadingMore(false);
            });
    };

    const loadMoreItems = useCallback(() => {
        if (!loadingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchItems(activeTab, nextPage, debouncedSearchText);
        }
    }, [loadingMore, hasMore, page, activeTab, debouncedSearchText]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    const handleRefresh = () => {
        setItems([]);
        setPage(1);
        setHasMore(true);
        fetchItems(activeTab, 1, debouncedSearchText);
    };

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
                <div
                    className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-amber-600 text-2xl font-semibold mb-0 dark:text-amber-500">Routers</h3>
                        <p className="text-gray-600 text-sm dark:text-gray-400">
                            Manage your network infrastructure
                        </p>
                    </div>
                    <div className="flex gap-2 mt-4 md:mt-0">
                        <motion.button
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            onClick={handleRefresh}
                            className="flex items-center cursor-pointer gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <RotateCw className="w-4 h-4"/>
                            Refresh
                        </motion.button>
                        <motion.button
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            onClick={() => {
                                const d = dialog.create({
                                    content: <AddMikrotikModal onClose={refresh => {
                                        d.dismiss();
                                        if (refresh)
                                            handleRefresh();
                                    }}/>,
                                    cancelable: false,
                                    size: "lg",
                                    design: ['xl-down', 'scrollable']
                                });
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                            data-bs-toggle="offcanvas"
                        >
                            <Plus className="text-lg"/>
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
                                <path
                                    d="M216,42H40A14,14,0,0,0,26,56V200a14,14,0,0,0,14,14H216a14,14,0,0,0,14-14V56A14,14,0,0,0,216,42Zm2,158a2,2,0,0,1-2,2H40a2,2,0,0,1-2-2V56a2,2,0,0,1,2-2H216a2,2,0,0,1,2,2ZM174,88a46,46,0,0,1-92,0,6,6,0,0,1,12,0,34,34,0,0,0,68,0,6,6,0,0,1,12,0Z"></path>
                            </svg>
                            All
                            <span
                                className="ml-2 h-6 w-6 flex justify-center items-center text-xs text-white rounded bg-amber-400 dark:bg-amber-500">
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
                            <Wifi size={16}/>
                            Online
                            <span
                                className="ml-2 h-6 w-6 flex justify-center items-center text-xs text-white rounded bg-green-400">
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
                            <WifiOff size={16}/>
                            Offline
                            <span
                                className="ml-2 h-6 w-6 flex justify-center items-center text-xs text-white rounded bg-gray-400">
                                {inActiveCount}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mt-6 relative">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="w-5 h-5 text-gray-400"/>
                        </div>
                        <input
                            ref={searchInputRef}
                            type="text"
                            id="table-search-mikrotiks"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="block w-full pl-10 pr-10 py-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Search by router name, IP address, or location..."
                        />
                        {searchText && (
                            <button
                                onClick={clearSearch}
                                className="absolute inset-y-0 right-0 flex items-center pr-3"
                            >
                                <X className="w-5 h-5 text-gray-400 hover:text-gray-600"/>
                            </button>
                        )}
                    </div>
                </div>

                {/* Router Cards */}
                <div className="mt-6">
                    {loading && page === 1 ? (
                        <div className="flex justify-center items-center py-20">
                            <div
                                className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
                        </div>
                    ) : (
                        <>
                            <RouterGrid
                                items={items}
                                dialog={dialog}
                                navigate={navigate}
                                onRefresh={handleRefresh}
                            />

                            {/* Loader element that triggers more content loading */}
                            {hasMore && !loading && (
                                <div
                                    ref={loaderRef}
                                    className="flex justify-center items-center py-8"
                                >
                                    {loadingMore && (
                                        <div
                                            className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
                                    )}
                                </div>
                            )}

                            {/* End of results message */}
                            {!hasMore && items.length > 0 && (
                                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                    <p>All routers loaded</p>
                                </div>
                            )}

                            {/* No results message when search is active but no items found */}
                            {!loading && items.length === 0 && debouncedSearchText && (
                                <div
                                    className="min-h-[15rem] py-10 justify-center gap-3 flex-col items-center w-full flex">
                                    <Search size={64} className="text-gray-400"/>
                                    <strong className="text-lg text-gray-700 dark:text-gray-300">No Search
                                        Results</strong>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        No routers found matching "{debouncedSearchText}"
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}

// @ts-ignore
const RouterGrid = ({items, dialog, navigate, onRefresh}) => {
    if (items.length === 0) {
        return (
            <div className="min-h-[15rem] py-10 justify-center gap-3 flex-col items-center w-full flex">
                <Inbox size={64} className="text-gray-400"/>
                <strong className="text-lg text-gray-700 dark:text-gray-300">No Devices Connected</strong>
                <p className="text-gray-500 dark:text-gray-400">
                    Add a router by clicking the "Link Router" button above
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
                {items.map((router: any, index: number) => (
                    <RouterCard
                        key={router.id}
                        router={router}
                        index={index}
                        dialog={dialog}
                        navigate={navigate}
                        onRefresh={onRefresh}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

// @ts-ignore
const RouterCard = ({router, index, dialog, navigate, onRefresh}) => {
    // Determine if router is online based on the actual active property
    const isOnline = router.active;

    const lastSeenText = () => {
        if (!router.last_seen) return "Never";

        try {
            const lastSeen = new Date(router.last_seen);
            const now = new Date();
            // @ts-ignore
            const diffMs = now - lastSeen;
            const diffMins = Math.floor(diffMs / 60000);

            if (diffMins < 60) {
                return diffMins === 0 ? "Just now" : `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
            } else if (diffMins < 1440) { // less than a day
                const hours = Math.floor(diffMins / 60);
                return `${hours} hour${hours === 1 ? '' : 's'} ago`;
            } else {
                const days = Math.floor(diffMins / 1440);
                return `${days} day${days === 1 ? '' : 's'} ago`;
            }
        } catch {
            return router.last_seen;
        }
    };

    return (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, scale: 0.95}}
            transition={{duration: 0.3, delay: index * 0.05}}
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
                                <CheckCircle size={12}/>
                                <span>Online</span>
                            </>
                        ) : (
                            <>
                                <AlertCircle size={12}/>
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
                        <div className="w-24 flex-shrink-0 font-medium">Last Seen:</div>
                        <div className="text-gray-500 dark:text-gray-400">{lastSeenText()}</div>
                    </div>
                </div>

                <div className="mt-5 flex space-x-2">
                    <button
                        onClick={() => {
                            const d = dialog.create({
                                content: <RouterEdit router={router} dismiss={() => {
                                    d.dismiss();
                                    onRefresh(); // Refresh after editing
                                }}/>,
                                cancelable: false,
                            });
                        }}
                        className="flex-1 flex justify-center items-center gap-1 py-2 px-3 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-md transition-colors dark:bg-amber-900 dark:hover:bg-amber-800 dark:text-amber-100"
                    >
                        <Edit size={16}/>
                        <span>Edit</span>
                    </button>
                    <button
                        onClick={() => navigate(`/mikrotiks/${router.id}/`)}
                        className="flex-1 flex justify-center items-center gap-1 py-2 px-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-100"
                    >
                        <Eye size={16}/>
                        <span>Details</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// @ts-ignore
const RouterEdit = ({router, dismiss}) => {
    const [loading, setLoading] = useState(false);
    const [data, setDashData] = useState(router);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        // if (!data.name || data.name.trim() === "") {
        //     newErrors.name = "Router name is required";
        // }
        //
        // if (!data.ip_address || data.ip_address.trim() === "") {
        //     newErrors.ip_address = "IP address is required";
        // } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(data.ip_address)) {
        //     newErrors.ip_address = "Please enter a valid IP address";
        // }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const editRouter = (eventTarget: EventTarget | undefined) => {
        if (!validateForm()) return;

        setLoading(true);
        const fd = new FormData(eventTarget as HTMLFormElement);
        request
            .post(Config.baseURL + "/api/routers/" + router.id + "/update/", fd)
            .then((res) => {
                setLoading(false);
                if (res.status === 200) {
                    // Use a toast notification instead of alert
                    // Create a custom toast component or use a library
                    dismiss();
                    Signal.trigger("rts-page-reload");
                }
            })
            .catch((err) => {
                console.error("Error updating router:", err);
                const responseErrors = err?.response?.data?.errors || {};
                setErrors(prev => ({...prev, ...responseErrors}));
                setLoading(false);
            });
    };

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        const {name, value} = e.target;
        setDashData((prev: any) => ({...prev, [name]: value}));

        // Clear error for this field when user starts typing
        // @ts-ignore
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: null}));
        }
    };

    return (
        <div className="p-4 sm:p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200">Edit Router</h2>
                <button
                    onClick={dismiss}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500"/>
                </button>
            </div>

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    editRouter(event.target);
                }}
                className="space-y-6"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block font-medium text-sm text-gray-700 dark:text-gray-300 mb-1"
                               htmlFor="name">
                            Router name
                        </label>
                        {/*<input*/}
                        {/*    className={`border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-800 dark:text-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-md shadow-sm w-full transition-colors`}*/}
                        {/*    id="name"*/}
                        {/*    name="name"*/}
                        {/*    type="text"*/}
                        {/*    value={data.name}*/}
                        {/*    onChange={handleChange}*/}
                        {/*    required*/}
                        {/*/>*/}
                        {/*{errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}*/}
                    </div>

                    <div>
                        <label className="block font-medium text-sm text-gray-700 dark:text-gray-300 mb-1"
                               htmlFor="location">
                            Location
                        </label>
                        <input
                            className="border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-md shadow-sm w-full transition-colors"
                            id="location"
                            name="location"
                            type="text"
                            value={data.location || ""}
                            onChange={handleChange}
                        />
                    </div>


                </div>

                <div className="flex items-center gap-3 pt-2">
                    <motion.button
                        whileHover={{scale: 1.02}}
                        whileTap={{scale: 0.98}}
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 border border-transparent rounded-md font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex-1"
                    >
                        {loading ? (
                            <>
                                <span
                                    className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                                <span>Updating...</span>
                            </>
                        ) : (
                            <span>Update Router</span>
                        )}
                    </motion.button>

                    <motion.button
                        whileHover={{scale: 1.02}}
                        whileTap={{scale: 0.98}}
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