import {useState, useEffect} from "react";
// import {useApp} from "../ui/AppContext.tsx";
import {
    CreditCard,
    Download,
    Filter,
    Search,
    ChevronDown,
    ChevronUp,
    Eye,
    Trash2,
    Edit,
    AlertCircle,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    BarChart4,
    Users
} from "lucide-react";
import {motion} from "framer-motion";
import Layout from "./home-components/Layout.tsx";

// Type definitions
type PaymentMethod = "M-Pesa" | "Bank Transfer" | "Cash" | "Card" | "Other";
type PaymentStatus = "Completed" | "Pending" | "Failed";

interface Payment {
    id: string;
    amount: number;
    currency: string;
    clientName: string;
    clientId: string;
    date: string;
    method: PaymentMethod;
    status: PaymentStatus;
    reference: string;
}

// Mock data for demonstration
const generateMockPayments = (count: number): Payment[] => {
    const methods: PaymentMethod[] = ["M-Pesa", "Bank Transfer", "Cash", "Card", "Other"];
    const statuses: PaymentStatus[] = ["Completed", "Pending", "Failed"];
    const clients = [
        "John Kamau", "Mary Wanjiku", "Peter Ochieng", "Sarah Nduta",
        "James Maina", "Elizabeth Akinyi", "David Otieno", "Nancy Wangari",
        "Michael Gitonga", "Patricia Awuor"
    ];

    return Array.from({length: count}).map((_, i) => ({
        id: `PAY-${100000 + i}`,
        amount: Math.floor(Math.random() * 50000) + 500,
        currency: "KES",
        clientName: clients[Math.floor(Math.random() * clients.length)] || "Unknown Client",
        clientId: `CLI-${20000 + Math.floor(Math.random() * 1000)}`,
        date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        method: methods[Math.floor(Math.random() * methods.length)] || "Other",
        status: statuses[Math.floor(Math.random() * statuses.length)] || "Pending",
        reference: `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    }));
};

export default function PaymentsPage() {
    // const {page} = useApp();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<PaymentStatus | "All">("All");
    const [methodFilter, setMethodFilter] = useState<PaymentMethod | "All">("All");
    const [dateFilter, setDateFilter] = useState<"All" | "Today" | "This Week" | "This Month">("All");
    const [sortBy, setSortBy] = useState<"date" | "amount" | "client">("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const paymentsPerPage = 10;

    // Stats
    const [stats, setStats] = useState({
        totalPayments: 0,
        pendingAmount: 0,
        completedAmount: 0,
        failedAmount: 0,
        todayTotal: 0,
        thisWeekTotal: 0,
        thisMonthTotal: 0,
        mPesaPercentage: 0,
        bankPercentage: 0,
        cashPercentage: 0,
    });

    useEffect(() => {
        // Simulate API fetch
        setTimeout(() => {
            const mockData = generateMockPayments(50);
            setPayments(mockData);
            setLoading(false);

            // Calculate stats
            // const totalAmount = mockData.reduce((sum, payment) => sum + payment.amount, 0);
            const pendingAmount = mockData.filter(p => p.status === "Pending").reduce((sum, payment) => sum + payment.amount, 0);
            const completedAmount = mockData.filter(p => p.status === "Completed").reduce((sum, payment) => sum + payment.amount, 0);
            const failedAmount = mockData.filter(p => p.status === "Failed").reduce((sum, payment) => sum + payment.amount, 0);

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayPayments = mockData.filter(p => new Date(p.date) >= today);
            const todayTotal = todayPayments.reduce((sum, payment) => sum + payment.amount, 0);

            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            weekStart.setHours(0, 0, 0, 0);
            const weekPayments = mockData.filter(p => new Date(p.date) >= weekStart);
            const weekTotal = weekPayments.reduce((sum, payment) => sum + payment.amount, 0);

            const monthStart = new Date();
            monthStart.setDate(1);
            monthStart.setHours(0, 0, 0, 0);
            const monthPayments = mockData.filter(p => new Date(p.date) >= monthStart);
            const monthTotal = monthPayments.reduce((sum, payment) => sum + payment.amount, 0);

            const mPesaCount = mockData.filter(p => p.method === "M-Pesa").length;
            const bankCount = mockData.filter(p => p.method === "Bank Transfer").length;
            const cashCount = mockData.filter(p => p.method === "Cash").length;

            setStats({
                totalPayments: mockData.length,
                pendingAmount,
                completedAmount,
                failedAmount,
                todayTotal,
                thisWeekTotal: weekTotal,
                thisMonthTotal: monthTotal,
                mPesaPercentage: Math.round((mPesaCount / mockData.length) * 100),
                bankPercentage: Math.round((bankCount / mockData.length) * 100),
                cashPercentage: Math.round((cashCount / mockData.length) * 100),
            });
        }, 800);
    }, []);

    // Filter and sort payments
    const filteredPayments = payments
        .filter(payment => {
            const matchesSearch = payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.reference.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === "All" || payment.status === statusFilter;
            const matchesMethod = methodFilter === "All" || payment.method === methodFilter;

            let matchesDate = true;
            if (dateFilter !== "All") {
                const paymentDate = new Date(payment.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (dateFilter === "Today") {
                    matchesDate = paymentDate >= today;
                } else if (dateFilter === "This Week") {
                    const weekStart = new Date();
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                    weekStart.setHours(0, 0, 0, 0);
                    matchesDate = paymentDate >= weekStart;
                } else if (dateFilter === "This Month") {
                    const monthStart = new Date();
                    monthStart.setDate(1);
                    monthStart.setHours(0, 0, 0, 0);
                    matchesDate = paymentDate >= monthStart;
                }
            }

            return matchesSearch && matchesStatus && matchesMethod && matchesDate;
        })
        .sort((a, b) => {
            if (sortBy === "date") {
                return sortOrder === "asc"
                    ? new Date(a.date).getTime() - new Date(b.date).getTime()
                    : new Date(b.date).getTime() - new Date(a.date).getTime();
            } else if (sortBy === "amount") {
                return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
            } else {
                return sortOrder === "asc"
                    ? a.clientName.localeCompare(b.clientName)
                    : b.clientName.localeCompare(a.clientName);
            }
        });

    // Pagination
    const indexOfLastPayment = currentPage * paymentsPerPage;
    const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
    const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);
    const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const handleSort = (column: "date" | "amount" | "client") => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("desc");
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-KE", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusColor = (status: PaymentStatus) => {
        switch (status) {
            case "Completed":
                return "bg-green-100 text-green-800";
            case "Pending":
                return "bg-amber-100 text-amber-800";
            case "Failed":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getMethodIcon = (method: PaymentMethod) => {
        switch (method) {
            case "M-Pesa":
                return <div
                    className="bg-green-600 rounded-full h-8 w-8 flex items-center justify-center text-white">M</div>;
            case "Bank Transfer":
                return <DollarSign size={18} className="text-blue-600"/>;
            case "Cash":
                return <DollarSign size={18} className="text-amber-600"/>;
            case "Card":
                return <CreditCard size={18} className="text-purple-600"/>;
            default:
                return <CreditCard size={18} className="text-gray-600"/>;
        }
    };

    const viewPaymentDetails = (payment: Payment) => {
        setSelectedPayment(payment);
        setShowModal(true);
    };

    return (
        <Layout>
            <div className="p-4">
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Payments</h1>
                        <button
                            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                            <Download size={18}/>
                            <span className="hidden sm:inline">Export Report</span>
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <motion.div
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: 0.1}}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-amber-500"
                        >
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Payments</p>
                                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{formatCurrency(stats.completedAmount + stats.pendingAmount)}</h3>
                                </div>
                                <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                                    <CreditCard size={24} className="text-amber-600"/>
                                </div>
                            </div>
                            <div className="mt-2 flex items-center gap-1">
                                <ArrowUpRight size={16} className="text-green-500"/>
                                <span className="text-xs text-green-500">+12.5% from last month</span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: 0.2}}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-green-500"
                        >
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{formatCurrency(stats.completedAmount)}</h3>
                                </div>
                                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <ArrowUpRight size={24} className="text-green-600"/>
                                </div>
                            </div>
                            <div className="mt-2 flex items-center gap-1">
                  <span
                      className="text-xs text-gray-500">{Math.round((stats.completedAmount / (stats.completedAmount + stats.pendingAmount + stats.failedAmount)) * 100)}% of total</span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: 0.3}}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-amber-500"
                        >
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{formatCurrency(stats.pendingAmount)}</h3>
                                </div>
                                <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                                    <AlertCircle size={24} className="text-amber-600"/>
                                </div>
                            </div>
                            <div className="mt-2 flex items-center gap-1">
                  <span
                      className="text-xs text-gray-500">{Math.round((stats.pendingAmount / (stats.completedAmount + stats.pendingAmount + stats.failedAmount)) * 100)}% of total</span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: 0.4}}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-red-500"
                        >
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
                                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{formatCurrency(stats.failedAmount)}</h3>
                                </div>
                                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <ArrowDownRight size={24} className="text-red-600"/>
                                </div>
                            </div>
                            <div className="mt-2 flex items-center gap-1">
                  <span
                      className="text-xs text-gray-500">{Math.round((stats.failedAmount / (stats.completedAmount + stats.pendingAmount + stats.failedAmount)) * 100)}% of total</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Secondary Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Recent
                                Performance</h3>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-amber-500"/>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Today</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-800 dark:text-white mt-1">{formatCurrency(stats.todayTotal)}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-amber-500"/>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Week</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-800 dark:text-white mt-1">{formatCurrency(stats.thisWeekTotal)}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-amber-500"/>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Month</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-800 dark:text-white mt-1">{formatCurrency(stats.thisMonthTotal)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Payment Methods</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">M-Pesa</span>
                                    <span
                                        className="text-sm font-medium text-gray-800 dark:text-white">{stats.mPesaPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full"
                                         style={{width: `${stats.mPesaPercentage}%`}}></div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Bank Transfer</span>
                                    <span
                                        className="text-sm font-medium text-gray-800 dark:text-white">{stats.bankPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full"
                                         style={{width: `${stats.bankPercentage}%`}}></div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Cash</span>
                                    <span
                                        className="text-sm font-medium text-gray-800 dark:text-white">{stats.cashPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div className="bg-amber-500 h-2 rounded-full"
                                         style={{width: `${stats.cashPercentage}%`}}></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    className="bg-amber-50 hover:bg-amber-100 dark:bg-gray-700 dark:hover:bg-gray-600 p-3 rounded-lg transition-colors group">
                                    <div className="flex flex-col items-center">
                                        <Users size={24}
                                               className="text-amber-500 mb-1 group-hover:scale-110 transition-transform"/>
                                        <span className="text-sm text-gray-800 dark:text-gray-200">Client Payment</span>
                                    </div>
                                </button>
                                <button
                                    className="bg-amber-50 hover:bg-amber-100 dark:bg-gray-700 dark:hover:bg-gray-600 p-3 rounded-lg transition-colors group">
                                    <div className="flex flex-col items-center">
                                        <BarChart4 size={24}
                                                   className="text-amber-500 mb-1 group-hover:scale-110 transition-transform"/>
                                        <span
                                            className="text-sm text-gray-800 dark:text-gray-200">Generate Report</span>
                                    </div>
                                </button>
                                <button
                                    className="bg-amber-50 hover:bg-amber-100 dark:bg-gray-700 dark:hover:bg-gray-600 p-3 rounded-lg transition-colors group">
                                    <div className="flex flex-col items-center">
                                        <Download size={24}
                                                  className="text-amber-500 mb-1 group-hover:scale-110 transition-transform"/>
                                        <span className="text-sm text-gray-800 dark:text-gray-200">Export Data</span>
                                    </div>
                                </button>
                                <button
                                    className="bg-amber-50 hover:bg-amber-100 dark:bg-gray-700 dark:hover:bg-gray-600 p-3 rounded-lg transition-colors group">
                                    <div className="flex flex-col items-center">
                                        <Filter size={24}
                                                className="text-amber-500 mb-1 group-hover:scale-110 transition-transform"/>
                                        <span
                                            className="text-sm text-gray-800 dark:text-gray-200">Advanced Filter</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filter and Search */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={18} className="text-gray-400"/>
                                </div>
                                <input
                                    type="text"
                                    className="pl-10 pr-4 py-2 block w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-amber-500 focus:border-amber-500"
                                    placeholder="Search payments, clients, references..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                                <select
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-amber-500 focus:border-amber-500"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | "All")}
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Failed">Failed</option>
                                </select>

                                <select
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-amber-500 focus:border-amber-500"
                                    value={methodFilter}
                                    onChange={(e) => setMethodFilter(e.target.value as PaymentMethod | "All")}
                                >
                                    <option value="All">All Methods</option>
                                    <option value="M-Pesa">M-Pesa</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Card">Card</option>
                                    <option value="Other">Other</option>
                                </select>

                                <select
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-amber-500 focus:border-amber-500"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value as "All" | "Today" | "This Week" | "This Month")}
                                >
                                    <option value="All">All Time</option>
                                    <option value="Today">Today</option>
                                    <option value="This Week">This Week</option>
                                    <option value="This Month">This Month</option>
                                </select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="relative overflow-x-auto rounded-lg">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead
                                    className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">
                                        Reference
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        <div className="flex items-center cursor-pointer"
                                             onClick={() => handleSort("client")}>
                                            Client
                                            {sortBy === "client" && (
                                                sortOrder === "asc" ? <ChevronUp size={16}/> : <ChevronDown size={16}/>
                                            )}
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        <div className="flex items-center cursor-pointer"
                                             onClick={() => handleSort("amount")}>
                                            Amount
                                            {sortBy === "amount" && (
                                                sortOrder === "asc" ? <ChevronUp size={16}/> : <ChevronDown size={16}/>
                                            )}
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Method
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        <div className="flex items-center cursor-pointer"
                                             onClick={() => handleSort("date")}>
                                            Date
                                            {sortBy === "date" && (
                                                sortOrder === "asc" ? <ChevronUp size={16}/> : <ChevronDown size={16}/>
                                            )}
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-4 text-center">
                                            <div className="flex justify-center items-center">
                                                <div
                                                    className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
                                                <span className="ml-2">Loading payments...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-4 text-center">
                                            No payments found matching your search criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    currentPayments.map((payment) => (
                                        <tr key={payment.id}
                                            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 font-medium">
                                                {payment.reference}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div
                                                    className="font-medium text-gray-900 dark:text-white">{payment.clientName}</div>
                                                <div className="text-xs text-gray-500">{payment.clientId}</div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                {formatCurrency(payment.amount)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {getMethodIcon(payment.method)}
                                                    <span>{payment.method}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {formatDate(payment.date)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => viewPaymentDetails(payment)}
                                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                    >
                                                        <Eye size={18}/>
                                                    </button>
                                                    <button
                                                        className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300">
                                                        <Edit size={18}/>
                                                    </button>
                                                    <button
                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                                        <Trash2 size={18}/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {!loading && filteredPayments.length > 0 && (
                            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Showing {indexOfFirstPayment + 1}-{Math.min(indexOfLastPayment, filteredPayments.length)} of {filteredPayments.length} payments
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    {Array.from({length: Math.min(totalPages, 5)}).map((_, i) => {
                                        let pageNumber;
                                        if (totalPages <= 5) {
                                            pageNumber = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNumber = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNumber = totalPages - 4 + i;
                                        } else {
                                            pageNumber = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => paginate(pageNumber)}
                                                className={`px-3 py-1 rounded-md ${
                                                    currentPage === pageNumber
                                                        ? "bg-amber-500 text-white"
                                                        : "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                                                }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Details Modal */}
                {showModal && selectedPayment && (
                    <div
                        className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full relative">
                            <button
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                onClick={() => setShowModal(false)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                     viewBox="0 0 24 24"
                                     stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>

                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Payment
                                    Details</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Reference:</span>
                                        <span
                                            className="font-medium text-gray-900 dark:text-white">{selectedPayment.reference}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                                        <span
                                            className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedPayment.amount)}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Client:</span>
                                        <span
                                            className="font-medium text-gray-900 dark:text-white">{selectedPayment.clientName}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Client ID:</span>
                                        <span
                                            className="font-medium text-gray-900 dark:text-white">{selectedPayment.clientId}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Method:</span>
                                        <div className="flex items-center gap-2">
                                            {getMethodIcon(selectedPayment.method)}
                                            <span
                                                className="font-medium text-gray-900 dark:text-white">{selectedPayment.method}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPayment.status)}`}>
                    {selectedPayment.status}
                  </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Date:</span>
                                        <span
                                            className="font-medium text-gray-900 dark:text-white">{formatDate(selectedPayment.date)}</span>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-2">
                                    <button
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Close
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                                        Print Receipt
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}