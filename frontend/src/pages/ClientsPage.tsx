import  {useState, useEffect} from "react";
// import {useNavigate} from "react-router-dom";
// import {useApp} from "../ui/AppContext.tsx";
import Layout from "./home-components/Layout.tsx";
import {  request } from "../build/request.ts";

// interface Client {
//     id: number;
//     fullName: string;
//     email: string;
//     phone: string;
//     address: string;
//     package: string;
//     status: string;
//     dateJoined: string;
//     lastPayment: string;
//     avatar: string;
//     dueAmount: number;
// }

type SortType = "newest" | "oldest" | "name";

function compareClients(sortType: SortType, first: any, second: any): number {
    if (sortType === "newest") {
        return new Date(second.dateJoined).getTime() - new Date(first.dateJoined).getTime();
    } else if (sortType === "oldest") {
        return new Date(first.dateJoined).getTime() - new Date(second.dateJoined).getTime();
    } else if (sortType === "name") {
        return first.fullName.localeCompare(second.fullName);
    }
    return 0;
}
interface Package {
    id: number;
    name: string;
    speed: string;
    duration: string;
    
}

interface NewClient {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    package: string;
    packageId: number | null;
    status: string;
}
interface Client {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    package: {
        id: number;
        name: string;
        speed: string;
        duration: string;
        type: string;
        price: string;
    };
    status: string;
    dateJoined: string;
    lastPayment: string;
    avatar: string;
    dueAmount: number;
    router_username: string;
    router_password: string;
    created_at: string;
    due: string;
    package_start: string;
}


export default function ClientsPage() {
    // const navigate = useNavigate();
    // const {usersCount} = useApp();
    const [sort, setSort] = useState("newest");
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showFilterDrawer, setShowFilterDrawer] = useState(false);
    const [view, setView] = useState("grid");
    const [clientsPackages, setClientsPackages] = useState<Package[]>([]);  
    const [_isLoadingSubmit, setIsLoadingSubmit] = useState(false);
    // const [page, setPage] = useState(1);
    // const [hasMore, setHasMore] = useState(true);
    const [passwordVisibility, setPasswordVisibility] = useState<{[key: number]: boolean}>({});
    const [isDeletingClient, setIsDeletingClient] = useState<number | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<{id: number, fullName: string} | null>(null);
    
    const [newClient, setNewClient] = useState<NewClient>({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        package: "",
        packageId: null,
        status: "active",
    });

    const [filters, setFilters] = useState({
        status: "all",
        package: "all",
        dateJoined: "all"
    });


    // const loadMoreClients = () => {
    //     if (!hasMore || isLoading) return;
        
    //     setPage(prevPage => prevPage + 1);
    //     // Implementation would fetch the next page of clients
    //     // For now we're simulating with the mock data
    // };
 

    const togglePasswordVisibility = (clientId: number) => {
        setPasswordVisibility(prev => ({
            ...prev,
            [clientId]: !prev[clientId]
        }));
    };
    const handleDeleteClient = (client: {id: number, fullName: string}) => {
        setClientToDelete(client);
        setShowDeleteConfirm(true);
    };
    
    // 6. Add this function to confirm deletion
    const confirmDeleteClient = async () => {
        if (!clientToDelete) return;
        
        setIsDeletingClient(clientToDelete.id);
        try {
            await request.post('/api/clients/delete/', { 
                id: clientToDelete.id,
                username: clients.find(c => c.id === clientToDelete.id)?.router_username || ""
            });
            
            // Remove client from state
            setClients(prev => prev.filter(c => c.id !== clientToDelete.id));
            setShowDeleteConfirm(false);
        } catch (error) {
            console.error("Failed to delete client:", error);
            alert("Failed to delete client. Please try again.");
        } finally {
            setIsDeletingClient(null);
        }
    };
        

    // Mock data - replace with actual API call
    useEffect(() => {
        // Simulate API fetch
        // setTimeout(() => {
        //     setClients([
        //         {
        //             id: 1,
        //             fullName: "Alex Johnson",
        //             email: "alex.johnson@example.com",
        //             phone: "+1 (555) 123-4567",
        //             address: "123 Main St, Anytown",
        //             package: "Premium Internet",
        //             status: "active",
        //             dateJoined: "2024-01-15",
        //             lastPayment: "2024-04-01",
        //             avatar: "/api/placeholder/40/40",
        //             dueAmount: 0
        //         },
        //         {
        //             id: 2,
        //             fullName: "Sarah Williams",
        //             email: "sarah.w@example.com",
        //             phone: "+1 (555) 234-5678",
        //             address: "456 Oak Ave, Somecity",
        //             package: "Basic Internet",
        //             status: "overdue",
        //             dateJoined: "2023-11-20",
        //             lastPayment: "2024-03-01",
        //             avatar: "/api/placeholder/40/40",
        //             dueAmount: 59.99
        //         },
        //         {
        //             id: 3,
        //             fullName: "Michael Brown",
        //             email: "mbrown@example.com",
        //             phone: "+1 (555) 345-6789",
        //             address: "789 Pine Rd, Othertown",
        //             package: "Business Internet",
        //             status: "active",
        //             dateJoined: "2024-02-10",
        //             lastPayment: "2024-04-10",
        //             avatar: "/api/placeholder/40/40",
        //             dueAmount: 0
        //         },
        //         {
        //             id: 4,
        //             fullName: "Emily Davis",
        //             email: "emily.d@example.com",
        //             phone: "+1 (555) 456-7890",
        //             address: "101 Cedar Ln, Newcity",
        //             package: "Fiber Optic Ultra",
        //             status: "inactive",
        //             dateJoined: "2023-09-05",
        //             lastPayment: "2024-02-05",
        //             avatar: "/api/placeholder/40/40",
        //             dueAmount: 0
        //         },
        //         {
        //             id: 5,
        //             fullName: "David Wilson",
        //             email: "dwilson@example.com",
        //             phone: "+1 (555) 567-8901",
        //             address: "202 Maple Dr, Lasttown",
        //             package: "Premium Internet",
        //             status: "active",
        //             dateJoined: "2024-03-22",
        //             lastPayment: "2024-04-22",
        //             avatar: "/api/placeholder/40/40",
        //             dueAmount: 0
        //         },
        //         {
        //             id: 6,
        //             fullName: "Jennifer Taylor",
        //             email: "jennifer.t@example.com",
        //             phone: "+1 (555) 678-9012",
        //             address: "303 Birch Blvd, Somewhere",
        //             package: "Summer Special",
        //             status: "warning",
        //             dateJoined: "2023-12-15",
        //             lastPayment: "2024-03-15",
        //             avatar: "/api/placeholder/40/40",
        //             dueAmount: 0
        //         }
        //     ]);
        //     setIsLoading(false);
        // }, 800);
    }, []);

    const handleAddClient = async () => {
        if (!newClient.fullName || !newClient.phone || !newClient.package) {
            alert("Full Name, Phone Number, and Package are mandatory fields.");
            return;
        }
    
        setIsLoadingSubmit(true);
    
        const clientData = {
            fullName: newClient.fullName,
            phone: newClient.phone,
            address: newClient.address,
            email: newClient.email,
            package: newClient.package,
            packageId: newClient.packageId,
            status: newClient.status,
        };
    
        try {
            const response = await request.post('/api/clients/create/', clientData);
            console.log("Client added successfully:", response.data);
    
            if (response.data.client) {
                setClients((prev) => [response.data.client, ...prev]);
            }
    
            setShowAddModal(false);
            setNewClient({
                fullName: "",
                email: "",
                phone: "",
                address: "",
                package: "",
                status: "active",
                packageId: null,
            });
        } catch (error) {
            console.error("Failed to add client:", error);
            alert("Failed to add client. Please try again.");
        } finally {
            setIsLoadingSubmit(false);
        }
    };


    useEffect(() => {
        (async () => {
            try {
                const res = await request.post<{ pkgs: Package[] }>('/api/pkgs/', { load_type: "all" });
                setClientsPackages(res.data.pkgs);
            } catch (error) {
                console.error("Failed to fetch packages:", error);
            }
        })();
    }, []);

    useEffect(() => {
        const fetchClients = async () => {
            setIsLoading(true);
            try {
                const res = await request.post('/api/users/', { load_type: "all" });
                const formattedClients = res.data.users.map((user: any) => ({
                    id: user.id,
                    fullName: user.full_name,
                    email: user.email || "",
                    phone: user.phone,
                    address: user.address || "",
                    package: user.package,
                    status: determineStatus(user),
                    dateJoined: user.created_at,
                    lastPayment: user.package_start || user.created_at,
                    avatar: "/api/placeholder/40/40",
                    dueAmount: calculateDueAmount(user),
                    router_username: user.router_username,
                    router_password: user.router_password,
                    created_at: user.created_at,
                    due: user.due,
                    package_start: user.package_start
                }));
                setClients(formattedClients);
            } catch (error) {
                console.error("Failed to fetch clients:", error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchClients();
    }, []);



    const determineStatus = (user: any) => {
        const dueDate = new Date(user.due);
        const now = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(now.getDate() + 7);
    
        if (dueDate < now) {
            return "overdue";
        } else if (dueDate < sevenDaysFromNow) {
            return "warning";
        }
        return "active";
    };


    const calculateDueAmount = (user: any) => {
        if (determineStatus(user) === "overdue") {
            return parseFloat(user.package?.price || "0");
        }
        return 0;
    };    


    const getStatusColor = (status:string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            case "inactive":
                return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
            case "overdue":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            case "warning":
                return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
            default:
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        }
    };

    const getStatusText = (status:string) => {
        switch (status) {
            case "active":
                return "Active";
            case "inactive":
                return "Inactive";
            case "overdue":
                return "Payment Overdue";
            case "warning":
                return "Payment Due Soon";
            default:
                return status;
        }
    };



    
   const filteredClients = clients.filter((client) => {
    const matchesSearch =
        client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm);

    const matchesStatusFilter = filters.status === "all" || client.status === filters.status;
    const matchesPackageFilter = filters.package === "all" || client.package?.name === filters.package;

    return matchesSearch && matchesStatusFilter && matchesPackageFilter;
});

    const sortedClients = [...filteredClients].sort((a, b) => compareClients(sort as SortType, a, b));

const uniquePackages = [...new Set(clients.map((c) => c.package?.name))].filter(Boolean);

    const renderGridView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300">
            {sortedClients.map((client) => (
                <div
                    key={client.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 animate-fadeIn"
                >
                    <div className="flex items-center space-x-4 mb-4">
                        <img
                            src={client.avatar}
                            alt={client.fullName}
                            className="rounded-full h-12 w-12 object-cover"
                        />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{client.fullName}</h3>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{client.phone}</div>
                        </div>
                    </div>
    
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <i className="bi bi-router mr-2"></i>
                            <span>{client.package?.name} - {client.package?.speed}</span>
                        </div>
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <i className="bi bi-calendar-event mr-2"></i>
                            <span>{client.package?.duration}</span>
                        </div>
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <i className="bi bi-person-badge mr-2"></i>
                            <span>{client.router_username}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                            <div className="flex items-center">
                                <i className="bi bi-key mr-2"></i>
                                <span>{passwordVisibility[client.id] ? client.router_password : '••••••••'}</span>
                            </div>
                            <button 
                                onClick={() => togglePasswordVisibility(client.id)} 
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <i className={`bi ${passwordVisibility[client.id] ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </button>
                        </div>
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <i className="bi bi-calendar-check mr-2"></i>
                            <span>Expires: {new Date(client.due).toLocaleDateString()}</span>
                        </div>
                    </div>
    
                    <div className="mt-4 flex justify-between items-center">
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}
                        >
                            {getStatusText(client.status)}
                        </span>
    
                        <div className="flex space-x-2">
                            {client.dueAmount > 0 && (
                                <span className="text-red-600 dark:text-red-400 font-medium">
                                    ${client.dueAmount} due
                                </span>
                            )}
                            <button 
                                onClick={() => handleDeleteClient({id: client.id, fullName: client.fullName})}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                disabled={isDeletingClient === client.id}
                            >
                                {isDeletingClient === client.id ? (
                                    <i className="bi bi-hourglass-split animate-spin"></i>
                                ) : (
                                    <i className="bi bi-trash"></i>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
    
    // 10. Update the list view JSX with the new fields
    const renderListView = () => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        Client
                    </th>
                    <th scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 hidden md:table-cell">
                        Package
                    </th>
                    <th scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 hidden lg:table-cell">
                        Credentials
                    </th>
                    <th scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        Status
                    </th>
                    <th scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        Actions
                    </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {sortedClients.map((client) => (
                    <tr key={client.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 animate-fadeIn">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                    <img className="h-10 w-10 rounded-full" src={client.avatar} alt=""/>
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{client.fullName}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{client.phone}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                            <div className="text-sm text-gray-900 dark:text-white">{client.package?.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {client.package?.speed} - {client.package?.duration}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                            <div className="text-sm text-gray-900 dark:text-white">
                                User: {client.router_username}
                            </div>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <span>Pass: {passwordVisibility[client.id] ? client.router_password : '••••••••'}</span>
                                <button 
                                    onClick={() => togglePasswordVisibility(client.id)}
                                    className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    <i className={`bi ${passwordVisibility[client.id] ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                </button>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(client.status)}`}>
                                {getStatusText(client.status)}
                            </span>
                            {client.dueAmount > 0 && (
                                <div className="text-sm text-red-600 dark:text-red-400 mt-1">${client.dueAmount} due</div>
                            )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <button
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                                <i className="bi bi-pencil"></i>
                            </button>
                            <button
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">
                                <i className="bi bi-credit-card-2-front"></i>
                            </button>
                            <button
                                onClick={() => handleDeleteClient({id: client.id, fullName: client.fullName})}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                disabled={isDeletingClient === client.id}
                            >
                                {isDeletingClient === client.id ? (
                                    <i className="bi bi-hourglass-split animate-spin"></i>
                                ) : (
                                    <i className="bi bi-trash"></i>
                                )}
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
    
    // 11. Add this Delete Confirmation Modal JSX after the Add Client Modal
    const renderDeleteConfirmModal = () => (
        showDeleteConfirm && clientToDelete && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
                    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] bg-opacity-75 transition-opacity"
                         onClick={() => setShowDeleteConfirm(false)}></div>
                    <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-md">
                        <div className="bg-white dark:bg-gray-800 px-6 py-4">
                            <div className="text-center sm:mt-0 sm:text-left">
                                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-2">
                                    Delete Client
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Are you sure you want to delete <span className="font-medium">{clientToDelete.fullName}</span>? This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 flex justify-end">
                            <button
                                type="button"
                                className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-md dark:bg-red-700 dark:hover:bg-red-600"
                                onClick={confirmDeleteClient}
                                disabled={isDeletingClient === clientToDelete.id}
                            >
                                {isDeletingClient === clientToDelete.id ? (
                                    <span className="flex items-center">
                                        <i className="bi bi-hourglass-split animate-spin mr-2"></i>
                                        Deleting...
                                    </span>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    );
    

    


    return (
        <Layout>
            <div className="p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
                {/* Page Header */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Clients</h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Manage your client accounts and subscriptions
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                            >
                                <i className="bi bi-person-plus mr-2"></i>
                                Add Client
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters and Controls */}
                <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setFilters({...filters, status: "all"})}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                                    filters.status === "all"
                                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilters({...filters, status: "active"})}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                                    filters.status === "active"
                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                }`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setFilters({...filters, status: "overdue"})}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                                    filters.status === "overdue"
                                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                }`}
                            >
                                Overdue
                            </button>
                            <button
                                onClick={() => setShowFilterDrawer(true)}
                                className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 flex items-center"
                            >
                                <i className="bi bi-funnel mr-1"></i> More Filters
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative w-full md:w-64">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <i className="bi bi-search text-gray-400"></i>
                                </div>
                                <input
                                    type="text"
                                    className="w-full p-2 pl-10 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    placeholder="Search clients..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div
                                className="flex border border-gray-300 rounded-lg overflow-hidden dark:border-gray-600">
                                <button
                                    onClick={() => setView("grid")}
                                    className={`p-2 ${
                                        view === "grid"
                                            ? "bg-blue-500 text-white"
                                            : "bg-white text-gray-500 dark:bg-gray-700 dark:text-gray-300"
                                    }`}
                                >
                                    <i className="bi bi-grid"></i>
                                </button>
                                <button
                                    onClick={() => setView("list")}
                                    className={`p-2 ${
                                        view === "list"
                                            ? "bg-blue-500 text-white"
                                            : "bg-white text-gray-500 dark:bg-gray-700 dark:text-gray-300"
                                    }`}
                                >
                                    <i className="bi bi-list-ul"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Client List/Grid */}
                {isLoading ? (
                    view === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i}
                                     className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                                    <div className="flex justify-between items-center mt-4">
                                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                            <div className="animate-pulse">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="border-b border-gray-200 dark:border-gray-700 p-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
                                            <div className="flex-1">
                                                <div
                                                    className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                                            </div>
                                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                ) :  sortedClients.length > 0 ? (
                view === "grid" ? renderGridView() : renderListView()
            ): (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                        <div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                            <i className="bi bi-person-x text-gray-500 dark:text-gray-400 text-2xl"></i>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No clients found</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {searchTerm
                                ? `No clients matching "${searchTerm}"`
                                : "No clients match the selected filters"}
                        </p>
                    </div>
                )}

                {/* Filter Drawer */}
                <div
                    className={`fixed inset-y-0 right-0 z-50 w-full md:w-80 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ${showFilterDrawer ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-4 h-full flex flex-col">
                        <div className="flex justify-between items-center border-b pb-4 mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filter Clients</h3>
                            <button
                                onClick={() => setShowFilterDrawer(false)}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</h4>
                               <div className="space-y-2">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            checked={filters.status === "all"}
                                            onChange={() => setFilters({ ...filters, status: "all" })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span className="ml-2 text-gray-700 dark:text-gray-300">All</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            checked={filters.status === "active"}
                                            onChange={() => setFilters({ ...filters, status: "active" })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span className="ml-2 text-gray-700 dark:text-gray-300">Active</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            checked={filters.status === "inactive"}
                                            onChange={() => setFilters({ ...filters, status: "inactive" })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span className="ml-2 text-gray-700 dark:text-gray-300">Inactive</span>
                                    </label>
                                    
                                        </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Package</h4>
                                <div className="space-y-2">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="package"
                                            checked={filters.package === "all"}
                                            onChange={() => setFilters({...filters, package: "all"})}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span className="ml-2 text-gray-700 dark:text-gray-300">All Packages</span>
                                    </label>
                                    {uniquePackages.map((pkg, index) => (
                                        <label key={index} className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="package"
                                                checked={filters.package === pkg}
                                                onChange={() => setFilters({...filters, package: pkg})}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                            />
                                            <span className="ml-2 text-gray-700 dark:text-gray-300">{pkg}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date
                                    Joined</h4>
                                <div className="space-y-2">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="dateJoined"
                                            checked={filters.dateJoined === "all"}
                                            onChange={() => setFilters({...filters, dateJoined: "all"})}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span className="ml-2 text-gray-700 dark:text-gray-300">All Time</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="dateJoined"
                                            checked={filters.dateJoined === "month"}
                                            onChange={() => setFilters({...filters, dateJoined: "month"})}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span className="ml-2 text-gray-700 dark:text-gray-300">This Month</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="dateJoined"
                                            checked={filters.dateJoined === "quarter"}
                                            onChange={() => setFilters({...filters, dateJoined: "quarter"})}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span className="ml-2 text-gray-700 dark:text-gray-300">This Quarter</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="dateJoined"
                                            checked={filters.dateJoined === "year"}
                                            onChange={() => setFilters({...filters, dateJoined: "year"})}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span className="ml-2 text-gray-700 dark:text-gray-300">This Year</span>
                                    </label>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</h4>
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value as SortType)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="name">Name (A-Z)</option>
                                </select>
                            </div>
                        </div>

                        <div className="border-t pt-4 flex justify-between">
                            <button
                                onClick={() => {
                                    setFilters({
                                        status: "all",
                                        package: "all",
                                        dateJoined: "all"
                                    });
                                    setSort("newest");
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                Reset All
                            </button>
                            <button
                                onClick={() => setShowFilterDrawer(false)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Add Client Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
                            <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] bg-opacity-75 transition-opacity"
                                 onClick={() => setShowAddModal(false)}></div>
                            <div
                                className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-lg">
                                <div className="bg-white dark:bg-gray-800 px-6 py-4">
                                    <div className="flex justify-between items-center border-b pb-3">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New
                                            Client</h3>
                                        <button
                                            onClick={() => setShowAddModal(false)}
                                            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                                        >
                                            <i className="bi bi-x-lg"></i>
                                        </button>
                                    </div>

                                    <div className="mt-4">
                                        <div className="mb-4">
                                            <label
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                value={newClient.fullName}
                                                onChange={(e) => setNewClient({...newClient, fullName: e.target.value})}
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    value={newClient.email}
                                                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Phone
                                                </label>
                                                <input
                                                    type="tel"
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    value={newClient.phone}
                                                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Address
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                value={newClient.address}
                                                onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Package
                                                </label>
                                               <select
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    value={newClient.package}
                                                    onChange={(e) => {
                                                        const selectedPackage = clientsPackages.find(
                                                            (pkg) => `${pkg.name} ${pkg.speed} ${pkg.duration}` === e.target.value
                                                        );
                                                        setNewClient({
                                                            ...newClient,
                                                            package: e.target.value,
                                                            packageId: selectedPackage?.id || null,
                                                        });
                                                    }}
                                                    required
                                                >
                                                    <option value="">Select a package</option>
                                                    {clientsPackages.length === 0 ? (
                                                        <option value="" disabled>
                                                            Loading packages...
                                                        </option>
                                                    ) : (
                                                        clientsPackages.map((pkg, index) => (
                                                            <option key={index} value={`${pkg.name} ${pkg.speed} ${pkg.duration}`}>
                                                                {pkg.name} {pkg.speed} {pkg.duration}
                                                            </option>
                                                        ))
                                                    )}
                                                </select>
                                            </div>

                                        <div className="mb-4">
                                            <label
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Status
                                            </label>
                                            <select
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={newClient.status}
                                            onChange={(e) => {
                                                setNewClient({
                                                    ...newClient,
                                                    status: e.target.value, // Correctly update the status field
                                                });
                                            }}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
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
                                                type="button"
                                                onClick={() => handleAddClient()}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                Add Client
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        {renderDeleteConfirmModal()}

        </Layout>
    );
}