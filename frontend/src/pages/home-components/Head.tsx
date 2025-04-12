export default function Head() {
    return (
        <>
            <header className={"w-full"}>
                <div className="container-fluid w-full">
                    <div className="border-bottom pt-6">
                        <div className="row align-items-center">
                            <div className="col-sm col-12"><h1 className="h2 ls-tight"><span
                                className="d-inline-block me-3">👋</span>Hi, Tahlia!</h1></div>
                            <div className="col-sm-auto col-12 mt-4 mt-sm-0">
                                <div className="hstack gap-2 justify-content-sm-end"><a href="#modalExport"
                                                                                        className="btn btn-sm btn-neutral border-base"
                                                                                        data-bs-toggle="modal"><span
                                    className="pe-2"><i className="bi bi-people-fill"></i> </span><span>Share</span>
                                </a><a href="#offcanvasCreate" className="btn btn-sm btn-primary"
                                       data-bs-toggle="offcanvas"><span className="pe-2"><i
                                    className="bi bi-plus-square-dotted"></i> </span><span>Create</span></a></div>
                            </div>
                        </div>
                        <ul className="nav nav-tabs overflow-x border-0">
                            <li className="nav-item"><a href="#" className="nav-link active">View all</a></li>
                            <li className="nav-item"><a href="#" className="nav-link">Most recent</a></li>
                            <li className="nav-item"><a href="#" className="nav-link">Popular</a></li>
                        </ul>
                    </div>
                </div>
            </header>
        </>
    )
}