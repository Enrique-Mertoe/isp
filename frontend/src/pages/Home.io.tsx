import Layout from "./home-components/Layout.tsx";
import Head from "./home-components/Head.tsx";
import React, {useEffect, useState} from "react";
import request from "../build/request.ts";
import Config from "../assets/config.ts";
import {Bar} from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
} from 'chart.js';
import EmptyList from "../ui/EmptyList.tsx";
import PageLoader from "../ui/PageLoader.tsx";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);


export default function HomePage() {
    const [data, setDashData] = useState<DashResponse | null>(null);

    useEffect(() => {
        request.post(Config.baseURL + "/api/dash/")
            .then(res => {
                const data = res.data as DashResponse;
                setDashData(data);
            })
            .catch(err => {
                console.error(err);
            });
    }, []);
    return (
        <>
            <Layout>
                {data ?
                    <>
                        <Head
                            paymentsThisMonth={data?.paymentsThisMonth}
                            billsThisMonth={data?.billsThisMonth}
                            totalPayments={data?.totalPayments}
                            totalBills={data?.totalBills}
                        />


                        <div className="grid grid-cols-2">
                            <div className="">
                                <div className="flex flex-col m-0">
                                    {/* Amount this month */}
                                    <div className="w-full p-2">
                                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                                            <div className="p-4 flex items-center">
                                                <div className="flex-1">
                                                    <h6 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2">
                                                        Users with Due
                                                    </h6>
                                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                            {data.usersWithDueCount ?? 0}
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

                                    <div className="w-full p-2">
                                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                                            <div className="p-4 flex items-center">
                                                <div className="flex-1">
                                                    <h6 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2">
                                                        Payments this year
                                                    </h6>
                                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                            {data.paymentsThisYear ?? 0}
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
                                    <div className="w-full  p-2">
                                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                                            <div className="p-4 flex items-center">
                                                <div className="flex-1">
                                                    <h6 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2">
                                                        Bills This Year
                                                    </h6>
                                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                            {data.billsThisYear ?? 0}
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
                            </div>
                            <DashboardCharts
                                billingData={data?.billingData}
                                paymentData={data?.paymentData}
                                dailyBillingData={data?.dailyBillingData}
                                dailyPaymentData={data?.dailyPaymentData}
                            />
                        </div>

                        <TabSection
                            users={data?.recentUsers}
                            payments={data?.recentPayments}
                        />
                    </> :
                    <PageLoader/>
                }
            </Layout>
        </>
    )
}


export const DashboardCharts: React.FC<ChartProps> = ({
                                                          billingData,
                                                          paymentData,
                                                          dailyBillingData,
                                                          dailyPaymentData
                                                      }) => {
    const monthlyLabels = Object.keys(billingData);
    // const monthlyLabels = Object.keys(billingData || {});

    const dailyLabels = Object.keys(dailyBillingData);
    // const dailyLabels = dailyBillingData.map((_, i) => `Day ${i + 1}`);


    const monthlyChartData = {
        labels: monthlyLabels,
        datasets: [
            {
                label: 'Billing',
                data: Object.values(billingData),
                backgroundColor: 'rgba(54, 162, 235, 0.6)'
            },
            {
                label: 'Payment',
                data: Object.values(paymentData),
                backgroundColor: 'rgba(75, 192, 192, 0.6)'
            }
        ]
    };

    const dailyChartData = {
        labels: dailyLabels,
        datasets: [
            {
                label: 'Daily Billing',
                data: Object.values(dailyBillingData),
                backgroundColor: 'rgba(255, 99, 132, 0.6)'
            },
            {
                label: 'Daily Payment',
                data: Object.values(dailyPaymentData),
                backgroundColor: 'rgba(153, 102, 255, 0.6)'
            }
        ]
    };

    return (
        <div className="grid grid-cols-1 gap-4">
            <div>
                <h3 className="mt-6 mb-6 font-semibold">Billing and payment per month</h3>
                <Bar id="monthlyChart" data={monthlyChartData}/>
            </div>
            <div>
                <h3 className="mt-6 mb-6 font-semibold">Billing and payment per day</h3>
                <Bar id="dailyChart" data={dailyChartData}/>
            </div>
        </div>
    );
};

const TabSection = ({users, payments}: {
    users: DashResponse["recentUsers"],
    payments: DashResponse["recentPayments"],
}) => {
    const [activeTab, setActiveTab] = useState("view-all");
    return (
        <>
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mt-6">
                <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                    {/* Tab 1 */}
                    <li className="me-2">
                        <button
                            onClick={() => setActiveTab("view-all")}
                            className={`inline-flex cursor-pointer items-center justify-center p-4 border-b-2 rounded-t-lg group ${
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
                            Recent Users
                        </button>
                    </li>

                    {/* Tab 2 */}
                    <li className="me-2">
                        <button
                            onClick={() => setActiveTab("others")}
                            className={`inline-flex cursor-pointer items-center justify-center p-4 border-b-2 rounded-t-lg group ${
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
                            Recent Payments
                        </button>
                    </li>
                    <li className="me-2">
                        <button
                            onClick={() => setActiveTab("r-tickets")}
                            className={`inline-flex cursor-pointer items-center justify-center p-4 border-b-2 rounded-t-lg group ${
                                activeTab === "r-tickets"
                                    ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                                    : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                            }`}
                        >
                            <svg
                                className={`w-4 h-4 mr-2 ${
                                    activeTab === "r-tickets"
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
                            Recent Tickets
                        </button>
                    </li>
                    <li className="me-2">
                        <button
                            onClick={() => setActiveTab("uwd")}
                            className={`inline-flex cursor-pointer items-center justify-center p-4 border-b-2 rounded-t-lg group ${
                                activeTab === "uwd"
                                    ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                                    : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                            }`}
                        >
                            <svg
                                className={`w-4 h-4 mr-2 ${
                                    activeTab === "uwd"
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
                            Users with due
                        </button>
                    </li>
                </ul>
            </div>

            {/* Content */}
            <div className="p-6">
                {activeTab === "view-all" && (
                    <div>
                        {
                            users.length > 0 ?


                                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                                    <table
                                        className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                        <thead
                                            className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th scope="col" className="p-4">
                                                <div className="flex items-center">
                                                    <input id="checkbox-all" type="checkbox"
                                                           className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                                    <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                                                </div>
                                            </th>
                                            <th scope="col" className="px-6 py-3">
                                                Name
                                            </th>
                                            <th scope="col" className="px-6 py-3">
                                                Email
                                            </th>
                                            <th scope="col" className="px-6 py-3">
                                                Due Amount
                                            </th>
                                            <th scope="col" className="px-6 py-3">
                                                Action
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            users.map((user, i) => (
                                                <tr key={i + user.username}
                                                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                    <td className="w-4 p-4">
                                                        <div className="flex items-center">
                                                            <input id="checkbox-table-1" type="checkbox"
                                                                   className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                                            <label htmlFor="checkbox-table-1"
                                                                   className="sr-only">checkbox</label>
                                                        </div>
                                                    </td>
                                                    <th scope="row"
                                                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                        {user.username}
                                                    </th>
                                                    <td className="px-6 py-4">
                                                        {user.email}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {user.due_amount}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <a href="#"
                                                           className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                        </tbody>
                                    </table>
                                </div>
                                : <EmptyList title={"No Recent Users!"}/>}

                    </div>
                )}
                {activeTab === "others" && (
                    <div>
                        {
                            payments.length > 0 ?


                                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                                    <table
                                        className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                        <thead
                                            className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th scope="col" className="p-4">
                                                <div className="flex items-center">
                                                    <input id="checkbox-all" type="checkbox"
                                                           className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                                    <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                                                </div>
                                            </th>
                                            <th scope="col" className="px-6 py-3">
                                                Invoice
                                            </th>
                                            <th scope="col" className="px-6 py-3">
                                                Package Price
                                            </th>
                                            <th scope="col" className="px-6 py-3">
                                                Payment Method
                                            </th>
                                            <th scope="col" className="px-6 py-3">
                                                Action
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            payments.map((pay, i) => (
                                                <tr key={i + pay.id}
                                                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                    <td className="w-4 p-4">
                                                        <div className="flex items-center">
                                                            <input id="checkbox-table-1" type="checkbox"
                                                                   className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                                            <label htmlFor="checkbox-table-1"
                                                                   className="sr-only">checkbox</label>
                                                        </div>
                                                    </td>
                                                    <th scope="row"
                                                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                        {pay.invoice}
                                                    </th>
                                                    <td className="px-6 py-4">
                                                        {pay.package_price}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {pay.payment_method}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <a href="#"
                                                           className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                        </tbody>
                                    </table>
                                </div>
                                :
                                <EmptyList title={"No payments made!"}/>
                        }
                    </div>
                )}
            </div>
        </>
    )
}