import {useState, useEffect, useRef} from "react";
import Layout from "./home-components/Layout.tsx";
import {request} from "../build/request.ts";
import {useDialog} from "../ui/providers/DialogProvider.tsx";
import Create from "./packages_components/Create.tsx";
import {Package, Router} from "./packages_components/types.pkg.ts";




export default function PackagesPage() {
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [_totalCount, setTotalCount] = useState({
        all: 0,
        pppoe: 0,
        hotspot: 0
    });


    const [packages, setPackages] = useState<Package[]>([]);
    const [routers, setRouters] = useState<Router[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);


    // Mock data - replace with actual API call
    useEffect(() => {
        // Simulate API fetch


    }, []);

    // Fetch routers
    useEffect(() => {
        // (async() => {
        //     try {
        //         const res = await request.post('/api/pkgs/')
        //         console.log(res.data)
        //         setPackages(res.data.pkgs);


        //     } catch(error) {
        //         console.log(error)
        //     }
        // })();
        (async () => {
            try {
                const res = await request.post('/api/routers/')
                console.log(res.data)
                if (res.data && res.data.routers) {
                    setRouters(res.data.routers);
                }
            } catch (error) {
                console.log(error)
            }
        })()
        setIsLoading(false);
    }, [])

    // Add this function to handle scroll events
    const handleScroll = () => {
        const scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
        const scrollHeight = (document.documentElement && document.documentElement.scrollHeight) || document.body.scrollHeight;
        const clientHeight = document.documentElement.clientHeight || window.innerHeight;

        // If we're near the bottom (within 200px) and not already loading
        if (scrollHeight - scrollTop - clientHeight < 200 && !isLoading && !isLoadingMore && hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    };


    // Add this effect to handle the scroll event
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isLoading, isLoadingMore, hasMore]);

    // Add this effect to load more when page changes
    useEffect(() => {
        if (page > 1) {
            fetchPackages(page, searchTerm, activeFilter);
        }
    }, [page]);
    const handleSearch = (value: string) => {
        setSearchTerm(value);
        // Reset pagination when searching
        setPage(1);

        // Debounce search to avoid too many requests
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            fetchPackages(1, value, activeFilter, true);
        }, 500); // Wait 500ms after typing stops
    };

    const filteredPackages = packages.filter((pkg: Package) => {
        const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === "all" || pkg.type === activeFilter;
        return matchesSearch && matchesFilter;
    });
    // Update your filter change handler
    const handleFilterChange = (filter: string) => {
        setActiveFilter(filter);
        setPage(1); // Reset pagination when changing filters
        // fetchPackages will be called via the useEffect that watches activeFilter
    };
    // Replace your existing useEffect for fetching packages
    useEffect(() => {
        fetchPackages(1, searchTerm, activeFilter, true);
    }, [activeFilter]); // Only re-run when filter changes

    // Create this function to handle fetching packages with pagination and search
    const fetchPackages = async (
        pageNum: number = 1,
        search: string = "",
        filter: string = "all",
        isInitial: boolean = false
    ) => {
        try {
            setIsLoading(isInitial);
            setIsLoadingMore(!isInitial);

            // Updated request.post with proper typing
            const res = await request.post<{
                pkgs: Package[];
                all_count: number;
                pppoe_count: number;
                hotspot_count: number
            }>('/api/pkgs/', {
                page: pageNum,
                search: search,
                load_type: filter,
            });
            console.log(res.data)

            if (res.data) {
                if (isInitial || pageNum === 1) {
                    setPackages(res.data.pkgs);
                } else {
                    setPackages((prevPackages) => [...prevPackages, ...res.data.pkgs]);
                }

                setTotalCount({
                    all: res.data.all_count,
                    pppoe: res.data.pppoe_count,
                    hotspot: res.data.hotspot_count,
                });

                setHasMore(res.data.pkgs.length > 0);
            }
        } catch (error) {
            console.error("Failed to fetch packages:", error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    const dialog = useDialog();
    const UiCreate = () => {
        const dl = dialog.create({
            content: <Create handler={{
                onDismiss: () => {
                    dl.dismiss()
                },
                routers,
            }}/>,
            design: ["sm-down"],
            size: "lg"
        })
    }

     const [isSubmitting, setIsSubmitting] = useState(false);
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
                                onClick={() => UiCreate()}
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
                                onClick={() => handleFilterChange("ppoe")}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                                    activeFilter === "ppoe"
                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                }`}
                            >
                                PPPoE
                            </button>
                            <button
                                onClick={() => handleFilterChange("hotspot")}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                                    activeFilter === "hotspot"
                                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                }`}
                            >
                                Hotspot
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
                                onChange={(e) => handleSearch(e.target.value)}
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
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-t-4 border-amber-500 hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{pkg.name}</h3>
                                    <span
                                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                                            pkg.type === "ppoe"
                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                        }`}
                                    >
                                        {pkg.type === "ppoe" ? "PPPoE" : "Hotspot"}
                                    </span>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                                        <i className="bi bi-cash-coin mr-2"></i>
                                        <span className="text-md font-semibold">Ksh {pkg.price}</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">/ month</span>
                                    </div>
                                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                                        <i className="bi bi-speedometer2 mr-2"></i>
                                        <span>{pkg.speed}</span>
                                    </div>
                                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                                        <i className="bi bi-calendar-event mr-2"></i>
                                        <span>{pkg.duration}</span>
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
                                        onClick={() => setPackageToDelete(pkg)}
                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                                        <i className="bi bi-trash mr-1"></i> Delete
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

                {isLoadingMore && (
                    <div className="col-span-full my-6 flex justify-center">
                        <div
                            className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm rounded-md text-blue-500 bg-white dark:bg-gray-800 transition ease-in-out duration-150">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading more...
                        </div>
                    </div>
                )}

                {!isLoading && !isLoadingMore && !hasMore && packages.length > 0 && (
                    <div className="col-span-full text-center py-4 text-gray-500 dark:text-gray-400">
                        You've reached the end of the list
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {packageToDelete && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
                        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] bg-opacity-75 transition-opacity"
                             onClick={() => !isSubmitting && setPackageToDelete(null)}></div>
                        <div
                            className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-md">
                            <div className="bg-white dark:bg-gray-800 px-6 py-4">
                                <div className="sm:flex sm:items-start">
                                    <div
                                        className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <i className={`bi ${isSubmitting ? 'bi-hourglass-split' : 'bi-exclamation-triangle'} text-red-600`}></i>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                            {isSubmitting ? "Deleting Package..." : "Delete Package"}
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {isSubmitting ?
                                                    `Deleting package "${packageToDelete.name}". Please wait...` :
                                                    `Are you sure you want to delete the package "${packageToDelete.name}"? This action cannot be undone.`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                    {isSubmitting ? (
                                        <div className="w-full flex justify-center items-center py-3">
                                            <svg className="animate-spin h-6 w-6 text-blue-500"
                                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10"
                                                        stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor"
                                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                                onClick={async () => {
                                                    setIsSubmitting(true);
                                                    try {
                                                        const response = await request.post('/api/pkgs/delete/', {
                                                            id: packageToDelete.id
                                                        });

                                                        if (response.data.success) {
                                                            setPackages(prevPackages => prevPackages.filter(p => p.id !== packageToDelete.id));
                                                            setPackageToDelete(null);
                                                            setIsSubmitting(false);
                                                            // Use a more elegant notification instead of alert
                                                            alert(response.data.message || "Package deleted successfully");
                                                        } else {
                                                            throw new Error(response.data.message || "Failed to delete package");
                                                        }
                                                    } catch (error) {
                                                        console.error("Failed to delete package:", error);
                                                        setIsSubmitting(false);
                                                        alert(error instanceof Error ? error.message : "Failed to delete the package. Please try again.");
                                                    }
                                                }}
                                            >
                                                Delete
                                            </button>
                                            <button
                                                type="button"
                                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                                                onClick={() => setPackageToDelete(null)}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}