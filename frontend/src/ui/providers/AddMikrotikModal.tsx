import React, {useRef, useState, useEffect} from "react";
import {$} from "../../build/request.ts";
import {ChevronRight, X, Wifi, CheckCircle, Loader2, RefreshCw, Copy, AlertCircle, AlertTriangle} from "lucide-react";
import {motion, AnimatePresence} from "framer-motion";
import PortConfigurator, {PortProp} from "../PortConfigurator.tsx";

type RouterForm = {
    mtkName: string;
    location: string;
    ip: string;
    username: string;
    password: string;
    interfaces: Interface[];
    selectedWanInterface: string;
    selectedLanInterface: string;
};

type Interface = {
    name: string;
    type: string;
    mac: string;
    status: "up" | "down";
};

interface AddMikrotikModalProps {
    onClose: () => void;
}


interface TerminalViewProps {
    info: {
        txt: string; display: string; status: '' | 'processing' | 'complete';
        error?: string;
        onReload: Closure;
        form: any
    };
    conn: {
        connectionStatus: string,
        setConnectionStatus: any,
        setCheckingAttempts: any,
        checkingAttempts: any,
        maxCheckAttempts: any
    };
    form: any;

}

// Complete the TerminalView component that was cut off
const TerminalView: React.FC<TerminalViewProps> = ({info, form, conn}) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        if (info.txt) {
            const compactScript = info.txt.replace(/\s+/g, ' ');

            // Try the modern approach first
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(compactScript)
                    .then(() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    })
                    .catch(fallbackCopy);
            } else {
                // Fall back to older methods if clipboard API isn't available
                // (e.g., when running on non-HTTPS or IP address)
                fallbackCopy();
            }

            function fallbackCopy() {
                try {
                    // Method 1: execCommand approach
                    const tempEl = document.createElement("textarea");
                    tempEl.value = compactScript;
                    tempEl.setAttribute("readonly", "");
                    tempEl.style.position = "absolute";
                    tempEl.style.left = "-9999px";
                    document.body.appendChild(tempEl);

                    // For mobile devices
                    if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
                        tempEl.contentEditable = String(true);
                        tempEl.readOnly = false;
                        const range = document.createRange();
                        range.selectNodeContents(tempEl);
                        const selection = window.getSelection();
                        selection?.removeAllRanges();
                        selection?.addRange(range);
                        tempEl.setSelectionRange(0, 999999);
                    } else {
                        tempEl.select();
                    }

                    const success = document.execCommand("copy");
                    document.body.removeChild(tempEl);

                    if (success) {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    } else {
                        // Method 2: Show manual copy instruction if execCommand also fails
                        alert("Please press Ctrl+C to copy the script");
                    }
                } catch {
                    prompt("Copy this script manually:", compactScript);
                }
            }
        }
    };

    return (
        <div className="mt-4 space-y-3">
            {info.status === 'processing' && (
                <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                    <Loader2 className="animate-spin" size={18}/>
                    <span>Generating configuration script...</span>
                </div>
            )}

            {info.error && (
                <ErrorReloader onReload={() => info.onReload?.()} error={info.error}/>
            )}

            {info.display && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium">Configuration Script</h4>
                        <button
                            type={"button"}
                            onClick={copyToClipboard}
                            className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            {copied ? (
                                <>
                                    <CheckCircle size={14} className="mr-1"/> Copied!
                                </>
                            ) : (
                                <>
                                    <Copy size={14} className="mr-1"/> Copy code
                                </>
                            )}
                        </button>
                    </div>

                    <div className="bg-gray-900 text-white p-3 rounded-lg overflow-x-auto">
                        <div className="font-mono text-sm whitespace-pre-wrap"
                             dangerouslySetInnerHTML={{__html: info.display}}/>
                    </div>

                    <div
                        className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-start">
                            <svg className="text-blue-600 dark:text-blue-400 mr-2 mt-0.5" width="18" height="18"
                                 viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                 strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="16" x2="12" y2="12"/>
                                <line x1="12" y1="8" x2="12.01" y2="8"/>
                            </svg>
                            <div>
                                <p className="font-medium text-blue-800 dark:text-blue-400">Instructions:</p>
                                <ol className="text-sm text-blue-700 dark:text-blue-500 list-decimal ml-4 mt-1 space-y-1">
                                    <li>Connect to your MikroTik device via SSH or Winbox</li>
                                    <li>Copy and paste this code into the Terminal</li>
                                    <li>Press Enter to execute the script</li>
                                    <li>Wait for the configuration to be applied</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -20}}
                        transition={{duration: 0.3}}
                        className="space-y-4"
                    >
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                            <h3 className="font-medium text-lg mb-2">Connection Status</h3>
                            <div className="flex items-center space-x-3">
                                {conn.connectionStatus === "idle" && (
                                    <>
                                        <Wifi className="text-gray-400" size={24}/>
                                        <span>Waiting to check connection...</span>
                                    </>
                                )}

                                {conn.connectionStatus === "connecting" && (
                                    <>
                                        <Loader2 className="text-blue-500 animate-spin" size={24}/>
                                        <div className="w-full">
                                            <p>Checking connection to your MikroTik device...</p>
                                            <div
                                                className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                                                <div
                                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                                    style={{width: `${(conn.checkingAttempts / conn.maxCheckAttempts) * 100}%`}}
                                                ></div>
                                            </div>
                                            <p className="text-xs mt-1 text-gray-500">Attempt {conn.checkingAttempts} of {conn.maxCheckAttempts}</p>
                                        </div>
                                    </>
                                )}

                                {conn.connectionStatus === "connected" && (
                                    <>
                                        <CheckCircle className="text-green-500" size={24}/>
                                        <span className="text-green-600 dark:text-green-400">Successfully connected to MikroTik!</span>
                                    </>
                                )}

                                {conn.connectionStatus === "failed" && (
                                    <>
                                        <AlertCircle className="text-red-500" size={24}/>
                                        <div>
                                            <p className="text-red-600 dark:text-red-400">Failed to establish
                                                connection</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Make sure the
                                                command was run correctly on your MikroTik device.</p>
                                            <button
                                                onClick={() => {
                                                    conn.setConnectionStatus("connecting");
                                                    conn.setCheckingAttempts(0);
                                                }}
                                                className="flex items-center text-blue-600 dark:text-blue-400 text-sm mt-2"
                                            >
                                                <RefreshCw size={14} className="mr-1"/> Try again
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {conn.connectionStatus === "connected" && (
                            <motion.div
                                initial={{opacity: 0, y: 10}}
                                animate={{opacity: 1, y: 0}}
                                transition={{duration: 0.5, delay: 0.2}}
                                className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                                <h3 className="font-medium text-lg mb-3">Device Information</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                                        <span className="text-gray-600 dark:text-gray-400">Device Name:</span>
                                        <span className="font-medium">{form.mtkName}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                                        <span className="text-gray-600 dark:text-gray-400">IP Address:</span>
                                        <span className="font-medium">{form.ip}</span>
                                    </div>
                                    {/*<div className="flex justify-between border-b pb-2 dark:border-gray-700">*/}
                                    {/*    <span className="text-gray-600 dark:text-gray-400">RouterOS Version:</span>*/}
                                    {/*    <span className="font-medium">7.10.2</span>*/}
                                    {/*</div>*/}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                        <span className="font-medium text-green-600">Online</span>
                                    </div>
                                </div>

                                <div
                                    className="mt-4 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <div className="flex items-start">
                                        <svg className="text-blue-600 dark:text-blue-400 mr-2 mt-0.5" width="18"
                                             height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"/>
                                            <line x1="12" y1="16" x2="12" y2="12"/>
                                            <line x1="12" y1="8" x2="12.01" y2="8"/>
                                        </svg>
                                        <p className="text-sm text-blue-800 dark:text-blue-400">
                                            Your MikroTik is now connected to the VPN network. You can now proceed to
                                            configure network interfaces for WAN and LAN connectivity.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default function AddMikrotikModal({onClose}: AddMikrotikModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected" | "failed">("idle");
    const [checkingAttempts, setCheckingAttempts] = useState(0);
    const maxCheckAttempts = 365;
    const [nextStepEnabled, setNextStepEnabled] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);

    const [form, setForm] = useState<RouterForm>({
        mtkName: "",
        location: "",
        ip: "",
        username: "",
        password: "",
        interfaces: [],
        selectedWanInterface: "",
        selectedLanInterface: ""
    });

    const [terminal, setTerminal] = useState<{
        txt: string; error?: string, display: string; status: '' | 'processing' | 'complete',
        form: any, onReload: Closure
    }>({
        txt: '',
        display: '',
        status: '',
        form,
        onReload: async () => {
            await handleSubmit();
        }
    });

    // Service configuration state
    const [serviceType, setServiceType] = useState<"pppoe" | "hotspot">("pppoe");
    const [setupProgress, setSetupProgress] = useState<{
        stage: string;
        percent: number;
        message: string;
    }>({stage: "", percent: 0, message: ""});

    // Animation references
    const successRef = useRef<HTMLDivElement>(null);

    // Fetch available mikrotik names on mount
    useEffect(() => {
        setForm(prev => ({
            ...prev,
            mtkName: `MikroTik44`
        }));
        const fetchRouterCount = async () => {
            $.get<{ count: number }>({url: "/api/routers/count/", data: {}}).then(
                response => {
                    const count = response.data.count || 0;
                    setForm(prev => ({
                        ...prev,
                        mtkName: `MikroTik${count + 1}`
                    }));
                }
            ).catch(error => {
                console.error("Failed to fetch router count:", error);
                setForm(prev => ({
                    ...prev,
                    mtkName: "MikroTik44"
                }));
            });
        };
        if (step === 1)
            fetchRouterCount().then();
    }, []);

    const nextStep = () => {
        setStep((prev) => {
            const newStep = Math.min(prev + 1, 4);
            if (newStep === 2) {
                // Reset connection checking state when moving to step 2
                setConnectionStatus("idle");
                setCheckingAttempts(0);
            }
            return newStep;
        });
        setNextStepEnabled(false);
    };

    const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setForm((prev) => ({...prev, [name]: value}));
    };

    // For checking connection to MikroTik after script is applied
    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        let isChecking = false;

        const checkConnection = async () => {
            if (isChecking) return;
            isChecking = true;
            if (connectionStatus === "connecting" && checkingAttempts < maxCheckAttempts) {
                $.get<{ status: string; ip?: string }>({
                    url: `/api/routers/check-connection/${form.mtkName}`, data: {}
                }).then(response => {
                    console.log(response.data)
                    if (response.data.status === "connected") {
                        setConnectionStatus("connected");
                        setForm(prev => ({
                            ...prev,
                            ip: response.data.ip ?? "10.8.0.X"
                        }));
                        setNextStepEnabled(true);
                        clearInterval(intervalId);
                    } else {
                        setCheckingAttempts(prev => prev + 1);
                    }
                }).catch(() => {
                    setCheckingAttempts(prev => prev + 1);
                }).done(() => {
                    isChecking = false;
                });
            } else if (checkingAttempts >= maxCheckAttempts) {
                setConnectionStatus("failed");
                clearInterval(intervalId);
            }
        };

        if (connectionStatus === "connecting") {
            intervalId = setInterval(checkConnection, 3000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [connectionStatus, checkingAttempts, form.mtkName, maxCheckAttempts]);
    const [phCheck, setPCheck] = useState<Closure | null>(null)
    const [infoCallback, setInfoCallback] = useState<Closure | null>(null)
    const ph: PortProp = {
        setOnValidate: (fn: Closure) => {
            if (!phCheck)
                setPCheck(fn)

        }, setInfoCallback: (fn: Closure) => {
            if (!infoCallback)
                setInfoCallback(fn)
        }
    }
    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setNextStepEnabled(false);

        try {
            if (step === 1) {
                if (connectionStatus == "connected") {
                    setNextStepEnabled(true)
                    return setStep(step => step + 1)
                }
                setTerminal(prev => ({...prev, status: 'processing', error: undefined}));

                $.post<{
                    error?: string;
                    script?: string;
                    pvr_url?: string;
                    rsc_file?: string;
                    ok?: boolean;
                }>({
                    url: "/api/routers/provision/",
                    data: {router_name: form.mtkName, location: form.location}
                }).then(response => {
                    if (response.data.error) {
                        setTerminal(prev => ({...prev, error: response.data.error, status: 'complete'}));
                    } else if (response.data.script) {
                        const disp = `
<span class='text-purple-300'>:do</span> {
  <span class='text-teal-300'>:local</span> <span class='text-orange-300'>url</span> <span class='text-blue-300'>"${response.data.pvr_url}"</span>;
  <span class='text-teal-300'>/tool fetch</span> <span class='text-teal-300'>url=</span><span class='text-orange-300'>$url</span> <span class='text-teal-300'>dst-path=</span><span class='text-orange-300'>${response.data.rsc_file}</span>;
  <span class='text-purple-300'>:delay</span> <span class='text-orange-300'>2s</span>;
  <span class='text-teal-300'>/import</span> <span class='text-orange-300'>${response.data.rsc_file}</span>;
} <span class='text-teal-300'>on-error=</span> {
  <span class='text-purple-300'>:put</span> <span class='text-blue-300'>"Error occurred during configuration. Check internet and retry."</span>;
}`;
                        setTerminal({
                            txt: response.data.script || '',
                            display: disp,
                            error: undefined,
                            status: "complete",
                            form,onReload:()=>{}
                        });
                        setConnectionStatus("connecting")

                    }
                });


            } else if (step === 2) {
                if (phCheck?.())
                    return nextStep()
                setNextStepEnabled(true);

            } else if (step === 3) {
                // Submit the selected interfaces
                await $.post({
                    url: "/api/routers/configure-interfaces/",
                    data: {
                        router_name: form.mtkName,
                        wan_interface: form.selectedWanInterface,
                        lan_interface: form.selectedLanInterface
                    }
                });
                setNextStepEnabled(true);
                nextStep();
            } else if (step === 4) {
                // Show setup progress
                setSetupProgress({
                    stage: "Initializing configuration",
                    percent: 10,
                    message: "Preparing to configure services..."
                });

                // Simulate steps of configuration with progress updates
                await new Promise(resolve => setTimeout(resolve, 1000));
                setSetupProgress({
                    stage: "Network configuration",
                    percent: 30,
                    message: "Setting up network addressing and pools..."
                });

                await new Promise(resolve => setTimeout(resolve, 1500));
                setSetupProgress({
                    stage: "Service configuration",
                    percent: 60,
                    message: `Configuring ${serviceType === "pppoe" ? "PPPoE Server" : "Hotspot"} service...`
                });

                await new Promise(resolve => setTimeout(resolve, 2000));
                setSetupProgress({
                    stage: "Security configuration",
                    percent: 80,
                    message: "Setting up firewall and security policies..."
                });

                // Final configuration setup
                $.post({
                    url: "/api/routers/complete-setup/",
                    data: {
                        router_name: form.mtkName,
                        service_type: serviceType,
                        setup_config: document.getElementById("service-config")?.textContent || ""
                    }
                }).then(() => {
                    // Show final progress
                    setSetupProgress({
                        stage: "Complete",
                        percent: 100,
                        message: "MikroTik configuration completed successfully!"
                    });

                    // Show success animation
                    setShowSuccess(true);

                    // Close modal after success
                    setTimeout(() => {
                        onClose();
                    }, 3000);
                });


            }
        } catch (error: any) {
            console.error("Error in submit:", error);
            setTerminal(prev => ({...prev, error: error.message || "An unexpected error occurred"}));
        } finally {
            setLoading(false);
        }
    };

    // Handle service type selection
    const handleServiceTypeChange = (type: "pppoe" | "hotspot") => {
        setServiceType(type);
    };


    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -20}}
                        transition={{duration: 0.3}}
                    >


                        {['processing', ''].includes(terminal.status) ? <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="mtk-name"
                                           className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        MikroTik Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="mtkName"
                                        id="mtk-name"
                                        value={form.mtkName}
                                        onChange={handleChange}
                                        className="bg-gray-50 border-2 border-gray-300 outline-0 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                        placeholder="MikroTik1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="location"
                                           className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        id="location"
                                        value={form.location}
                                        onChange={handleChange}
                                        className="bg-gray-50 border-2 border-gray-300 outline-0 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                        placeholder="Server Room, HQ"
                                    />
                                </div>
                            </div>
                            <p className="text-gray-500 my-4">The identity name of your MikroTik device will be used for
                                identification and connection. The name should be unique within your ISP system.</p>
                        </> : ''}
                        {terminal.status !== '' ? (
                            <TerminalView
                                conn={{
                                    connectionStatus,
                                    setCheckingAttempts,
                                    setConnectionStatus,
                                    maxCheckAttempts,
                                    checkingAttempts
                                }}
                                form={form}
                                info={terminal}/>
                        ) : ''}
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -20}}
                        transition={{duration: 0.3}}
                    >
                        <h3 className="font-medium text-lg mb-3">Network Interface Configuration</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Select which interfaces to use for WAN
                            (Internet) and LAN (Local Network)</p>
                        <PortConfigurator props={ph} router={form.mtkName || "MikroTik38"}/>
                    </motion.div>
                );
            case 4:
                return (
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -20}}
                        transition={{duration: 0.3}}
                    >
                        {showSuccess ? (
                            <motion.div
                                ref={successRef}
                                initial={{scale: 0.8, opacity: 0}}
                                animate={{scale: 1, opacity: 1}}
                                className="flex flex-col items-center justify-center py-8"
                            >
                                <motion.div
                                    initial={{scale: 0}}
                                    animate={{scale: 1}}
                                    transition={{
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 20,
                                        delay: 0.2
                                    }}
                                    className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6"
                                >
                                    <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none"
                                         stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </motion.div>

                                <motion.h3
                                    initial={{opacity: 0, y: 10}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{delay: 0.4}}
                                    className="text-xl font-bold text-gray-900 dark:text-white mb-2"
                                >
                                    Setup Complete!
                                </motion.h3>

                                <motion.p
                                    initial={{opacity: 0, y: 10}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{delay: 0.5}}
                                    className="text-gray-600 dark:text-gray-400 text-center max-w-md"
                                >
                                    Your MikroTik router has been successfully configured and is ready to use. You can
                                    now manage it from the dashboard.
                                </motion.p>

                                <motion.div
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    transition={{delay: 0.7}}
                                    className="mt-6"
                                >
                                    <button
                                        onClick={onClose}
                                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        Go to Dashboard
                                    </button>
                                </motion.div>
                            </motion.div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-medium text-lg mb-2">Service Configuration</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">Configure your network services
                                        based on your ISP requirements</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label
                                                className={`inline-flex items-center p-3 border rounded-lg w-full cursor-pointer transition-all ${
                                                    serviceType === 'pppoe'
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-700'
                                                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                                                }`}
                                                onClick={() => handleServiceTypeChange('pppoe')}
                                            >
                                                <input
                                                    type="radio"
                                                    name="service_type"
                                                    className="form-radio h-5 w-5 text-blue-600"
                                                    checked={serviceType === 'pppoe'}
                                                    onChange={() => {
                                                    }}
                                                />
                                                <div className="ml-2">
                                                    <span className="text-sm font-medium">PPPoE Server</span>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">For direct
                                                        PPPoE connections to clients</p>
                                                </div>
                                            </label>
                                        </div>

                                        <div>
                                            <label
                                                className={`inline-flex items-center p-3 border rounded-lg w-full cursor-pointer transition-all ${
                                                    serviceType === 'hotspot'
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-700'
                                                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                                                }`}
                                                onClick={() => handleServiceTypeChange('hotspot')}
                                            >
                                                <input
                                                    type="radio"
                                                    name="service_type"
                                                    className="form-radio h-5 w-5 text-blue-600"
                                                    checked={serviceType === 'hotspot'}
                                                    onChange={() => {
                                                    }}
                                                />
                                                <div className="ml-2">
                                                    <span className="text-sm font-medium">Hotspot</span>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">For WiFi and
                                                        captive portal access</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="service-config"
                                           className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Service Configuration Script
                                    </label>
                                    <motion.div
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1}}
                                        transition={{delay: 0.2}}
                                    >
                    <textarea
                        id="service-config"
                        className="bg-gray-50 border-2 border-gray-300 outline-0 text-gray-900 text-sm font-mono rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        rows={12}
                        defaultValue={serviceType === 'pppoe' ?
                            `# PPPoE Server Configuration
/interface bridge
add name=bridge-lan
/interface bridge port
add bridge=bridge-lan interface=${form.selectedLanInterface}

# Address Configuration
/ip address
add address=10.10.10.1/24 interface=bridge-lan network=10.10.10.0

# PPPoE Pool and Profile Setup
/ip pool
add name="pppoe-pool" ranges=10.10.10.2-10.10.10.254
/ppp profile
add name="Default-PPPoE" local-address=10.10.10.1 remote-address=pppoe-pool use-encryption=yes use-ipv6=no

# PPPoE Server Setup
/interface pppoe-server server
add disabled=no interface=${form.selectedLanInterface} service-name="ISP-PPPoE"

# Sample Client
/ppp secret
add name="test-client" password="password" profile="Default-PPPoE" service=pppoe

# Basic Firewall
/ip firewall nat
add action=masquerade chain=srcnat out-interface=${form.selectedWanInterface}
/ip firewall filter
add action=accept chain=forward connection-state=established,related
add action=drop chain=forward connection-state=invalid
add action=accept chain=forward in-interface=bridge-lan out-interface=${form.selectedWanInterface}`
                            :
                            `# Hotspot Configuration
/interface bridge
add name=bridge-lan
/interface bridge port
add bridge=bridge-lan interface=${form.selectedLanInterface}

# Address Configuration
/ip address
add address=10.10.10.1/24 interface=bridge-lan network=10.10.10.0

# Hotspot Setup
/ip pool
add name="hotspot-pool" ranges=10.10.10.10-10.10.10.254
/ip dhcp-server
add address-pool=hotspot-pool disabled=no interface=bridge-lan name=dhcp-hotspot
/ip dhcp-server network
add address=10.10.10.0/24 dns-server=8.8.8.8,8.8.4.4 gateway=10.10.10.1
/ip hotspot
add address-pool=hotspot-pool disabled=no interface=bridge-lan name=hotspot1
/ip hotspot user profile
set [ find default=yes ] keepalive-timeout=2m rate-limit=2M/2M

# Sample User
/ip hotspot user
add name=test password=password

# Basic Firewall
/ip firewall nat
add action=masquerade chain=srcnat out-interface=${form.selectedWanInterface}
/ip firewall filter
add action=accept chain=forward connection-state=established,related
add action=drop chain=forward connection-state=invalid
add action=accept chain=forward in-interface=bridge-lan out-interface=${form.selectedWanInterface}`}
                    />
                                    </motion.div>
                                    <p className="text-gray-500 mt-1 text-sm">This script will be applied to the
                                        MikroTik device after confirming</p>
                                </div>

                                {setupProgress.stage && (
                                    <motion.div
                                        initial={{opacity: 0, y: 10}}
                                        animate={{opacity: 1, y: 0}}
                                        className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                                    >
                                        <h4 className="font-medium mb-2 flex items-center">
                                            <Loader2 className="animate-spin mr-2 text-blue-600 dark:text-blue-400"
                                                     size={16}/>
                                            {setupProgress.stage}
                                        </h4>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                                                style={{width: `${setupProgress.percent}%`}}
                                            ></div>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{setupProgress.message}</p>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-h-[100rem] h-full overflow-y-auto overflow-x-hidden">
            <div className="vstack p-5">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-xl">Add MikroTik Device</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500"/>
                    </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Connect your MikroTik router to enable automated provisioning and network configuration.
                </p>

                {/* Stepper */}
                <div className="relative mx-7 mb-12">
                    <div className="flex justify-between">
                        {[
                            {icon: <Wifi size={18}/>, label: "Connection", desc: "Device Setup"},
                            {
                                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="18" height="18" x="3" y="3" rx="2"/>
                                    <path d="M7 7h.01"/>
                                    <path d="M17 7h.01"/>
                                    <path d="M7 17h.01"/>
                                    <path d="M17 17h.01"/>
                                </svg>, label: "Network Setup", desc: "Configure Interfaces"
                            },
                            {
                                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="18" height="18" x="3" y="3" rx="2"/>
                                    <path d="M8.5 12H14"/>
                                    <path d="M12 15.5V8.5"/>
                                </svg>, label: "Service Setup", desc: "PPPoE & Hotspot"
                            }
                        ].map((stepItem, index) => {
                            const stepNum = index + 1;
                            const isCompleted = step > stepNum;
                            const isCurrent = step === stepNum;

                            return (
                                <motion.div
                                    key={index}
                                    className="relative flex items-center justify-center z-10"
                                    initial={{opacity: 0, y: 10}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{duration: 0.3, delay: index * 0.1}}
                                >
                                    <div
                                        className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                                            isCompleted
                                                ? 'bg-green-500 text-white'
                                                : isCurrent
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                                        }`}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle size={20}/>
                                        ) : (
                                            <div className="flex items-center justify-center">
                                                {stepItem.icon}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute top-16 w-32 text-center">
                                        <p className={`text-sm font-semibold ${isCurrent ? 'text-blue-600 dark:text-blue-400' : ''}`}>{stepItem.label}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{stepItem.desc}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Progress Line */}
                    <motion.div
                        className="absolute top-6 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{delay: 0.5}}
                    >
                        <motion.div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{width: `${((step - 1) / 3) * 100}%`}}
                        ></motion.div>
                    </motion.div>
                </div>

                <div className="mt-10">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}>
                        <AnimatePresence mode="wait">
                            {renderStepContent()}
                        </AnimatePresence>

                        {/* Buttons */}
                        {!showSuccess && (
                            <motion.div
                                className="flex justify-between mt-8"
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                transition={{delay: 0.3}}
                            >
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    disabled={step === 1 || loading}
                                    className="flex items-center gap-2 text-gray-700 border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 rounded-lg text-sm px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m15 18-6-6 6-6"/>
                                    </svg>
                                    Back
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading || (step !== 4 && !nextStepEnabled)}
                                    className="flex items-center gap-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-70 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={16}/>
                                            Processing...
                                        </>
                                    ) : step < 4 ? (
                                        <>
                                            Next
                                            <ChevronRight size={16}/>
                                        </>
                                    ) : (
                                        'Complete Setup'
                                    )}
                                </button>
                            </motion.div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

// @ts-ignore
function ErrorReloader({error, onReload}) {
    const [isVisible, setIsVisible] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleReload = () => {
        setIsAnimating(true);
        setProgress(0);
        onReload()
        setIsAnimating(false);
        // const interval = setInterval(() => {
        //     setProgress(prev => {
        //         if (prev >= 100) {
        //             clearInterval(interval);
        //             setIsAnimating(false);
        //             return 100;
        //         }
        //         return prev + 5;
        //     });
        // }, 50);
    };

    useEffect(() => {
        if (error) {
            setIsVisible(true);
        }
    }, [error]);

    if (!isVisible || !error) return null;

    return (
        <div className="flex justify-center z-50 px-4">
            <div
                className="bg-white dark:bg-gray-900 shadow-lg rounded-lg w-full max-w-2xl border border-red-300 dark:border-red-800 overflow-hidden">
                {/* Progress bar that appears during reload */}
                {isAnimating && (
                    <div className="h-1 bg-gray-200 dark:bg-gray-700">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300 ease-out"
                            style={{width: `${progress}%`}}
                        />
                    </div>
                )}

                <div className="p-4">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <AlertTriangle className="h-6 w-6 text-red-500 animate-pulse"/>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Error Occurred</h3>
                            </div>
                        </div>
                    </div>

                    <div className="mt-2">
                        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 my-2">
                            <div className="text-sm text-red-700 dark:text-red-300">
                                {error}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Error ID: {Math.random().toString(36).substring(2, 12).toUpperCase()}
                        </div>

                        <div className="flex space-x-3">
                            <button
                                type="button"
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                                onClick={handleReload}
                                disabled={isAnimating}
                            >
                                <RefreshCw className={`mr-2 h-4 w-4 ${isAnimating ? 'animate-spin' : ''}`}/>
                                {isAnimating ? 'Reloading...' : 'Reload'}
                            </button>

                            <button
                                type="button"
                                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Details
                                <ChevronRight className="ml-2 h-4 w-4"/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}