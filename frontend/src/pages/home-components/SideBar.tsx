import {useNavigate} from "react-router-dom";
import React, {useEffect, useState, useRef} from "react";
import {useApp} from "../../ui/AppContext.tsx";
import Signal from "../../lib/Signal.ts";
import {motion, AnimatePresence} from "framer-motion";
import {
    ChevronRight,
    Home,
    Users,
    UserCheck,
    Ticket,
    Lightbulb,
    PiggyBank,
    CreditCard,
    Ticket as TicketIcon,
    Receipt,
    Megaphone,
    Network,
    MessageSquare,
    Router,
    Settings,
    Server,
    ChevronLeft,
    Menu
} from "lucide-react";



// Type definitions for better type safety
type NavItemType = {
    label: string;
    icon: string;
    lucideIcon: React.ReactNode;
    link: string;
    badge?: number | string;
    subItems?: SubNavItemType[];
};

type SubNavItemType = {
    label: string;
    link: string;
    badge?: number | string;
};

export default function SideBar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const sidebarRef = useRef<HTMLDivElement>(null);

    const {
        usersCount,
        packageCount,
        routerCount,
        activeUsersCount,
        ticketsCount,
        leadsCount
    } = useApp();

    // Group related items for organization
    const navItems: (NavItemType | "divider")[] = [
        {
            label: "Dashboard",
            icon: "bi-speedometer2",
            lucideIcon: <Home size={20}/>,
            link: "/"
        },
        {
            label: "Client Management",
            icon: "bi-people",
            lucideIcon: <Users size={20}/>,
            link: "/users",
            badge: usersCount,
            subItems: [
                {label: "All Clients", link: "/users", badge: usersCount},
                {label: "Active Clients", link: "/active-users", badge: activeUsersCount},
                {label: "Leads", link: "/leads", badge: leadsCount}
            ]
        },
        {
            label: "Active Clients",
            icon: "bi-person-check",
            lucideIcon: <UserCheck size={20}/>,
            link: "/active-users",
            badge: activeUsersCount
        },
        "divider",
        {
            label: "Support",
            icon: "bi-ticket",
            lucideIcon: <Ticket size={20}/>,
            link: "/tickets",
            badge: ticketsCount
        },
        {
            label: "Leads",
            icon: "bi-lightbulb",
            lucideIcon: <Lightbulb size={20}/>,
            link: "/leads",
            badge: leadsCount
        },
        "divider",
        {
            label: "Packages",
            icon: "bi-cash-coin",
            lucideIcon: <PiggyBank size={20}/>,
            link: "/packages",
            badge: packageCount
        },
        {
            label: "Payments",
            icon: "bi-credit-card-2-front",
            lucideIcon: <CreditCard size={20}/>,
            link: "/payments"
        },
        {
            label: "Vouchers",
            icon: "bi-ticket-perforated",
            lucideIcon: <TicketIcon size={20}/>,
            link: "/vouchers",
            badge: 0
        },
        {
            label: "Expenses",
            icon: "bi-receipt-cutoff",
            lucideIcon: <Receipt size={20}/>,
            link: "/expenses"
        },
        "divider",
        {
            label: "Marketing",
            icon: "bi-megaphone",
            lucideIcon: <Megaphone size={20}/>,
            link: "/campaigns",
            badge: "..."
        },
        {
            label: "ISP",
            icon: "bi-cloud-fill",
            lucideIcon: <Network size={20}/>,
            link: "/isp"
        },
        {
            label: "SMS",
            icon: "bi-chat-dots",
            lucideIcon: <MessageSquare size={20}/>,
            link: "/sms",
            badge: "..."
        },
        "divider",
        {
            label: "Routers",
            icon: "bi bi-router",
            lucideIcon: <Router size={20}/>,
            link: "/mikrotiks",
            badge: routerCount
        },
        {
            label: "Management",
            icon: "bi bi-gear-wide-connected",
            lucideIcon: <Settings size={20}/>,
            link: "/management"
        },
        {
            label: "Equipment",
            icon: "bi bi-hdd-rack",
            lucideIcon: <Server size={20}/>,
            link: "/equipment",
            badge: "..."
        },
    ];

    // Handle responsive behavior
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            if (window.innerWidth < 768) {
                setIsCollapsed(false);
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && window.innerWidth < 768) {
                setIsOpen(false);
                Signal.trigger("side-drawer-close")
            }
        };

        window.addEventListener('resize', handleResize);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        Signal.on("side-drawer", e => {
            setIsOpen(e == "open");
        });

        return () => {
            Signal.off("side-drawer");
        };
    }, []);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    // Remove items that will be shown as subnavs to prevent duplication
    const filteredNavItems = navItems.filter(item => {
        if (typeof item === "string") return true;
        if (item.label === "Active Clients" || item.label === "Leads") return false;
        return true;
    });

    return (
        <>
            <motion.aside
                ref={sidebarRef}
                id="logo-sidebar"
                className={`fixed top-0 left-0 z-40 h-screen pt-20 transition-all duration-300 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                } ${
                    isCollapsed ? 'w-20' : 'w-74'
                }`}
                aria-label="Sidebar"
                initial={false}
                animate={{
                    width: isCollapsed ? '5rem' : '18.5rem',
                    x: isOpen || windowWidth >= 768 ? 0 : '-100%'
                }}
                transition={{
                    type: "tween",
                    ease: "easeInOut",
                    duration: 0.3
                }}
            >
                <div
                    className="h-full flex flex-col overflow-y-auto bg-white dark:bg-gray-800 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                    <div className="flex-grow">
                        <NavList navItems={filteredNavItems} isCollapsed={isCollapsed}/>
                    </div>

                    {/* Collapse button */}
                    {windowWidth >= 768 && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={toggleCollapse}
                                className="flex items-center justify-center w-full p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                            >
                                {isCollapsed ? (
                                    <ChevronRight size={20}/>
                                ) : (
                                    <div className="flex items-center justify-between w-full">
                                        <span>Collapse Sidebar</span>
                                        <ChevronLeft size={18}/>
                                    </div>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </motion.aside>

            {/* Mobile toggle button */}
            {windowWidth < 768 && (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="fixed bottom-6 right-6 z-50 p-3 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 transition-colors"
                >
                    <Menu size={24}/>
                </button>
            )}

            {/* Backdrop for mobile */}
            <AnimatePresence>
                {isOpen && windowWidth < 768 && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

const NavList = function ({navItems, isCollapsed}: { navItems: (NavItemType | "divider")[]; isCollapsed: boolean }) {
    const navigate = useNavigate();
    const {page} = useApp();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, link: string) => {
        e.preventDefault();
        page(link);
        navigate(link);
    };

    const toggleExpand = (label: string) => {
        setExpandedItems(prev =>
            prev.includes(label)
                ? prev.filter(item => item !== label)
                : [...prev, label]
        );
    };

    return (
        <ul className="space-y-1 font-medium px-3 pt-3">
            {navItems.map((item, index) => {
                if (item === "divider") {
                    return <hr key={index} className="my-3 border-gray-200 dark:border-gray-700"/>;
                }

                const isActive = page() === item.link;
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isExpanded = expandedItems.includes(item.label);

                return (
                    <React.Fragment key={index}>
                        <li>
                            <div className="relative group">
                                <a
                                    href={item.link}
                                    onClick={e => {
                                        if (hasSubItems) {
                                            e.preventDefault();
                                            toggleExpand(item.label);
                                        } else if (item.link.startsWith("/")) {
                                            handleNavigation(e, item.link);
                                        }
                                    }}
                                    className={`flex items-center p-2.5 ${isCollapsed ? 'justify-center' : 'justify-between'} 
                    ${isActive ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' : 'text-gray-700 dark:text-gray-300'}
                    rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group relative`}
                                >
                                    <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
                    <span className="flex items-center justify-center text-lg me-3">
                      {item.lucideIcon}
                    </span>
                                        {!isCollapsed && <span>{item.label}</span>}
                                    </div>

                                    {!isCollapsed && (
                                        <>
                                            {hasSubItems && (
                                                <ChevronRight
                                                    className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                                    size={16}/>
                                            )}

                                            {item.badge !== undefined && (
                                                <span
                                                    className="ms-2 h-5 min-w-5 px-1.5 flex justify-center items-center text-xs font-medium text-white rounded-full bg-amber-500 dark:bg-amber-600">
                          {item.badge}
                        </span>
                                            )}
                                        </>
                                    )}

                                    {/* Tooltip for collapsed state */}
                                    {isCollapsed && (
                                        <div
                                            className="absolute left-full ml-6 scale-0 group-hover:scale-100 transition-all rounded bg-gray-800 text-white text-sm py-1.5 px-3 whitespace-nowrap">
                                            {item.label}
                                            {item.badge !== undefined && (
                                                <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-amber-500">
                          {item.badge}
                        </span>
                                            )}
                                        </div>
                                    )}
                                </a>
                            </div>

                            {/* Sub-items dropdown */}
                            {!isCollapsed && hasSubItems && (
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.ul
                                            initial={{height: 0, opacity: 0}}
                                            animate={{height: 'auto', opacity: 1}}
                                            exit={{height: 0, opacity: 0}}
                                            transition={{duration: 0.3}}
                                            className="ml-6 mt-1 space-y-1 overflow-hidden"
                                        >
                                            {item.subItems?.map((subItem, subIndex) => (
                                                <li key={subIndex}>
                                                    <a
                                                        href={subItem.link}
                                                        onClick={subItem.link.startsWith("/") ? (e) => handleNavigation(e, subItem.link) : undefined}
                                                        className={`flex items-center justify-between p-2 text-sm 
                              ${page() === subItem.link ? 'text-amber-800 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-200' : 'text-gray-600 dark:text-gray-400'} 
                              rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700`}
                                                    >
                                                        <span>{subItem.label}</span>
                                                        {subItem.badge !== undefined && (
                                                            <span
                                                                className="h-5 min-w-5 px-1.5 flex justify-center items-center text-xs font-medium text-white rounded-full bg-amber-500 dark:bg-amber-600">
                                {subItem.badge}
                              </span>
                                                        )}
                                                    </a>
                                                </li>
                                            ))}
                                        </motion.ul>
                                    )}
                                </AnimatePresence>
                            )}
                        </li>
                    </React.Fragment>
                );
            })}
        </ul>
    );
};