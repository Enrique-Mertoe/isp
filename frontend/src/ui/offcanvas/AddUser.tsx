import {useState} from "react";

export default function AddUser() {
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => setShowPassword(!showPassword);
    return (
        <>
            <div className="offcanvas offcanvas-end w-full w-lg-1/3" data-bs-scroll="true" data-bs-backdrop="true"
                 id="offcanvasAddUser" aria-labelledby="offcanvasCreateLabel" aria-modal="true"
                 role="dialog">
                <div className="offcanvas-header border-bottom py-5 bg-surface-secondary"><h5
                    className="offcanvas-title" id="offcanvasCreateLabel">Create a new project</h5>
                    <button type="button" className="btn-close text-reset text-xs" data-bs-dismiss="offcanvas"
                            aria-label="Close"></button>
                </div>
                <div className="offcanvas-body vstack gap-5">
                    <div className="py-4">
                        <h3>Create User</h3>
                        <p className="text-muted">Create a new user by filling out the form below.</p>
                        <form>
                            {/* Type */}
                            <div className="mb-3">
                                <label className="form-label">Type <span className="text-danger">*</span></label>
                                <select className="form-select">
                                    <option value="">Select an option</option>
                                    <option>PPOE</option>
                                    <option>Hotspot</option>
                                </select>
                            </div>

                            {/* First Name */}
                            <div className="mb-3">
                                <label className="form-label">First Name</label>
                                <input type="text" className="form-control" placeholder="First name"/>
                            </div>

                            {/* Last Name */}
                            <div className="mb-3">
                                <label className="form-label">Last Name</label>
                                <input type="text" className="form-control" placeholder="Last name"/>
                            </div>

                            {/* Username */}
                            <div className="mb-3">
                                <label className="form-label">Username <span className="text-danger">*</span></label>
                                <input type="text" className="form-control" placeholder="Username"/>
                            </div>

                            {/* Password */}
                            <div className="mb-3">
                                <label className="form-label">Password <span className="text-danger">*</span></label>
                                <div className="input-group">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-control"
                                        placeholder="Enter password"
                                    />
                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        onClick={togglePassword}
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            {/* Package */}
                            <div className="mb-3">
                                <label className="form-label">Package <span className="text-danger">*</span></label>
                                <div className="d-flex align-items-center gap-2">
                                    <select className="form-select">
                                        <option value="">Select an option</option>
                                        <option>Basic</option>
                                        <option>Premium</option>
                                    </select>
                                    <button type="button" className="btn btn-outline-secondary">
                                        <i className="bi bi-plus-lg me-1"></i>
                                    </button>
                                </div>
                                <small className="text-muted d-block mt-1">
                                    If the package is not available, create a new one by clicking the plus icon
                                </small>
                            </div>

                            {/* Expiry Date */}
                            <div className="mb-3">
                                <label className="form-label">Expiry Date</label>
                                <div className="input-group">
                                    <span className="input-group-text"><i className="bi bi-calendar"></i></span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="mm/dd/yyyy, --:--:-- --"
                                    />
                                </div>
                                <small className="text-muted d-block mt-1">
                                    The date the package for this user will expire
                                </small>
                            </div>

                            {/* Phone Number */}
                            <div className="mb-3">
                                <label className="form-label">Phone Number</label>
                                <input type="text" className="form-control" placeholder="e.g. +254712345678"/>
                            </div>

                            {/* Email */}
                            <div className="mb-3">
                                <label className="form-label">Email Address</label>
                                <input type="email" className="form-control" placeholder="you@example.com"/>
                            </div>

                            {/* Address */}
                            <div className="mb-3">
                                <label className="form-label">Address</label>
                                <input type="text" className="form-control" placeholder="123 Main St, City, Country"/>
                            </div>

                            {/* Comment */}
                            <div className="mb-3">
                                <label className="form-label">Comment</label>
                                <textarea className="form-control" placeholder="Optional comment"/>
                            </div>

                            {/* Buttons */}
                            <div className="d-flex justify-content-between">
                                <button type="submit" className="btn btn-primary">Create User</button>
                                <button type="button" data-bs-dismiss={"offcanvas"} className="btn btn-secondary">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="modal-footer py-2 bg-surface-secondary">
                    <button type="button" className="btn btn-sm btn-neutral" data-bs-dismiss="offcanvas">Close</button>
                    <button type="button" className="btn btn-sm btn-primary">Save</button>
                </div>
            </div>
        </>
    )
}