import {useState, useEffect, useCallback} from 'react';
import {EthernetPort, Wifi, Server, AlertCircle} from 'lucide-react';
import {motion} from 'framer-motion';
import {$} from "../build/request.ts";

// Type definitions
type PortType = 'ethernet' | 'sfp' | 'sfp+' | 'wireless';

interface Port {
    id: string;
    name: string;
    type: PortType;
    mode: 'wan' | 'lan' | null;
}

export type PortProp = {
    setOnValidate: Closure
    setInfoCallback: Closure;
}
const PortConfigurator = ({router, props}: { router: string; props: PortProp }) => {
    const [ports, setPorts] = useState<Port[]>([]);
    const [theme,] = useState<'light' | 'dark'>('light');
    const [error, setError] = useState<string | null>(null);
    const [, setSuccess] = useState<boolean>(false);
    const [, setIsSubmitting] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    // Set first ethernet port to LAN by default
    useEffect(() => {
        const updatedPorts = [...ports];
        const firstEtherIndex = updatedPorts.findIndex(port => port.type === 'ethernet');
        if (firstEtherIndex !== -1) {
            if (updatedPorts[firstEtherIndex])
                updatedPorts[firstEtherIndex].mode = 'lan';
            setPorts(updatedPorts);
        }
    }, [ports]);


    // Get appropriate icon based on port type
    const getPortIcon = (type: PortType) => {
        switch (type) {
            case 'ethernet':
                return <EthernetPort size={24} className={theme === 'light' ? 'text-blue-600' : 'text-blue-400'}/>;
            case 'sfp':
                return <Server size={24} className={theme === 'light' ? 'text-purple-600' : 'text-purple-400'}/>;
            case 'sfp+':
                return <Server size={24} className={theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'}/>;
            case 'wireless':
                return <Wifi size={24} className={theme === 'light' ? 'text-green-600' : 'text-green-400'}/>;
            default:
                return <EthernetPort size={24} className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}/>;
        }
    };

    // Toggle port mode (WAN or LAN)
    // Toggle port mode (WAN or LAN)
    const togglePortMode = (id: string) => {
        setError(null);
        setSuccess(false);
        const updatedPorts = [...ports];

        const clickedPortIndex = updatedPorts.findIndex(port => port.id === id);

        if (clickedPortIndex === -1) return;
        const currentMode = updatedPorts[clickedPortIndex] ? updatedPorts[clickedPortIndex].mode : null;
        const setMode = (mode: any, index: any) => {
            const pt = updatedPorts[index];
            if (pt)
                pt.mode = mode;
        }

        // Cycle through modes: null -> lan -> wan -> null
        if (currentMode === null) {
            // null -> lan
            setMode("lan", clickedPortIndex);
        } else if (currentMode === 'lan') {
            // lan -> wan (handle existing WAN port first)
            const existingWanIndex = updatedPorts.findIndex(port => port.mode === 'wan');
            if (existingWanIndex !== -1) {
                setMode("lan", existingWanIndex)
            }
            setMode("wan", clickedPortIndex)
        } else {
            // wan -> null
            setMode(null, clickedPortIndex);
        }

        setPorts(updatedPorts);
    };
    const fetchInterfaces = useCallback(() => {
        if (ports.length) return;
        setLoading(true);
        $.post<{ ports: Port[] }>({
            url: "/api/routers/interface/", data: {router}
        }).then(response => {
            setPorts(response.data.ports);
        }).catch(() => {
            console.error("Failed to fetch interfaces", error);
            setError("Failed to load interfaces. Please try again.");
        }).done(() => {
            setLoading(false);
        });
    }, [error, ports, router]);
    useEffect(() => {
        fetchInterfaces();
    }, [fetchInterfaces]);

    // Validate configuration before submission
    const validateConfiguration = useCallback(() => {
        // Check if we have at least one WAN port
        alert(ports.length)
        const wanPorts = ports.filter(port => port.mode === 'wan');
        if (wanPorts.length === 0) {
            setError('You must configure at least one WAN port');
            return false;
        }

        // Check if we have at least one LAN port
        const lanPorts = ports.filter(port => port.mode === 'lan');
        if (lanPorts.length === 0) {
            setError('You must configure at least one LAN port');
            return false;
        }

        return true;
    }, [ports]);

    const [out, setOut] = useState<any>({})
    const handleSubmit = useCallback(() => {
        setIsSubmitting(true);
        setError(null);

        if (validateConfiguration()) {
            // Create configuration output
            const wanPorts = ports.filter(port => port.mode === 'wan').map(port => port.name);
            const lanPorts = ports.filter(port => port.mode === 'lan').map(port => port.name);

            setOut({
                wan_interface: wanPorts,
                lan_interface: lanPorts,
                bridge_configuration: {
                    name: "bridge-lan",
                    ports: lanPorts
                },
                wan_configuration: {
                    name: "wan",
                    ports: wanPorts
                }
            })
            setSuccess(true);

            // Mock API submission with timeout
            setTimeout(() => {
                setIsSubmitting(false);
            }, 1000);
            return !0;
        } else {
            setIsSubmitting(false);
        }
        return
    }, [ports, validateConfiguration])
    useEffect(() => {
        props.setOnValidate(() => handleSubmit)
        props.setInfoCallback(() => out)
    }, [handleSubmit, out, props])

    // Get port count by mode
    const getPortCountByMode = (mode: 'wan' | 'lan' | null) => {
        return ports.filter(port => port.mode === mode).length;
    };

    return (
        <div className={`dark:text-white text-gray-800 transition-colors duration-300`}>
            <div className="">


                <div className={`mb-6 p-4 rounded-lg bg-white shadow-md dark:bg-gray-800 dark:shadow-lg`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Port Assignment</h2>
                        <div className="flex gap-4">
                            <div
                                className={`px-3 py-1 hstack gap-1 rounded-full text-sm bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200`}>
                                <svg className="mr-2 text-current" width="16"
                                     height="16" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                     strokeLinejoin="round">
                                    <path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A8 8 0 1 0 4 16.2"/>
                                    <path d="m23 16-4 4-4-4"/>
                                </svg>
                                WAN: {getPortCountByMode('wan')}
                            </div>
                            <div
                                className={`px-3 py-1 hstack gap-1 rounded-full text-sm bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200`}>
                                <svg className="mr-2 text-current" width="16"
                                     height="16" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                     strokeLinejoin="round">
                                    <rect width="20" height="14" x="2" y="5" rx="2"/>
                                    <line x1="2" y1="10" x2="22" y2="10"/>
                                </svg>
                                LAN: {getPortCountByMode('lan')}
                            </div>
                            <div
                                className={`px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`}>
                                Unassigned: {getPortCountByMode(null)}
                            </div>
                        </div>
                    </div>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div
                                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading interfaces...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {ports.map((port) => (
                                <motion.div
                                    key={port.id}
                                    initial={{opacity: 0, scale: 0.95}}
                                    animate={{opacity: 1, scale: 1}}
                                    transition={{duration: 0.2, delay: 0.1}}
                                    onClick={() => togglePortMode(port.id)}
                                    className={`
                  p-4 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200
                  ${port.mode === 'wan' ?
                                        (theme === 'light' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-blue-900 border-2 border-blue-400') :
                                        port.mode === 'lan' ?
                                            ('bg-green-100 border-2 border-green-500 dark:bg-green-900 dark:border-2 dark:border-green-400') :
                                            ('bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600')}
                `}
                                >
                                    <div className="mb-2">{getPortIcon(port.type)}</div>
                                    <div className="font-medium">{port.name}</div>
                                    <div className={`text-xs mt-1 px-2 py-1 rounded-full ${
                                        port.mode === 'wan' ?
                                            (theme === 'light' ? 'bg-blue-200 text-blue-800' : 'bg-blue-800 text-blue-200') :
                                            port.mode === 'lan' ?
                                                (theme === 'light' ? 'bg-green-200 text-green-800' : 'bg-green-800 text-green-200') :
                                                (theme === 'light' ? 'bg-gray-300 text-gray-600' : 'bg-gray-600 text-gray-300')
                                    }`}>
                                        {port.mode === null ? 'Unassigned' : port.mode.toUpperCase()}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                    <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-400`}></div>
                                <span className="text-sm">WAN (Internet connection)</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <div className={`w-4 h-4 rounded-full bg-green-500 dark:bg-green-400`}></div>
                                <span className="text-sm">LAN (Local network)</span>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div
                            className={`mt-4 p-3 rounded-md flex items-center gap-2 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200`}>
                            <AlertCircle size={20}/>
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                <div className={`mb-6 p-4 rounded-lg bg-white shadow-md dark:bg-gray-800 dark:shadow-lg`}>
                    <h2 className="text-xl font-semibold mb-2">Configuration Instructions</h2>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Click on each port to toggle between WAN, LAN, and unassigned</li>
                        <li>You must have at least one WAN port (internet connection)</li>
                        <li>You must have at least one LAN port (local network)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PortConfigurator;