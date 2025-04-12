import clp from "../../assets/logo.png";
import imgp from "../../assets/dash/img-profile.jpg";
import {useNavigate} from "react-router-dom";

export default function SideBar() {
    const navigate = useNavigate();
    return (
        <nav
            className="navbar show navbar-vertical h-lg-screen navbar-expand-lg px-0 py-3 navbar-light bg-white border-bottom border-bottom-lg-0 border-end-lg scrollbar"
            id="sidebar">
            <div className="container-fluid h-full">
                <button className="navbar-toggler ms-n2 collapsed" type="button" data-bs-toggle="collapse"
                        data-bs-target="#sidebarCollapse" aria-controls="sidebarCollapse" aria-expanded="false"
                        aria-label="Toggle navigation"><span className="navbar-toggler-icon"></span></button>
                <a className="navbar-brand hstack gap-2 py-lg-2 mb-lg-5 px-lg-6 me-0"
                   href="/"><img
                    src={clp} alt="..."/>
                    <span className="fw-bold">
                                LomTechnology
                           </span>
                </a>
                <div className="navbar-user d-lg-none">
                    <div className="dropdown"><a href="https://clever.webpixels.io/#" id="sidebarAvatar"
                                                 role="button" data-bs-toggle="dropdown" aria-haspopup="true"
                                                 aria-expanded="false">
                        <div className="avatar-parent-child"><img alt="..."
                                                                  src={imgp}
                                                                  className="avatar avatar- rounded-circle"/>
                            <span className="avatar-child avatar-badge bg-success"></span></div>
                    </a>
                        <div className="dropdown-menu dropdown-menu-end" aria-labelledby="sidebarAvatar"><a
                            href="https://clever.webpixels.io/#" className="dropdown-item">Profile</a> <a
                            href="https://clever.webpixels.io/#" className="dropdown-item">Settings</a> <a
                            href="https://clever.webpixels.io/#" className="dropdown-item">Billing</a>
                            <hr className="dropdown-divider"/>
                            <a href="https://clever.webpixels.io/#" className="dropdown-item">Logout</a></div>
                    </div>
                </div>
                <div className="navbar-collapse flex-1 overflow-y-auto" id="sidebarCollapse">
                    <ul className="navbar-nav">
                        {/* Dashboard */}
                        <li className="nav-item">
                            <a className="nav-link"
                               onClick={e => {
                                   e.preventDefault()
                                   navigate('/');
                               }}
                               href="/">
                                <i className="bi bi-speedometer2"></i> Dashboard
                            </a>
                        </li>

                        {/* Users */}
                        <li className="nav-item">
                            <a className="nav-link" href="/users"
                               onClick={e => {
                                   e.preventDefault()
                                   navigate('/users');
                               }}
                            >
                                <i className="bi bi-people"></i> Users
                                <span
                                    className="ms-auto h-6 flex justify-center items-center aspect-square text-white rounded bg-amber-200">0</span>
                            </a>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link" href="#">
                                <i className="bi bi-person-check"></i> Active Users
                                <span
                                    className="ms-auto h-6 flex justify-center items-center aspect-square text-white rounded bg-amber-200">0</span>
                            </a>
                        </li>

                        <hr/>

                        {/* Tickets */}
                        <li className="nav-item">
                            <a className="nav-link" href="#">
                                <i className="bi bi-ticket"></i> Tickets
                                <span
                                    className="ms-auto h-6 flex justify-center items-center aspect-square text-white rounded bg-amber-200">0</span>
                            </a>
                        </li>

                        {/* Leads */}
                        <li className="nav-item">
                            <a className="nav-link" href="#">
                                <i className="bi bi-lightbulb"></i> Leads
                                <span
                                    className="ms-auto h-6 flex justify-center items-center aspect-square text-white rounded bg-amber-200">0</span>
                            </a>
                        </li>

                        <hr/>

                        {/* Finance */}
                        <li className="nav-item">
                            <a className="nav-link"
                               onClick={e => {
                                   e.preventDefault()
                                   navigate('/packages');
                               }}
                               href="/packages">
                                <i className="bi bi-cash-coin"></i> Packages
                                <span
                                    className="ms-auto h-6 flex justify-center items-center aspect-square text-white rounded bg-amber-200">0</span>
                            </a>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link" href="#">
                                <i className="bi bi-credit-card-2-front"></i> Payments
                            </a>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link" href="#">
                                <i className="bi bi-ticket-perforated"></i> Vouchers
                                <span
                                    className="ms-auto h-6 flex justify-center items-center aspect-square text-white rounded bg-amber-200">0</span>
                            </a>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link" href="#">
                                <i className="bi bi-receipt-cutoff"></i> Expenses
                            </a>
                        </li>

                        <hr/>

                        {/* Communication */}
                        <li className="nav-item">
                            <a className="nav-link" href="#">
                                <i className="bi bi-megaphone"></i> Campaigns
                                <span
                                    className="ms-auto h-6 flex justify-center items-center aspect-square text-white rounded bg-amber-200">0</span>
                            </a>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link" href="#">
                                <i className="bi bi-chat-dots"></i> SMS
                            </a>
                        </li>

                        <hr/>

                        {/* Devices */}
                        <li className="nav-item">
                            <a className="nav-link" href="/mikrotiks"
                             onClick={e => {
                                   e.preventDefault()
                                   navigate('/mikrotiks');
                               }}
                            >
                                <i className="bi bi-router"></i> Mikrotiks
                                <span
                                    className="ms-auto h-6 flex justify-center items-center aspect-square text-white rounded bg-amber-200">1</span>
                            </a>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link" href="#">
                                <i className="bi bi-hdd-rack"></i> Equipment
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="my-4 px-lg-6 position-relative">
                    <div className="dropup w-full">
                        <button
                            className="btn-primary d-flex w-full py-3 ps-3 pe-4 align-items-center shadow shadow-3-hover rounded-3"
                            type="button" data-bs-toggle="dropdown" aria-expanded="false"><span
                            className="me-3"><img alt="..."
                                                  src="/assets//img-profile.jpg"
                                                  className="avatar avatar-sm rounded-circle"/> </span><span
                            className="flex-fill text-start text-sm font-semibold">Tahlia Mooney </span><span><i
                            className="bi bi-chevron-expand text-white text-opacity-70"></i></span></button>
                        <div className="dropdown-menu dropdown-menu-end w-full">
                            <div className="dropdown-header"><span
                                className="d-block text-sm text-muted mb-1">Signed in as</span> <span
                                className="d-block text-heading font-semibold">Tahlia Mooney</span></div>
                            <div className="dropdown-divider"></div>
                            <a className="dropdown-item" href="https://clever.webpixels.io/#"><i
                                className="bi bi-house me-3"></i>Home </a><a className="dropdown-item"
                                                                             href="https://clever.webpixels.io/#"><i
                            className="bi bi-pencil me-3"></i>Profile </a><a className="dropdown-item"
                                                                             href="https://clever.webpixels.io/#"><i
                            className="bi bi-gear me-3"></i>Settings</a>
                            <div className="dropdown-divider"></div>
                            <a className="dropdown-item" href="https://clever.webpixels.io/#"><i
                                className="bi bi-box-arrow-left me-3"></i>Logout</a></div>
                    </div>
                    <div className="d-flex gap-3 justify-content-center align-items-center mt-6 d-none">
                        <div><i className="bi bi-moon-stars me-2 text-warning me-2"></i> <span
                            className="text-heading text-sm font-bold">Dark mode</span></div>
                        <div className="ms-auto">
                            <div className="form-check form-switch me-n2"><input
                                className="form-check-input" type="checkbox" id="switch-dark-mode"/></div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}