// import "./DashBoard.css"
// import "./utilities.css"
import "./main.scss"
import SideBar from "./SideBar.tsx";
import Header from "./Header.tsx";
import React from "react";

export default function Layout({children}: {
    children: React.ReactNode
}) {
    return (
        <div className={"bg-[#f5f9fc] min-h-screen"}>
            <Header/>
            <SideBar/>
            <div className="p-4 sm:ml-74">
                <div className="p-4 border-2 border-gray-200 bg-white dark:bg-gray-700 border-dashed rounded-lg dark:border-gray-700 mt-14">
                    {children}
                </div>
            </div>
        </div>
    )
}