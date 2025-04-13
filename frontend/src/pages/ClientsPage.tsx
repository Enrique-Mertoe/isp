import Layout from "./home-components/Layout.tsx";
import React, {useEffect, useState} from "react";
import request from "../build/request.ts";
import Config from "../assets/config.ts";
import {Cable, Inbox, Plus, RotateCw, Wifi} from "lucide-react";
import GIcon from "../ui/components/Icons.tsx";
import AddUser from "../ui/offcanvas/AddUser.tsx";

type UserResponse = {
    users: UserInfo[];
    all_count: number;
    pppoe_count: number;
    hotspot_count: number;
};

export default function ClientsPage() {
    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState<UserInfo[]>([])
    const [activeTab, setActiveTab] = useState<string>("all");
    const [allCount, setAllCount] = useState(0);
    const [hotspotCount, setHotspotCount] = useState(0);
    const [pppoeCount, setPppoeCount] = useState(0);

    useEffect(() => {
        fetchItems(activeTab);
    }, [activeTab]);
    const fetchItems = (tab: string) => {
        setLoading(true);
        const fd = new FormData();
        fd.append("load_type", tab)
        request.post(Config.baseURL + "/api/user/", fd)
            .then(res => {
                const data = res.data as UserResponse;
                setLoading(false);
                setItems(data.users);
                setAllCount(data.all_count);
                setHotspotCount(data.hotspot_count);
                setPppoeCount(data.pppoe_count);
            }).catch(err => {
            console.log(err);
            setLoading(false);
        });
    };
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };
    return (
        <Layout>
            <div className="bg-white rounded-lg shadow p-4 pb-0 mx-1">
                {/* Card Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-amber-600 text-2xl font-semibold mb-0">Users</h3>
                        <p className="text-gray-600 text-sm">
                            All users including hotspot and PPPoE users
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
                            href="#drawer-add-package"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                            data-bs-toggle="offcanvas"
                        >
                            <Plus className="text-lg"/>
                            Add User
                        </a>
                        <AddUser/>
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
                                        onClick={() => handleTabChange('hotspot')}
                                        className={`inline-flex cursor-pointer gap-2 items-center justify-center p-4 border-b-2 ${
                                            activeTab === 'hotspot'
                                                ? 'text-blue-600 border-blue-600'
                                                : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                                        } rounded-t-lg group`}
                                    >
                                        <Wifi size={16}/>
                                        Hotspot Users
                                        <span
                                            className="ms-auto h-6 w-6 flex justify-center items-center text-xs text-white rounded bg-amber-400">
                                              {hotspotCount}
                                            </span>
                                    </button>
                                </li>
                                <li className="me-2">
                                    <button
                                        onClick={() => handleTabChange('pppoe')}
                                        className={`inline-flex cursor-pointer gap-2 items-center justify-center p-4 border-b-2 ${
                                            activeTab === 'pppoe'
                                                ? 'text-blue-600 border-blue-600'
                                                : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                                        } rounded-t-lg group`}
                                    >
                                        <Cable size={16} className="wtext-gray-500"/>
                                        PPPoE Users

                                        <span
                                            className="ms-auto h-6 w-6 flex justify-center items-center text-xs text-white rounded bg-amber-400">
                                              {pppoeCount}
                                            </span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white mt-2 rounded-lg shadow p-4 pb-0 mx-1">
                {loading ? <div className="h-[5rem] justify-center items-center w-full flex">
                        <GIcon color={"fill-amber-500 | fill-gray-800"} name={"g-loader"} size={64}/>
                    </div>
                    : <ItemList items={items}/>
                }
            </div>
        </Layout>

    )
}

interface ItemListProps {
    items: UserInfo[]
}

function ItemList({items}: ItemListProps) {
    return (
        <>
            {items?.length > 0 ?
                <UserTable items={items}/>
                :
                <div className="min-h-[5rem] py-10 justify-center gap-2 flex-col items-center w-full flex">
                    <Inbox size={64}/>
                    <strong> No Users</strong>
                    <p className={"text-gray-500"}>
                        Add users by clicking the button above
                    </p>
                </div>
            }
        </>
    )
}

const UserTable: React.FC<{
    items: UserInfo[];
}> = ({items}) => {
    const [searchText, setSearchText] = useState("");

    const filteredUsers = items.filter(user =>
        user.username.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase()) ||
        user.package.name.toLowerCase().includes(searchText.toLowerCase()) ||
        user.package.type.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <>
            <div className="mb-4">
                <label htmlFor="table-search" className="sr-only">Search</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" aria-hidden="true"
                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                        </svg>
                    </div>
                    <input
                        type="text"
                        id="table-search"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="block pt-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search packages..."
                    />
                </div>
            </div>

            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-800">
                    <thead className="text-xs text-white uppercase bg-gray-400 border-b border-blue-400">
                    <tr>
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Upload Speed</th>
                        <th className="px-6 py-3">Download Speed</th>
                        <th className="px-6 py-3">Price</th>
                        <th className="px-6 py-3">Router</th>
                        <th className="px-6 py-3">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredUsers.map((user, index) => (
                        <tr key={index+user.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td className="w-4 p-4">
                                <div className="flex items-center">
                                    <input id="checkbox-table-search-1" type="checkbox"
                                           className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                    <label htmlFor="checkbox-table-search-1" className="sr-only">checkbox</label>
                                </div>
                            </td>
                            <th scope="row"
                                className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                                <img className="w-10 h-10 rounded-full" src="/docs/images/people/profile-picture-1.jpg"
                                     alt="Jese image"/>
                                <div className="ps-3">
                                    <div className="text-base font-semibold">{user.username}</div>
                                    {/*<div className="font-normal text-gray-500">{user.email}</div>*/}
                                </div>
                            </th>
                            <td className="px-6 py-4">
                                {user.email}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></div>
                                    {user.package.name}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit
                                    user</a>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};