import "./DashBoard.css"
import "./utilities.css"
import "./main.scss"

import SideBar from "./SideBar.tsx";

export default function Layout({children}: {
    children: React.ReactNode
}) {
    return (
        <>
            <div className="d-flex flex-column flex-lg-row h-lg-full bg-surface-secondary">
                <SideBar/>
                <div className="vstack m-0 flex-grow-1">
                    <main className="py-6 bg-surface-secondary">
                        <div className="vstack">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </>
    )
}