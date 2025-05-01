import {useState, useEffect, useRef, useCallback} from "react";
import {
    Bell,
    Settings,
    LogOut,
    User,
    ChevronDown,
    Search,
    Menu,
    X,
    HelpCircle,
    Moon,
    Sun,
    Wifi,
    BarChart,
    Users
} from "lucide-react";
import Signal from "../../lib/Signal.ts";
import placeholder_img from "../../assets/placeholder.jpg"
// Simulate user data - you'll replace this with actual data from your backend
const userData = {
    name: "John Doe",
    email: "john.doe@yourcompany.com",
    role: "Administrator",
    avatar: placeholder_img
};

// Simulate notifications - you'll populate these from your backend
const notifications = [
    {id: 1, message: "New client connected", time: "5 min ago", read: false},
    {id: 2, message: "Mikrotik device #53 is offline", time: "10 min ago", read: false},
    {id: 3, message: "Bandwidth limit reached for client 'ABC Corp'", time: "30 min ago", read: true},
    {id: 4, message: "System update available", time: "1 hour ago", read: true}
];

export default function Header() {
    const [darkMode, setDarkMode] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [unreadCount, setUnreadCount] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [drawerMenuOpen, setDrawerMenuOpen] = useState(false);

    const userMenuRef = useRef(null);
    const notificationsRef = useRef(null);

    // Calculate unread notifications
    useEffect(() => {
        const count = notifications.filter(notification => !notification.read).length;
        setUnreadCount(count);
    }, []);

    // Handle dark mode toggle
    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);

        // Apply the dark mode to the document using Tailwind's dark class
        if (newDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    };

    // Initialize dark mode on component mount based on user preference or system preference
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode');

        if (savedDarkMode === 'true') {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        } else if (savedDarkMode === 'false') {
            setDarkMode(false);
            document.documentElement.classList.remove('dark');
        } else {
            // Check system preference if no saved preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setDarkMode(prefersDark);
            if (prefersDark) {
                document.documentElement.classList.add('dark');
            }
        }
    }, []);

    // Handle clicks outside of dropdown menus to close them
    useEffect(() => {
        function handleClickOutside(event) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        }

        Signal.on("side-drawer-close", () => {
            setDrawerMenuOpen(false);
        });

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            Signal.off("side-drawer-close")
        };
    }, []);

    // Handle mobile menu toggle
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    // Simulate triggering sidebar from your existing code
    const toggleSidebar = useCallback(() => {
        setDrawerMenuOpen(prev => {
            const open = !prev;
            Signal.trigger("side-drawer", open ? "open" : "close");
            return open;
        })
        // Signal.trigger("drawer", 'logo-sidebar');
    }, []);

    return (
        <header
            className="fixed m-header top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm transition-all dark:bg-gray-800 dark:border-gray-700">
            <div className="px-4 py-2.5 lg:px-6">
                <div className="flex items-center justify-between">
                    {/* Logo and Brand */}
                    <div className="flex items-center">
                        <button
                            type={"button"}
                            onClick={toggleSidebar}
                            className="p-2 mr-2 text-gray-600 rounded-lg md:hidden hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:text-gray-400 dark:hover:bg-gray-700"
                        >

                            {drawerMenuOpen ? <X size={24}/> :
                                <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path clipRule="evenodd" fillRule="evenodd"
                                          d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                                </svg>}
                        </button>

                        <div className="flex items-center">
                            <div className="bg-blue-600 text-white p-1.5 rounded-lg mr-2">
                                <Wifi size={24}/>
                            </div>
                            <span className="text-xl font-semibold tracking-tight text-gray-800 dark:text-white">
                ISP<span className="text-blue-600">Control</span>
              </span>
                        </div>
                    </div>

                    {/* Search Bar - Hidden on mobile */}
                    <div
                        className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-1.5 mx-4 flex-1 max-w-xl dark:bg-gray-700">
                        <Search size={18} className="text-gray-500 dark:text-gray-400"/>
                        <input
                            type="text"
                            placeholder="Search clients, devices, tickets..."
                            className="bg-transparent border-none w-full focus:outline-none focus:ring-0 ml-2 text-sm text-gray-700 dark:text-gray-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Right Menu Items */}
                    <div className="flex items-center space-x-1 md:space-x-3">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 text-gray-600 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                            {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
                        </button>

                        {/* Notifications */}
                        <div className="relative" ref={notificationsRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 text-gray-600 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:text-gray-400 dark:hover:bg-gray-700"
                            >
                                <Bell size={20}/>
                                {unreadCount > 0 && (
                                    <span
                                        className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                    {unreadCount}
                  </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div
                                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Notifications</h3>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.map((notification, index) => (
                                            <div
                                                key={notification.id}
                                                className="flex items-start p-3 border-b border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                                                style={{
                                                    animation: `fadeIn 300ms ease-out ${index * 50}ms both`
                                                }}
                                            >
                                                <div
                                                    className={`w-2 h-2 mt-2 rounded-full mr-3 ${notification.read ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-500'}`}></div>
                                                <div className="flex-1">
                                                    <p className={`text-sm ${notification.read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 font-medium dark:text-gray-200'}`}>
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1 dark:text-gray-500">{notification.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-2 text-center border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium dark:text-blue-400 dark:hover:text-blue-300">
                                            Mark all as read
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Help */}
                        <button
                            className="p-2 text-gray-600 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:text-gray-400 dark:hover:bg-gray-700">
                            <HelpCircle size={20}/>
                        </button>

                        {/* User Profile */}
                        <div className="relative ml-1" ref={userMenuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center justify-center space-x-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:hover:bg-gray-700"
                            >
                                <img
                                    src={userData.avatar}
                                    alt="User"
                                    className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                                />
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{userData.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">{userData.role}</p>
                                </div>
                                <ChevronDown size={16} className="hidden md:block text-gray-400"/>
                            </button>

                            {/* User Dropdown */}
                            {showUserMenu && (
                                <div
                                    className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg overflow-hidden border border-gray-200 z-50 dark:bg-gray-800 dark:border-gray-700">
                                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{userData.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 dark:text-gray-400">{userData.email}</p>
                                    </div>
                                    <div className="py-1">
                                        {[
                                            {icon: User, text: "My Profile", delay: 0},
                                            {icon: Users, text: "Manage Team", delay: 50},
                                            {icon: BarChart, text: "Analytics", delay: 100},
                                            {icon: Settings, text: "Settings", delay: 150}
                                        ].map((item, index) => (
                                            <button
                                                key={index}
                                                className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                style={{
                                                    animation: `fadeIn 300ms ease-out ${item.delay}ms both`
                                                }}
                                            >
                                                <item.icon size={16} className="mr-2"/>
                                                {item.text}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="py-1 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                                            style={{
                                                animation: `fadeIn 300ms ease-out 200ms both`
                                            }}
                                        >
                                            <LogOut size={16} className="mr-2"/>
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Search - Only visible on mobile */}
            <div className="md:hidden px-4 pb-2">
                <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1.5 dark:bg-gray-700">
                    <Search size={18} className="text-gray-500 dark:text-gray-400"/>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none w-full focus:outline-none focus:ring-0 ml-2 text-sm text-gray-700 dark:text-gray-300"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    <div className="py-2 space-y-1">
                        {[
                            {icon: User, text: "My Profile"},
                            {icon: Settings, text: "Settings"},
                            {icon: HelpCircle, text: "Help & Support"},
                            {icon: LogOut, text: "Sign out", textColor: "text-red-600 dark:text-red-400"}
                        ].map((item, index) => (
                            <button
                                key={index}
                                className={`flex items-center w-full px-4 py-2 text-sm ${item.textColor || "text-gray-700 dark:text-gray-300"} hover:bg-gray-100 dark:hover:bg-gray-700`}
                                style={{
                                    animation: `fadeIn 300ms ease-out ${index * 50}ms both`
                                }}
                            >
                                <item.icon size={18} className="mr-3"/>
                                {item.text}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
}