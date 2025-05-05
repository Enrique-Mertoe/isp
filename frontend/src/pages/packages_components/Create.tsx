import {useState, useEffect} from 'react';
import {
    Check,
    ChevronsUpDown,
    X,
    Package as Pkg,
    Router,
    Wifi,
    Zap,
    Calendar,
    Server,
    ArrowRight,
    Loader2, HardDriveUpload, HardDriveDownload
} from 'lucide-react';
import Config from "../../assets/config.ts";
import {NewPackage, Router as Rter, Package} from "./types.pkg.ts";

export interface CreateHandler {
    onDismiss: Closure;
    routers: Rter[],
}


const Create = ({handler}: { handler: CreateHandler }) => {
    // const [isSubmitting, setIsSubmitting] = useState(false);
    const [open, setOpen] = useState(false);
    const [routerOpen, setRouterOpen] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);
    const [activeField, setActiveField] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newPackage, setNewPackage] = useState<NewPackage>({
        name: "",
        price: "",
        speed: "",
        duration: "30",
        durationUnit: "days",
        status: "active",
        router_id: null,
        router_identity: "",
        type: "ppoe"
    })

    useEffect(() => {
        // Start entrance animation after component mounts
        setTimeout(() => setAnimateIn(true), 100);
    }, []);


    const focusField = (fieldName: string) => {
        setActiveField(fieldName);
    };

    const blurField = () => {
        setActiveField('');
    };

    const packageTypes = [
        {value: 'ppoe', label: 'PPPoE'},
        {value: 'hotspot', label: 'Hotspot'}
    ];

    const durationUnits = [
        {value: 'days', label: 'Days'},
        {value: 'months', label: 'Months'},
        {value: 'minutes', label: 'Minutes'}
    ];

    const handleRouterChange = (routerId: number) => {
        if (routerId) {
            const selectedRouter = handler.routers.find((router) => router.id === routerId);
            console.log(selectedRouter);
            if (selectedRouter) {
                setNewPackage({
                    ...newPackage,
                    router_id: routerId,
                    router_identity: selectedRouter.identity,
                });
            }
        } else {
            setNewPackage({
                ...newPackage,
                router_id: null,
                router_identity: "",
            });
        }
        setRouterOpen(false);
    };

    const handleAddPackage = async () => {
        setIsSubmitting(true);

        // Format the duration with the unit
        const formattedDuration = `${newPackage.duration} ${newPackage.durationUnit}`;

        // Define the payload type
        const packageData: Omit<NewPackage, "durationUnit"> & { session_timeout: string } = {
            ...newPackage,
            duration: formattedDuration,
            session_timeout: formattedDuration,
        };

        try {
            const response = await fetch(Config.baseURL + '/api/pkgs/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(packageData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data: Package = await response.json();

            console.log(data);

            // Add the new package to the existing packages list
            // setPackages((prevPackages) => [...prevPackages, data]);

            // Close the modal
            handler.onDismiss()

            // Reset the form data
            setNewPackage({
                name: "",
                price: "",
                speed: "",
                duration: "30",
                durationUnit: "days",
                status: "active",
                router_id: null,
                router_identity: "",
                type: "ppoe",
            });
        } catch (error) {
            console.error("Failed to add package:", error instanceof Error ? error.message : String(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (

        <div className="bg-white rounded dark:bg-gray-800 px-6 py-5">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex items-center space-x-3">
                    <div
                        className={`bg-blue-100 dark:bg-blue-900 p-2 rounded-lg transition-all duration-300 ${animateIn ? 'scale-100 rotate-0' : 'scale-0 rotate-90'}`}>
                        <Pkg className="h-5 w-5 text-blue-600 dark:text-blue-400"/>
                    </div>
                    <h3 className={`text-xl font-semibold text-gray-900 dark:text-white transition-all duration-300 delay-100 ${animateIn ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                        Add New Package
                    </h3>
                </div>
                <button
                    onClick={() => handler.onDismiss()}
                    className="text-gray-400 cursor-pointer hover:ring-1 rounded-full p-3  hover:text-gray-500 dark:hover:text-gray-300 transition-colors hover:rotate-90 transition-transform duration-200"
                >
                    <X className="h-5 w-5"/>
                </button>
            </div>

            <div className="mt-6 space-y-6">
                <div
                    className={`transition-all duration-300 delay-150 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Package Name <span className="text-red-500 ms-1">*</span>
                    </label>
                    <div
                        className={`relative group ${activeField === 'name' ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}>
                <span
                    className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none transition-colors duration-200 ${activeField === 'name' ? 'text-blue-500' : 'text-gray-400'}`}>
                  <Pkg className="h-4 w-4"/>
                </span>
                        <input
                            type="text"
                            className="w-full outline-0 pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                            value={newPackage.name}
                            onChange={(e) => setNewPackage({...newPackage, name: e.target.value})}
                            onFocus={() => focusField('name')}
                            onBlur={blurField}
                            placeholder="Enter package name"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Price (Kes/month) <span className="text-red-500 ms-1">*</span>
                    </label>
                    <div
                        className={`relative group ${activeField === 'price' ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}>
                  <span
                      className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none transition-colors duration-200 ${activeField === 'price' ? 'text-blue-500' : 'text-gray-400'}`}>
                    kes
                  </span>
                        <input
                            type="number"
                            step="0.01"
                            className="w-full pl-10 p-3 outline-0 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                            value={newPackage.price}
                            onChange={(e) => {
                                setNewPackage({...newPackage, price: e.target.value})
                            }}
                            onFocus={() => focusField('price')}
                            onBlur={blurField}
                            placeholder="0.00"
                        />
                    </div>
                </div>
                <div>
                    <div className="hstack mb-2 gap-1">
                        <span
                            className={`pointer-events-none transition-colors duration-200 ${activeField === 'speed' ? 'text-blue-500' : 'text-gray-400'}`}>
                    <Zap className="h-4 w-4"/>
                  </span>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Internet Speed
                            <span className="text-red-500 ms-1">*</span>
                        </label>
                    </div>
                    <div
                        className={`relative group ${activeField === 'speed' ? 'ring-2 ring-blue-500 rounded-lg' : ''}  w-full outline-0 px-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200`}>

                        <div className="w-full">
                            <div className="grid relative grid-cols-2 gap-4">
                                {/* First Input */}
                                <div className="hstack gap-1 md:pe-2">
                                    <HardDriveDownload
                                        className={`h-4 w-4 ${activeField === 'speed' ? 'text-blue-500' : 'text-gray-400'}`}/>
                                    <input
                                        maxLength={4}
                                        type="text"
                                        placeholder={"Eg. 1M"}
                                        className="w-full p-3 border-0 outline-0"
                                        onChange={(e) =>
                                            setNewPackage({
                                                ...newPackage,
                                                speed: e.target.value
                                            })}
                                        onFocus={() => focusField('speed')}
                                        onBlur={blurField}
                                    />
                                </div>
                                <div
                                    className={`py-2 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 absolute h-full rounded w-[2px] `}>
                                    <div
                                        className={`h-full   ${activeField === 'speed' ? 'bg-blue-500' : 'bg-gray-300'} w-full rounded`}/>
                                </div>
                                <div className="hstack md:ps-2 gap-1">
                                    <HardDriveUpload
                                        className={`h-4 w-4 ${activeField === 'speed' ? 'text-blue-500' : 'text-gray-400'}`}/>
                                    <input
                                        placeholder={"Eg. 1M"}
                                        type="text"
                                        maxLength={4}
                                        className="w-full p-3 border-0 outline-0"
                                        onChange={(e) =>
                                            setNewPackage({
                                                ...newPackage,
                                                speed: e.target.value
                                            })}
                                        onFocus={() => focusField('speed')}
                                        onBlur={blurField}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className={`grid grid-cols-1 md:grid-cols-2 gap-5 transition-all duration-300 delay-250 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Duration
                        </label>
                        <div className="flex space-x-2">
                            <div
                                className={`relative flex-1 ${activeField === 'duration' ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}>
                    <span
                        className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none transition-colors duration-200 ${activeField === 'duration' ? 'text-blue-500' : 'text-gray-400'}`}>
                      <Calendar className="h-4 w-4"/>
                    </span>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                                    value={newPackage.duration}
                                    onChange={(e) => setNewPackage({
                                        ...newPackage,
                                        duration: e.target.value
                                    })}
                                    onFocus={() => focusField('duration')}
                                    onBlur={blurField}
                                />
                            </div>

                            <div className="relative w-3/5">
                                <button
                                    type="button"
                                    onClick={() => setOpen(!open)}
                                    className={`w-full flex items-center justify-between p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all duration-200 ${open ? 'ring-2 ring-blue-500' : ''}`}
                                >
                                    <span>{durationUnits.find(unit => unit.value === newPackage.durationUnit)?.label}</span>
                                    <ChevronsUpDown
                                        className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}/>
                                </button>

                                {open && (
                                    <div
                                        className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 py-1 max-h-60 overflow-auto animate-fadeIn">
                                        {durationUnits.map((unit, idx) => (
                                            <div
                                                key={unit.value}
                                                className={`px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 ${newPackage.durationUnit === unit.value ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                                                onClick={() => {
                                                    setNewPackage({
                                                        ...newPackage,
                                                        durationUnit: unit.value as ("days" | "minutes" | "months")
                                                    });
                                                    setOpen(false);
                                                }}
                                                style={{
                                                    animationDelay: `${idx * 50}ms`,
                                                    animation: 'fadeInSlideUp 150ms ease-out forwards',
                                                    opacity: 0,
                                                    transform: 'translateY(8px)'
                                                }}
                                            >
                                                    <span
                                                        className="text-gray-900 dark:text-gray-200">{unit.label}</span>
                                                {newPackage.durationUnit === unit.value && (
                                                    <Check className="h-4 w-4 text-blue-600 dark:text-blue-400"/>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Type
                        </label>
                        <div
                            className={`relative ${activeField === 'type' ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}>
                  <span
                      className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none transition-colors duration-200 ${activeField === 'type' ? 'text-blue-500' : 'text-gray-400'}`}>
                    <Wifi className="h-4 w-4"/>
                  </span>
                            <select
                                className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white appearance-none bg-no-repeat transition-all duration-200"
                                style={{
                                    backgroundPosition: 'right 0.75rem center',
                                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                    backgroundSize: '1.5em 1.5em'
                                }}
                                value={newPackage.type}
                                onChange={(e) => setNewPackage({...newPackage, type: e.target.value as ("ppoe" | "hotspot")})}
                                onFocus={() => focusField('type')}
                                onBlur={blurField}
                            >
                                {packageTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div
                    className={`transition-all duration-300 delay-300 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Router
                    </label>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setRouterOpen(!routerOpen)}
                            className={`w-full flex items-center justify-between p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all duration-200 ${routerOpen ? 'ring-2 ring-blue-500' : ''}`}
                        >
                            <div className="flex items-center">
                                <Server
                                    className={`h-4 w-4 mr-2 transition-colors duration-200 ${routerOpen ? 'text-blue-500' : 'text-gray-400'}`}/>
                                <span>
                      {newPackage.router_id ?
                          handler.routers.find(r => r.id === newPackage.router_id)?.name +
                          ` (${handler.routers.find(r => r.id === newPackage.router_id)?.ip_address})` :
                          'Select a router'}
                    </span>
                            </div>
                            <ChevronsUpDown
                                className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${routerOpen ? 'rotate-180' : ''}`}/>
                        </button>

                        {routerOpen && (
                            <div
                                className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 py-1 max-h-60 overflow-auto animate-fadeIn">
                                {handler.routers.map((router, idx) => (
                                    <div
                                        key={router.id}
                                        className={`px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 ${newPackage.router_id === router.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                                        onClick={() => handleRouterChange(router.id)}
                                        style={{
                                            animationDelay: `${idx * 50}ms`,
                                            animation: 'fadeInSlideUp 150ms ease-out forwards',
                                            opacity: 0,
                                            transform: 'translateY(8px)'
                                        }}
                                    >
                                        <div className="flex items-center">
                                            <Router className="h-4 w-4 text-gray-400 mr-2"/>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{router.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{router.ip_address}</p>
                                            </div>
                                        </div>
                                        {newPackage.router_id === router.id && (
                                            <Check className="h-4 w-4 text-blue-600 dark:text-blue-400"/>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div
                    className={`mt-8 flex justify-end space-x-3 transition-all duration-300 delay-350 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    {isSubmitting ? (
                        <button
                            type="button"
                            disabled
                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center transition-all duration-200"
                        >
                            <Loader2 className="animate-spin mr-2 h-5 w-5"/>
                            Processing...
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => handler.onDismiss()}
                                className="px-4 py-3 cursor-pointer border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 font-medium hover:shadow-md"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleAddPackage()}
                                className="px-6 py-3 bg-blue-600 cursor-pointer text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center space-x-2 hover:shadow-md hover:shadow-blue-300 dark:hover:shadow-blue-900 transform hover:-translate-y-0.5"
                            >
                                <span>Add Package</span>
                                <ArrowRight className="h-4 w-4"/>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Create;