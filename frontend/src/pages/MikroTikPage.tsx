import Layout from "./home-components/Layout.tsx";
import GIcon from "../ui/components/Icons.tsx";
import React, {useEffect, useState} from "react";
import request from "../build/request.ts";
import Config from "../assets/config.ts";
import AddMikrotik from "../ui/offcanvas/AddMikrotik.tsx";
import {Inbox, Plus, RotateCw, Wifi, WifiOff} from "lucide-react";



export default function MikroTikPage() {

    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState<Mikrotik[]>([])
    const [activeTab, setActiveTab] = useState<string>("all");
    const [allCount, setAllCount] = useState(0);
    const [activeCount, setActiveCount] = useState(0);
    const [inActiveCount, setInactiveCount] = useState(0);

    useEffect(() => {
        fetchItems(activeTab);
    }, [activeTab]);
    const fetchItems = (tab: string) => {
        setLoading(true);
        const fd = new FormData();
        fd.append("load_type", tab)
        request.post(Config.baseURL + "/api/routers/", fd)
            .then(res => {
                const data = res.data as RoutersResponse;
                setLoading(false);
                setItems(data.routers);
                setAllCount(data.all_count);
                setActiveCount(data.active_count);
                setInactiveCount(data.inactive_count);
            }).catch(err => {
            console.log(err);
            setLoading(false);
        });
    };
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };
    return (
        <>
            <Layout>
                <div className="bg-white rounded-lg shadow p-4 pb-0 mx-1">
                    {/* Card Header */}
                    <div
                        className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-amber-600 text-2xl font-semibold mb-0">Mikrotik Devices</h3>
                            <p className="text-gray-600 text-sm">
                                List of Mikrotik devices
                            </p>
                        </div>
                        <div className="flex gap-2 mt-4 md:mt-0">
                            <button
                                onClick={() => fetchItems(activeTab)}

                                className="flex items-center cursor-pointer gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                                data-bs-toggle="offcanvas"
                            >
                                <RotateCw className="text-lg"/>
                                Refresh
                            </button>
                            <a
                                href="#drawer-link-mikrotik"
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                                data-bs-toggle="offcanvas"
                            >
                                <Plus className="text-lg"/>
                                Link Mikrotik
                            </a>
                            <AddMikrotik/>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mt-6">
                        <div aria-label="Package categories">


                            <div className="border-b border-gray-200 dark:border-gray-700">
                                <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                                    <li className="me-2">
                                        <button
                                            onClick={() => handleTabChange('all')}
                                            className={`inline-flex cursor-pointer gap-2 items-center justify-center p-4 border-b-2 ${
                                                activeTab === 'all'
                                                    ? 'text-blue-600 border-blue-600'
                                                    : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                                            } rounded-t-lg group`}>
                                            <svg width="16" height="16"
                                                 className="stroke-1 fi-tabs-item-icon h-5 w-5 shrink-0 transition duration-75 text-primary-600 dark:text-primary-400"
                                                 xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"
                                                 fill="currentColor">
                                                <path
                                                    d="M216,42H40A14,14,0,0,0,26,56V200a14,14,0,0,0,14,14H216a14,14,0,0,0,14-14V56A14,14,0,0,0,216,42Zm2,158a2,2,0,0,1-2,2H40a2,2,0,0,1-2-2V56a2,2,0,0,1,2-2H216a2,2,0,0,1,2,2ZM174,88a46,46,0,0,1-92,0,6,6,0,0,1,12,0,34,34,0,0,0,68,0,6,6,0,0,1,12,0Z"></path>
                                            </svg>
                                            All
                                            <span
                                                className="ms-auto h-6 w-6 flex justify-center items-center text-xs text-white rounded bg-amber-400">
                                              {allCount}
                                            </span>
                                        </button>
                                    </li>
                                    <li className="me-2">
                                        <button
                                            onClick={() => handleTabChange('active')}
                                            className={`inline-flex cursor-pointer gap-2 items-center justify-center p-4 border-b-2 ${
                                                activeTab === 'active'
                                                    ? 'text-blue-600 border-blue-600'
                                                    : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                                            } rounded-t-lg group`}
                                        >
                                            <Wifi size={16}/>
                                            Online
                                            <span
                                                className="ms-auto h-6 w-6 flex justify-center items-center text-xs text-white rounded bg-green-400">
                                              {activeCount}
                                            </span>
                                        </button>
                                    </li>
                                    <li className="me-2">
                                        <button
                                            onClick={() => handleTabChange('inactive')}
                                            className={`inline-flex cursor-pointer gap-2 items-center justify-center p-4 border-b-2 ${
                                                activeTab === 'inactive'
                                                    ? 'text-blue-600 border-blue-600'
                                                    : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                                            } rounded-t-lg group`}
                                        >
                                            <WifiOff size={16} className="wtext-gray-500"/>
                                            Offline
                                            <span
                                                className="ms-auto h-6 w-6 flex justify-center items-center text-xs text-white rounded bg-gray-400">
                                              {inActiveCount}
                                            </span>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white mt-2 rounded-lg shadow pb-0 mx-1">
                    {loading ? <div className="h-[5rem] justify-center items-center w-full flex">
                            <GIcon color={"fill-amber-500 | fill-gray-800"} name={"g-loader"} size={64}/>
                        </div>
                        : <ItemList items={items}/>
                    }
                </div>
            </Layout>

        </>

    )
}

interface ItemListProps {
    items: Mikrotik[]
}

function ItemList({items}: ItemListProps) {
    return (
        <>
            {items?.length > 0 ?
                <MikrotikTable items={items}/>
                :
                <div className="min-h-[5rem] py-10 justify-center gap-2 flex-col items-center w-full flex">
                    <Inbox size={64}/>
                    <strong> No Device Connected</strong>
                    <p className={"text-gray-500"}>
                        Add mikrotik by clicking the button above
                    </p>
                </div>
            }
        </>
    )
}

const MikrotikTable: React.FC<{
    items: Mikrotik[];
}> = ({items}) => {
    const [searchText, setSearchText] = useState("");

    return (
        <>
            <div className="mb-4">
                <label htmlFor="table-search" className="sr-only">Search</label>
                <div className="relative">
                    <div
                        className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                        </svg>
                    </div>
                    <input type="text" id="table-search-mikrotiks"
                           value={searchText}
                           onChange={(e) => setSearchText(e.target.value)}
                           className="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                           placeholder="Search for Mikrotiks"/>
                </div>
            </div>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-800 dark:text-gray-800">
                    <thead
                        className="text-xs text-white uppercase bg-gray-400 border-b border-blue-400 dark:text-white">
                    <tr>
                        <th scope="col" className="px-6 py-3">
                            Router Name
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Location
                        </th>
                        <th scope="col" className="px-6 py-3">
                            IP Address
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Username
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Action
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {items
                        .filter(router =>
                            router.name.toLowerCase().includes(searchText.toLowerCase()) ||
                            router.ip_address.toLowerCase().includes(searchText.toLowerCase())
                        )
                        .map((router, index) => (
                            <tr
                                key={index}
                                className="border-b border-gray-200 hover:bg-gray-200"
                            >
                                <th
                                    scope="row"
                                    className="px-6 py-4 font-medium text-amber-900 whitespace-nowrap dark:text-amber-900"
                                >
                                    {router.name}
                                </th>
                                <td className="px-6 py-4">{router.location}</td>
                                <td className="px-6 py-4">{router.ip_address}</td>
                                <td className="px-6 py-4">{router.username}</td>
                                <td className="px-6 flex gap-2 py-4">
                                    <a href="#" className="font-medium  p-2 bg-gray-300 rounded hover:bg-gray-400">
                                        Edit
                                    </a>
                                    <a href="#" className="font-medium  p-2 bg-gray-300 rounded hover:bg-gray-400">
                                        View
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};