import {useState} from "react";
import {PlusCircleIcon, UserIcon} from "lucide-react";

export default function Header() {
    const [activeTab, setActiveTab] = useState("view-all");

    return (
        <header className="w-full">

            <div className="w-full px-4">
                <div className="border-b pt-6">
                    {/* Top header */}
                    <div className="flex flex-col sm:flex-row sm:items-center">
                        <div className="flex-1">
                            <h1 className="text-2xl font-semibold tracking-tight flex items-center">
                                <span className="inline-block mr-3">👋</span>Hi, Tahlia!
                            </h1>
                        </div>
                        <div className="flex sm:justify-end mt-4 sm:mt-0 gap-2">
                            <a
                                href="#modalExport"
                                className="btn btn-sm border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100 flex items-center gap-2"
                            >
                                <UserIcon className="w-4 h-4"/>
                                <span>Share</span>
                            </a>
                            <a
                                href="#offcanvasCreate"
                                className="btn btn-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                            >
                                <PlusCircleIcon className="w-4 h-4"/>
                                <span>Create</span>
                            </a>
                        </div>
                    </div>
                    <div className="flex flex-wrap m-0">
                        {/* Amount this month */}
                        <div className="w-full md:w-1/2 xl:flex-1 p-2">
                            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                                <div className="p-4 flex items-center">
                                    <div className="flex-1">
                                        <h6 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2">
                                            Amount This Month
                                        </h6>
                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
            Ksh 0
          </span>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <svg
                                            width="25"
                                            height="25"
                                            className="text-gray-400 dark:text-gray-500"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 256 256"
                                            fill="currentColor"
                                        >
                                            <path d="M224.56,103.81C213.43,97.75..."/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 xl:flex-1 p-2">
                            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                                <div className="p-4 flex items-center">
                                    <div className="flex-1">
                                        <h6 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2">
                                            Amount This Month
                                        </h6>
                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
            Ksh 0
          </span>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <svg
                                            width="25"
                                            height="25"
                                            className="text-gray-400 dark:text-gray-500"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 256 256"
                                            fill="currentColor"
                                        >
                                            <path d="M224.56,103.81C213.43,97.75..."/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 xl:flex-1 p-2">
                            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                                <div className="p-4 flex items-center">
                                    <div className="flex-1">
                                        <h6 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2">
                                            Amount This Month
                                        </h6>
                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
            Ksh 0
          </span>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <svg
                                            width="25"
                                            height="25"
                                            className="text-gray-400 dark:text-gray-500"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 256 256"
                                            fill="currentColor"
                                        >
                                            <path d="M224.56,103.81C213.43,97.75..."/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 dark:border-gray-700 mt-6">
                        <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                            {/* Tab 1 */}
                            <li className="me-2">
                                <button
                                    onClick={() => setActiveTab("view-all")}
                                    className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group ${
                                        activeTab === "view-all"
                                            ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                                            : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                                    }`}
                                >
                                    <svg
                                        className={`w-4 h-4 mr-2 ${
                                            activeTab === "view-all"
                                                ? "text-blue-600 dark:text-blue-500"
                                                : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300"
                                        }`}
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
                                    </svg>
                                    View all
                                </button>
                            </li>

                            {/* Tab 2 */}
                            <li className="me-2">
                                <button
                                    onClick={() => setActiveTab("others")}
                                    className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group ${
                                        activeTab === "others"
                                            ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                                            : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                                    }`}
                                >
                                    <svg
                                        className={`w-4 h-4 mr-2 ${
                                            activeTab === "others"
                                                ? "text-blue-600 dark:text-blue-500"
                                                : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300"
                                        }`}
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 18 18"
                                    >
                                        <path
                                            d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857..."/>
                                    </svg>
                                    Other Tab
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {activeTab === "view-all" && (
                            <div>Showing content for <strong>View All</strong> tab</div>
                        )}
                        {activeTab === "others" && (
                            <div>Showing content for <strong>Other</strong> tab</div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}