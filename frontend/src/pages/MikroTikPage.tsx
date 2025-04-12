import Layout from "./home-components/Layout.tsx";
import AddUser from "../ui/offcanvas/AddUser.tsx";
import GIcon from "../ui/components/Icons.tsx";
import {useEffect} from "react";
import request from "../build/request.ts";
import Config from "../assets/config.ts";

export default function MikroTikPage() {
    function loadRouter() {
       request.post(
            Config.baseURL + "/api/routers/"
        ).then(res=>{
           console.log(res.data)
       })
    }

    useEffect(() => {
        loadRouter()
    }, []);
    return (
        <Layout>
            <div className="card p-0 mx-1">
                <div className="card-header hstack border-bottom">
                    <div className="vstack gap-2">
                        <h3 className="mb-0 text-amber-600">Mikrotik Devices
                        </h3>
                        <p>List of Mikrotik devices</p>
                    </div>
                    <div className="col-sm-auto col-12 mt-4 mt-sm-0">
                        <div className="hstack gap-2 justify-content-sm-end">
                            <a
                                href="#offcanvasPackage" className="btn btn-sm btn-primary"
                                data-bs-toggle="offcanvas"><span
                                className="pe-2"><i
                                className="bi bi-plus-square-dotted"></i> </span><span>Link a Microtik</span></a>

                            <AddUser/>
                        </div>
                    </div>
                </div>
                <ul className="nav nav-tabs overflow-x px-10 border-0">
                    <li className="nav-item"><a href="#" className="nav-link active">
                        <span className="hstack gap-2">
                            <span>All</span>

                        <span className="px-1  aspect-square s bg-amber-400 text-white rounded">
                        0
                        </span>
                        </span>
                    </a></li>
                    <li className="nav-item"><a href="#" className="nav-link hstack gap-2 ">Online

                        <span className="w-5 p-1 h-5  aspect-square ms-2 bg-amber-400 text-white rounded">
                        0</span>
                    </a></li>
                    <li className="nav-item"><a href="#" className="nav-link hstack gap-2 ">Offline

                        <span className="w-5 p-1 h-5  aspect-square ms-2 bg-amber-400 text-white rounded">
                        0</span>
                    </a></li>
                </ul>
                <div className="py-7 h-96 justify-center items-center vstack">
                    <GIcon name={"g-loader"} color={"fill-amber-500|fill-gray-800"} size={64}/>
                </div>
                <div className="table-responsive d-none">
                    <table className="table table-hover table-nowrap">
                        <thead className="table-light">
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Due Date</th>
                            <th scope="col">Status</th>
                            <th scope="col">Team</th>
                            <th scope="col">Completion</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td><img alt="..." src="/img/social/airbnb.svg"
                                     className="avatar avatar-sm rounded-circle me-2"/> <a
                                className="text-heading font-semibold" href="#">Website Redesign</a></td>
                            <td>23-01-2022</td>
                            <td><span className="badge badge-lg badge-dot"><i
                                className="bg-warning"></i>In progress</span></td>
                            <td>
                                <div className="avatar-group"><a href="#"
                                                                 className="avatar avatar-xs rounded-circle text-white border border-1 border-solid border-card"><img
                                    alt="..." src="/img/people/img-1.jpg"/> </a><a href="#"
                                                                                   className="avatar avatar-xs rounded-circle text-white border border-1 border-solid border-card"><img
                                    alt="..." src="/img/people/img-3.jpg"/> </a><a href="#"
                                                                                   className="avatar avatar-xs rounded-circle text-white border border-1 border-solid border-card"><img
                                    alt="..." src="/img/people/img-4.jpg"/></a></div>
                            </td>
                            <td>
                                <div className="d-flex align-items-center"><span className="me-2">38%</span>
                                    <div>
                                        <div className="progress">
                                            <div className="progress-bar bg-warning"
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="text-end"><a href="#" className="btn btn-sm btn-neutral">View</a>
                                <button type="button" className="btn btn-sm btn-square btn-neutral text-danger-hover"><i
                                    className="bi bi-trash"></i></button>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    )
}