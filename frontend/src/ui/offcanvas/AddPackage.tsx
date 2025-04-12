import React, {FormEvent, useCallback, useEffect, useState} from "react";
import OffCanvas from "./OffCanvas.tsx";
import GIcon from "../components/Icons.tsx";
import request from "../../build/request.ts";
import Config from "../../assets/config.ts";
import {Inbox} from "lucide-react";
import {useNavigate} from "react-router-dom";

type PackageForm = {
    pkgName: string;
    pkgPrice: string;
    uploadSpeed: string;
    downloadSpeed: string;
    type: "hotspot" | "pppoe" | "data_plan";
    router: string;
};


export default function AddPackage() {
    // const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        uploadSpeed: "",
        downloadSpeed: ""
    });
    // const togglePassword = () => setShowPassword(!showPassword);
    const [form, setForm] = useState<PackageForm>({
        pkgName: "",
        pkgPrice: "",
        uploadSpeed: "",
        downloadSpeed: "",
        type: "hotspot",
        router: ""
    });
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const {name, value} = e.target;
        setForm((prev) => ({...prev, [name]: value}));
    };
    const validateSpeed = (value: string): boolean => {
        const regex = /^[0-9]+[MK]$/;
        return regex.test(value);
    };
    const onSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setErrors({
            uploadSpeed: "",
            downloadSpeed: "",
        });

        let valid = true;
        if (!validateSpeed(form.uploadSpeed)) {
            setErrors((prev) => ({
                ...prev,
                uploadSpeed: "Upload Speed must be a number followed by M (Mbps) or K (Kbps)."
            }));
            valid = false;
        }

        if (!validateSpeed(form.downloadSpeed)) {
            setErrors((prev) => ({
                ...prev,
                downloadSpeed: "Download Speed must be a number followed by M (Mbps) or K (Kbps)."
            }));
            valid = false;
        }

        if (!valid) return;
        try {
            setLoading(true)
            const formData = new FormData();
            formData.append("name", form.pkgName);
            formData.append("price", form.pkgPrice);
            formData.append("upload_speed", form.uploadSpeed);
            formData.append("download_speed", form.downloadSpeed);
            formData.append("type", form.type);
            formData.append("router", form.router);

            const response = await request.post(Config.baseURL + "/api/pkgs/create/", formData);
            setLoading(false)

            if (response.status === 201) {
                alert("Package added successfully!");
                setForm({
                    pkgName: "",
                    pkgPrice: "",
                    uploadSpeed: "",
                    downloadSpeed: "",
                    router: "",
                    type: "hotspot",
                });
            }
        } catch (error: unknown) {
            console.error("Error saving router:", error);
            alert("Failed to save router.");
            setLoading(false);
        }
    }, [form]);

    const [routers, setRouters] = useState<Mikrotik[]>([])

    useEffect(() => {
        const fd = new FormData();
        fd.append("load_type", "all")
        request.post(Config.baseURL + "/api/routers/", fd)
            .then(res => {
                const data = res.data as RoutersResponse;
                setRouters(data.routers);
            }).catch(err => {
            console.log(err);
        });
    }, []);

    const navigate = useNavigate();
    return (
        <>
            <OffCanvas
                id="drawer-add-package"
            >
                <div className="offcanvas-header border-bottom py-5 bg-surface-secondary">
                    <h3 className="text-lg font-semibold">Add Package Details</h3>
                    <button type="button" className="btn-close text-reset text-xs" data-bs-dismiss="offcanvas"
                            aria-label="Close"></button>
                </div>
                <div className="offcanvas-body vstack gap-5">
                    {routers.length > 0 ?
                        <div className="py-4">
                            <p className="text-sm text-gray-500">
                                Enter package information to register a new internet plan.
                            </p>
                            <form className="mt-4 space-y-4" onSubmit={onSubmit}>
                                {/* Router */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Select Mikrotik</label>
                                    <select
                                        name="router"
                                        value={form.router}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option selected>Select Router</option>
                                        {
                                            routers.map((r, i) => (
                                                <option key={i} value={r.id}>{r.name}</option>
                                            ))
                                        }
                                    </select>
                                </div>

                                {/* Package Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Package Name</label>
                                    <input
                                        name="pkgName"
                                        type="text"
                                        value={form.pkgName}
                                        onChange={handleChange}
                                        placeholder="e.g. Silver Plan"
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Price (KES)</label>
                                    <input
                                        name="pkgPrice"
                                        type="number"
                                        value={form.pkgPrice}
                                        onChange={handleChange}
                                        placeholder="e.g. 1200"
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Upload Speed */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Upload Speed</label>
                                    <input
                                        name="uploadSpeed"
                                        type="text"
                                        value={form.uploadSpeed}
                                        onChange={handleChange}
                                        placeholder="e.g. 5Mbps"
                                        className="mt-1 w-full   rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    {errors.uploadSpeed && <p className="text-red-500 text-xs">{errors.uploadSpeed}</p>}
                                </div>

                                {/* Download Speed */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Download Speed</label>
                                    <input
                                        name="downloadSpeed"
                                        type="text"
                                        value={form.downloadSpeed}
                                        onChange={handleChange}
                                        placeholder="e.g. 10Mbps"
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    {errors.downloadSpeed &&
                                        <p className="text-red-500 text-xs">{errors.downloadSpeed}</p>}
                                </div>

                                {/* Package Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Package Type</label>
                                    <select
                                        name="type"
                                        value={form.type}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="hotspot">Hotspot</option>
                                        <option value="pppoe">PPPoE</option>
                                        <option value="data_plan">Data Plan</option>
                                    </select>
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-between pt-2">
                                    <button
                                        type="submit"
                                        className="inline-flex gap-2 items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                    >
                                        Save
                                        {loading && <GIcon name={"g-loader"} color={"fill-amber-500"}/>}
                                    </button>
                                    <button
                                        data-bs-dismiss="offcanvas"
                                        type="button"
                                        className="inline-flex items-center rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-800 shadow hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                        :
                        <div className={"h-64 flex flex-col text-amber-600 items-center justify-center w-full h-full"}>
                            <Inbox size={64}/>
                            <p>Add Mikrotiks to start creating packages.</p>
                            <button
                                onClick={() => navigate("/mikrotiks")}
                                className={"px-4 py-1 rounded mt-5 text-white cursor-pointer bg-amber-300 hover:bg-amber-400"}
                            >
                                Create now
                            </button>
                        </div>}

                    {/*            <div className="py-4">*/}
                    {/*                <h3 className="text-xl font-semibold">Create User</h3>*/}
                    {/*                <p className="text-gray-500">Create a new user by filling out the form below.</p>*/}
                    {/*                <form className="mt-4 space-y-4">*/}
                    {/*                    /!* Type *!/*/}
                    {/*                    <div>*/}
                    {/*                        <label className="block text-sm font-medium text-gray-700">*/}
                    {/*                            Type <span className="text-red-600">*</span>*/}
                    {/*                        </label>*/}
                    {/*                        <select*/}
                    {/*                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200">*/}
                    {/*                            <option value="">Select an option</option>*/}
                    {/*                            <option>PPOE</option>*/}
                    {/*                            <option>Hotspot</option>*/}
                    {/*                        </select>*/}
                    {/*                    </div>*/}

                    {/*                    /!* First Name *!/*/}
                    {/*                    <div>*/}
                    {/*                        <label className="block text-sm font-medium text-gray-700">First Name</label>*/}
                    {/*                        <input*/}
                    {/*                            type="text"*/}
                    {/*                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"*/}
                    {/*                            placeholder="First name"*/}
                    {/*                        />*/}
                    {/*                    </div>*/}

                    {/*                    /!* Last Name *!/*/}
                    {/*                    <div>*/}
                    {/*                        <label className="block text-sm font-medium text-gray-700">Last Name</label>*/}
                    {/*                        <input*/}
                    {/*                            type="text"*/}
                    {/*                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"*/}
                    {/*                            placeholder="Last name"*/}
                    {/*                        />*/}
                    {/*                    </div>*/}

                    {/*                    /!* Username *!/*/}
                    {/*                    <div>*/}
                    {/*                        <label className="block text-sm font-medium text-gray-700">*/}
                    {/*                            Username <span className="text-red-600">*</span>*/}
                    {/*                        </label>*/}
                    {/*                        <input*/}
                    {/*                            type="text"*/}
                    {/*                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"*/}
                    {/*                            placeholder="Username"*/}
                    {/*                        />*/}
                    {/*                    </div>*/}

                    {/*                    /!* Password *!/*/}
                    {/*                    <div>*/}
                    {/*                        <label className="block text-sm font-medium text-gray-700">*/}
                    {/*                            Password <span className="text-red-600">*</span>*/}
                    {/*                        </label>*/}
                    {/*                        <div className="flex rounded-md shadow-sm mt-1">*/}
                    {/*                            <input*/}
                    {/*                                type={showPassword ? 'text' : 'password'}*/}
                    {/*                                className="flex-1 block w-full rounded-l-md border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"*/}
                    {/*                                placeholder="Enter password"*/}
                    {/*                            />*/}
                    {/*                            <button*/}
                    {/*                                type="button"*/}
                    {/*                                onClick={togglePassword}*/}
                    {/*                                className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm text-gray-700 hover:bg-gray-200"*/}
                    {/*                            >*/}
                    {/*                                {showPassword ? 'Hide' : 'Show'}*/}
                    {/*                            </button>*/}
                    {/*                        </div>*/}
                    {/*                    </div>*/}

                    {/*                    /!* Package *!/*/}
                    {/*                    <div>*/}
                    {/*                        <label className="block text-sm font-medium text-gray-700">*/}
                    {/*                            Package <span className="text-red-600">*</span>*/}
                    {/*                        </label>*/}
                    {/*                        <div className="flex items-center gap-2 mt-1">*/}
                    {/*                            <select*/}
                    {/*                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200">*/}
                    {/*                                <option value="">Select an option</option>*/}
                    {/*                                <option>Basic</option>*/}
                    {/*                                <option>Premium</option>*/}
                    {/*                            </select>*/}
                    {/*                            <button*/}
                    {/*                                type="button"*/}
                    {/*                                className="p-2 rounded-md border border-gray-300 hover:bg-gray-100"*/}
                    {/*                            >*/}
                    {/*                                <i className="bi bi-plus-lg"></i>*/}
                    {/*                            </button>*/}
                    {/*                        </div>*/}
                    {/*                        <small className="text-gray-500 block mt-1">*/}
                    {/*                            If the package is not available, create a new one by clicking the plus icon*/}
                    {/*                        </small>*/}
                    {/*                    </div>*/}

                    {/*                    /!* Expiry Date *!/*/}
                    {/*                    <div>*/}
                    {/*                        <label className="block text-sm font-medium text-gray-700">Expiry Date</label>*/}
                    {/*                        <div className="flex items-center rounded-md shadow-sm mt-1">*/}
                    {/*<span*/}
                    {/*    className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">*/}
                    {/*  <i className="bi bi-calendar"></i>*/}
                    {/*</span>*/}
                    {/*                            <input*/}
                    {/*                                type="text"*/}
                    {/*                                className="flex-1 block w-full rounded-r-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"*/}
                    {/*                                placeholder="mm/dd/yyyy, --:--:-- --"*/}
                    {/*                            />*/}
                    {/*                        </div>*/}
                    {/*                        <small className="text-gray-500 block mt-1">*/}
                    {/*                            The date the package for this user will expire*/}
                    {/*                        </small>*/}
                    {/*                    </div>*/}

                    {/*                    /!* Phone Number *!/*/}
                    {/*                    <div>*/}
                    {/*                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>*/}
                    {/*                        <input*/}
                    {/*                            type="text"*/}
                    {/*                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"*/}
                    {/*                            placeholder="e.g. +254712345678"*/}
                    {/*                        />*/}
                    {/*                    </div>*/}

                    {/*                    /!* Email *!/*/}
                    {/*                    <div>*/}
                    {/*                        <label className="block text-sm font-medium text-gray-700">Email Address</label>*/}
                    {/*                        <input*/}
                    {/*                            type="email"*/}
                    {/*                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"*/}
                    {/*                            placeholder="you@example.com"*/}
                    {/*                        />*/}
                    {/*                    </div>*/}

                    {/*                    /!* Address *!/*/}
                    {/*                    <div>*/}
                    {/*                        <label className="block text-sm font-medium text-gray-700">Address</label>*/}
                    {/*                        <input*/}
                    {/*                            type="text"*/}
                    {/*                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"*/}
                    {/*                            placeholder="123 Main St, City, Country"*/}
                    {/*                        />*/}
                    {/*                    </div>*/}

                    {/*                    /!* Comment *!/*/}
                    {/*                    <div>*/}
                    {/*                        <label className="block text-sm font-medium text-gray-700">Comment</label>*/}
                    {/*                        <textarea*/}
                    {/*                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"*/}
                    {/*                            placeholder="Optional comment"*/}
                    {/*                        />*/}
                    {/*                    </div>*/}

                    {/*                    /!* Buttons *!/*/}
                    {/*                    <div className="flex justify-between pt-4">*/}
                    {/*                        <button*/}
                    {/*                            type="submit"*/}
                    {/*                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"*/}
                    {/*                        >*/}
                    {/*                            Create User*/}
                    {/*                        </button>*/}
                    {/*                        <button*/}
                    {/*                            type="button"*/}
                    {/*                            data-bs-dismiss="offcanvas"*/}
                    {/*                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"*/}
                    {/*                        >*/}
                    {/*                            Cancel*/}
                    {/*                        </button>*/}
                    {/*                    </div>*/}
                    {/*                </form>*/}
                    {/*            </div>*/}
                </div>
            </OffCanvas>

        </>
    )
}