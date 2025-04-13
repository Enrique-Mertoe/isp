import {FormEvent, useCallback, useState} from "react";
import OffCanvas from "./OffCanvas";
import request from "../../build/request.ts";
import Config from "../../assets/config.ts";
import GIcon from "../components/Icons.tsx";

export default function AddUser() {
    const [showPassword, setShowPassword] = useState(true);
    const [loading, setLoading] = useState(false);
    const onSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setLoading(true)
            const formData = new FormData(e.target as HTMLFormElement);

            const response = await request.post(Config.baseURL + "/api/user/create/", formData);
            setLoading(false)
            if (response.status === 201) {
                alert("Package added successfully!");
            }
        } catch (error: unknown) {
            console.error("Error saving router:", error);
            alert("Failed to save router.");
            setLoading(false);
        }
    }, []);
    const togglePassword = () => setShowPassword(!showPassword);
    return (
        <>
            <OffCanvas
                id="drawer-add-package"
            >
                <div className="offcanvas-header border-bottom py-5 bg-surface-secondary">
                    <h3 className="text-xl font-semibold">Create User</h3>
                    <button type="button" className="btn-close text-reset text-xs" data-bs-dismiss="offcanvas"
                            aria-label="Close"></button>
                </div>
                <div className="offcanvas-body vstack gap-5">
                    <div className="pb-4">
                        <p className="text-gray-500">Create a new user by filling out the form below.</p>
                        <form className="mt-4 space-y-4"
                              onSubmit={onSubmit}
                        >
                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Type <span className="text-red-600">*</span>
                                </label>
                                <select
                                    name={"user_type"}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200">
                                    <option value="">Select an option</option>
                                    <option>PPOE</option>
                                    <option>Hotspot</option>
                                </select>
                            </div>

                            {/* First Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    name={"first_name"}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                                    placeholder="First name"
                                />
                            </div>

                            {/* Last Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input
                                    name={"last_name"}
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                                    placeholder="Last name"
                                />
                            </div>

                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Username <span className="text-red-600">*</span>
                                </label>
                                <input
                                    name={"username"}
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                                    placeholder="Username"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Password <span className="text-red-600">*</span>
                                </label>
                                <div className="flex rounded-md shadow-sm mt-1">
                                    <input
                                        name={"password"}
                                        type={showPassword ? 'text' : 'password'}
                                        className="flex-1 block w-full rounded-l-md border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                                        placeholder="Enter password"
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePassword}
                                        className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm text-gray-700 hover:bg-gray-200"
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            {/* Package */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Package <span className="text-red-600">*</span>
                                </label>
                                <div className="flex items-center gap-2 mt-1">
                                    <select
                                        name={"package"}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200">
                                        <option value="">Select an option</option>
                                        <option>Basic</option>
                                        <option>Premium</option>
                                    </select>
                                    <button
                                        type="button"
                                        className="p-2 rounded-md border border-gray-300 hover:bg-gray-100"
                                    >
                                        <i className="bi bi-plus-lg"></i>
                                    </button>
                                </div>
                                <small className="text-gray-500 block mt-1">
                                    If the package is not available, create a new one by clicking the plus icon
                                </small>
                            </div>

                            {/* Expiry Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                                <div className="flex items-center rounded-md shadow-sm mt-1">
                    <span
                        className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      <i className="bi bi-calendar"></i>
                    </span>
                                    <input
                                        name={"expiry-date"}
                                        type="date"
                                        className="flex-1 block w-full rounded-r-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                                        placeholder="mm/dd/yyyy, --:--:-- --"
                                    />
                                </div>
                                <small className="text-gray-500 block mt-1">
                                    The date the package for this user will expire
                                </small>
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input
                                    type="text"
                                    name={"phone"}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                                    placeholder="e.g. +254712345678"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input
                                    type="email"
                                    name={"email"}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                                    placeholder="you@example.com"
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <input
                                    name={"address"}
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                                    placeholder="123 Main St, City, Country"
                                />
                            </div>

                            {/* Comment */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Comment</label>
                                <textarea
                                    name={"comment"}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                                    placeholder="Optional comment"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-between pt-4">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Create User
                                    {loading && <GIcon name={"g-loader"} color={"fill-amber-500"}/>}
                                </button>
                                <button
                                    type="button"
                                    data-bs-dismiss="offcanvas"
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </OffCanvas>
        </>
    )
}