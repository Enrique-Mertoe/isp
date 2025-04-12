import {useNavigate} from "react-router-dom";
import React from "react";
import {useApp} from "../../ui/AppContext.tsx";

export default function SideBar() {
    const {
        usersCount,
        packageCount, routerCount,
        activeUsersCount,
        ticketsCount, leadsCount
    } = useApp()

    const navItems: (NavItemType | "divider")[] = [
        {label: "Dashboard", icon: "bi-speedometer2", link: "/"},
        {label: "Users", icon: "bi-people", link: "/users", badge: usersCount},
        {label: "Active Users", icon: "bi-person-check", link: "#", badge: activeUsersCount},
        "divider",
        {label: "Tickets", icon: "bi-ticket", link: "#", badge: ticketsCount},
        {label: "Leads", icon: "bi-lightbulb", link: "#", badge: leadsCount},
        "divider",
        {label: "Packages", icon: "bi-cash-coin", link: "/packages", badge: packageCount},
        {label: "Payments", icon: "bi-credit-card-2-front", link: "#"},
        {label: "Vouchers", icon: "bi-ticket-perforated", link: "#", badge: 0},
        {label: "Expenses", icon: "bi-receipt-cutoff", link: "#"},
        "divider",
        {label: "Campaigns", icon: "bi-megaphone", link: "#", badge: "..."},
        {label: "SMS", icon: "bi-chat-dots", link: "#", badge: "..."},
        "divider",
        {label: "MikroTik", icon: "bi bi-router", link: "/mikrotiks", badge: routerCount},
        {label: "Equipments", icon: "bi bi-hdd-rack", link: "#", badge: "..."},
    ];


    return (
        <>
            <aside id="logo-sidebar"
                   className="fixed top-0 left-0 z-40 w-74 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700"
                   aria-label="Sidebar">
                <div className="h-full vstack overflow-y-auto pb-6  bg-white dark:bg-gray-800">
                    <div className=" flex-grow-1">
                        <NavList navItems={navItems}/>
                    </div>
                </div>
            </aside>

        </>
    )
}

const NavList = function ({navItems}: { navItems: (NavItemType | "divider")[] }) {
    const navigate = useNavigate();
    const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, link: string) => {
        e.preventDefault();
        navigate(link);
    };
    return (
        <>
            <ul className="space-y-2  font-medium pe-1">
                {navItems.map((item, index) => {
                    if (item === "divider") {
                        return <hr key={index} className="my-2 border-gray-300"/>;
                    }

                    return (
                        <li key={index} className="flex items-center">
                            <a
                                href={item.link}
                                onClick={item.link.startsWith("/") ? (e) => handleNavigation(e, item.link) : undefined}
                                className="flex items-center w-full p-2 text-gray-700 hover:bg-gray-200 rounded-r-full transition"
                            >
                                <i className={`bi ${item.icon} text-lg me-3`}></i>
                                <span className="flex-1">{item.label}</span>

                                {item.badge !== undefined && (
                                    <span
                                        className="ms-auto h-6 w-6 flex justify-center items-center text-xs text-white rounded-full bg-amber-400">
                  {item.badge}
                </span>
                                )}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </>
    )
}