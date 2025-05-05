import {useState, useEffect, useCallback} from 'react';
import {EthernetPort, Wifi, Server, AlertCircle} from 'lucide-react';
import {motion} from 'framer-motion';
import {$} from "../build/request.ts";
import Signal from "../lib/Signal.ts";

// Type definitions
type PortType = 'ethernet' | 'sfp' | 'sfp+' | 'wireless';

interface Port {
    id: string;
    name: string;
    type: PortType;
    mode: 'lan' | null;
}

export type PortProp = {
    setOnValidate: (callback: () => boolean) => void;
    setInfoCallback: (callback: () => any) => void;
}

const getPortIcon = (type: PortType) => {
    switch (type) {
        case 'ethernet':
            return <EthernetPort size={24} className={'text-blue-600 dark:text-blue-400'}/>;
        case 'sfp':
            return <Server size={24} className={'text-purple-600 dark:text-purple-400'}/>;
        case 'sfp+':
            return <Server size={24} className={'text-indigo-600 dark:text-indigo-400'}/>;
        case 'wireless':
            return <Wifi size={24} className={'text-green-600 dark:text-green-400'}/>;
        default:
            return <EthernetPort size={24} className={'text-gray-600 dark:text-gray-400'}/>;
    }
};

// @ts-ignore
const PortConfigurator = ({router, props}: { router: string; props: PortProp }) => {
    const [ports, setPorts] = useState<Port[]>([]);
    const [wan, setWan] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    // @ts-ignore
    const [success, setSuccess] = useState<boolean>(false);
    // @ts-ignore
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    // @ts-ignore
    const [out, setOut] = useState<any>({});

    // Toggle port mode (WAN or LAN)
    const togglePortMode = (id: string) => {
        setError(null);
        setSuccess(false);

        setPorts(currentPorts => {
            const updatedPorts = [...currentPorts];
            const clickedPortIndex = updatedPorts.findIndex(port => port.id === id);

            if (clickedPortIndex === -1) return currentPorts;

            // @ts-ignore
            const currentMode = updatedPorts[clickedPortIndex].mode;

            // Cycle through modes: null -> lan -> null
            if (currentMode === null) {
                // @ts-ignore
                updatedPorts[clickedPortIndex].mode = "lan";
            } else {
                // @ts-ignore
                updatedPorts[clickedPortIndex].mode = null;
            }

            return updatedPorts;
        });
    };

    // Fetch ports data
    useEffect(() => {
        setLoading(true);
        $.post<{ ports: Port[], wan: string | null }>({
            url: "/api/routers/interface/", data: {router}
        }).then(response => {
            setPorts(response.data.ports);
            setWan(response.data.wan);
        }).catch(err => {
            console.error("Failed to fetch interfaces", err);
            setError("Failed to load interfaces. Please try again.");
        }).done(() => {
            setLoading(false);
        });
    }, [router]); // Only depend on router prop

    // Get port count by mode
    const getPortCountByMode = useCallback((mode: 'lan' | null) => {
        return ports.filter(port => port.mode === mode).length;
    }, [ports]);

    // Validate configuration before submission
    const validateConfiguration = useCallback(() => {
        const lanPorts = getPortCountByMode("lan");
        if (lanPorts <= 0) {
            setError("You must configure at least one LAN port");
            return false;
        }
        setError(null);
        return true;
    }, [getPortCountByMode]);


    // Set callbacks for parent component
    useEffect(() => {
        Signal.on("mtk-i-proceed", (cb: Closure) => {
            setIsSubmitting(true);
            setError(null);

            if (validateConfiguration()) {
                // Create configuration output
                const lanPorts = ports.filter(port => port.mode === 'lan').map(port => port.name);

                const configOutput = {
                    lan_interface: lanPorts,
                    bridge_configuration: {
                        name: "bridge-lan",
                        ports: lanPorts
                    },
                };
                cb(configOutput)
                setSuccess(true);
                setIsSubmitting(false);
                return true;
            } else {
                setIsSubmitting(false);
                return false;
            }
        });
        return () => {
            Signal.off("mtk-i-proceed");
        }
    }, [validateConfiguration]);

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
                                WAN: {wan ?? "..."}
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
                  ${port.mode === 'lan' ?
                                        ('bg-blue-100 border-2 border-blue-500 dark:bg-blue-900 dark:border-2 dark:border-blue-400') :
                                        ('bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600')}
                `}
                                >
                                    <div className="mb-2">{getPortIcon(port.type)}</div>
                                    <div className="font-medium">{port.name}</div>
                                    <div className={`text-xs mt-1 px-2 py-1 rounded-full ${
                                        port.mode === 'lan' ?
                                            ('bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200') :
                                            ('bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-300')
                                    }`}>
                                        {port.mode === null ? 'Unassigned' : port.mode.toUpperCase()}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
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
                        <li>Click on each port to toggle between LAN and unassigned</li>
                        <li>WAN port is pre-configured as: {wan ?? "Loading..."}</li>
                        <li>You must have at least one LAN port (local network)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PortConfigurator;