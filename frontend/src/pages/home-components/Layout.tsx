// import "./DashBoard.css"
// import "./utilities.css"
import "./main.scss"
import SideBar from "./SideBar.tsx";
import Header from "./Header.tsx";
import React, {useEffect} from "react";
import request from "../../build/request.ts";
import Config from "../../assets/config.ts";
import {useApp} from "../../ui/AppContext.tsx";

type StartResponse = {
    users: number;
    packages: number;
    routers: number;
    user: UserInfo
}
export default function Layout({children}: {
    children: React.ReactNode
}) {
    const {setCount, currentUser} = useApp()
    useEffect(() => {
        request.post(Config.baseURL + "/api/start-up/")
            .then(res => {
                const data = res.data as StartResponse;
                setCount("users", data.users)
                setCount("package", data.packages)
                setCount("router", data.routers)
                currentUser(data.user)
            }).catch(err => {
            console.log(err);
        });
    }, []);
    return (
        <div className={"bg-[#f5f9fc] dark:bg-[#081324] min-h-screen"}>
            <Header/>
            <SideBar/>
            <div className="p-1 md:ml-74">
                <div
                    className="p-2 border-2 border-gray-200 bg-white dark:bg-gray-700 border-dashed rounded-lg dark:border-gray-700 mt-14">
                    {children}
                </div>
            </div>
        </div>
    )
}