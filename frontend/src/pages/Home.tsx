import Layout from "./home-components/Layout.tsx";
import Head from "./home-components/Head.tsx";

export default function HomePage() {
    return (
        <>
            <Layout>
                <Head/>
                <div className="row m-0">
                    {/* Amount this month */}
                    <div className="col-xl col-md-6 col-12">
                        <div className="card">
                            <div className="card-body p-0">
                                <div className="align-items-center row">
                                    <div className="col">
                                        <h6 className="text-uppercase text-body-secondary mb-2">Amount This
                                            Month</h6>
                                        <span className="h2 mb-0">Ksh 0</span>
                                    </div>
                                    <div className="col-auto">
                                        <svg width="25" height="25"
                                             className="stroke-1 fi-wi-stats-overview-stat-icon text-gray-400 dark:text-gray-500"
                                             xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"
                                             fill="currentColor">
                                            <path
                                                d="M224.56,103.81C213.43,97.75,198.47,93.39,182,91.34V84c0-12.12-9.58-23.1-27-30.93C139.16,45.93,118.2,42,96,42S52.84,45.93,37,53.07C19.58,60.9,10,71.88,10,84v40c0,12.12,9.58,23.1,27,30.93,10.49,4.72,23.21,8,37,9.73V172c0,12.12,9.58,23.1,27,30.93C116.84,210.07,137.8,214,160,214s43.16-3.93,59-11.07c17.39-7.83,27-18.81,27-30.93V132C246,121.35,238.39,111.34,224.56,103.81Zm-5.74,10.54C228.61,119.68,234,126,234,132c0,14.19-30.39,30-74,30a166.9,166.9,0,0,1-21.21-1.34A110.79,110.79,0,0,0,155,154.93c17.39-7.83,27-18.81,27-30.93V103.43C196.4,105.36,209.3,109.16,218.82,114.35ZM108.16,153.58c-3.92.27-8,.42-12.16.42-5.3,0-10.4-.24-15.28-.67a2.22,2.22,0,0,0-.37,0c-3.58-.33-7-.77-10.35-1.3V124.12A178,178,0,0,0,96,126a178,178,0,0,0,26-1.88V152c-4.34.69-8.91,1.22-13.69,1.56ZM170,105.89V124c0,9.54-13.75,19.8-36,25.51V121.85a115,115,0,0,0,21-6.92A66.2,66.2,0,0,0,170,105.89ZM96,54c43.61,0,74,15.81,74,30s-30.39,30-74,30S22,98.19,22,84,52.39,54,96,54ZM22,124V105.89a66.2,66.2,0,0,0,15,9,115,115,0,0,0,21,6.92v27.66C35.75,143.8,22,133.54,22,124Zm64,48v-6.28c3.3.18,6.63.28,10,.28q5.91,0,11.66-.37A123.17,123.17,0,0,0,122,169.84v27.67C99.75,191.8,86,181.54,86,172Zm48,28V172.1a177.84,177.84,0,0,0,26,1.9,178,178,0,0,0,26-1.88V200a170,170,0,0,1-52,0Zm64-2.49V169.85a115,115,0,0,0,21-6.92,66.2,66.2,0,0,0,15-9V172C234,181.54,220.25,191.8,198,197.51Z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SMS balance */}
                    <div className="col-xl col-md-6 col-12">
                        <div className="card">
                            <div className="card-body p-0">
                                <div className="align-items-center row">
                                    <div className="col">
                                        <h6 className="text-uppercase text-body-secondary mb-2">SMS Balance</h6>
                                        <span className="h2 mb-0">Ksh 1.60</span>
                                    </div>
                                    <div className="col-auto">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                             stroke-linejoin="round"
                                             className="feather feather-message-square text-body-secondary">
                                            <g>
                                                <path
                                                    d="M21 12.5a2.5 2.5 0 0 0-5 0V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v5.5a2.5 2.5 0 0 0 5 0V6a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v13a4 4 0 0 0 4 4h11a4 4 0 0 0 4-4v-6.5z"></path>
                                            </g>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Total clients */}
                    <div className="col-xl col-md-6 col-12">
                        <div className="card">
                            <div className="card-body p-0">
                                <div className="align-items-center row">
                                    <div className="col">
                                        <h6 className="text-uppercase text-body-secondary mb-2">Total
                                            Clients</h6>
                                        <span className="h2 mb-0">0</span>
                                    </div>
                                    <div className="col-auto">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                             stroke-linejoin="round"
                                             className="feather feather-users text-body-secondary">
                                            <g>
                                                <path
                                                    d="M16 14c2 0 3-1 3-3s-1-3-3-3-3 1-3 3 1 3 3 3zM8 14c2 0 3-1 3-3s-1-3-3-3-3 1-3 3 1 3 3 3zM4 16c0-1 1-3 3-3h10c2 0 3 1 3 3v2h-16v-2z"></path>
                                            </g>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    )
}