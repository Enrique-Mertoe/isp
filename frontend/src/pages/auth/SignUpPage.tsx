import {useState, useEffect, ChangeEvent} from "react";
import {ArrowLeft, ArrowRightSquare} from "lucide-react";
import Fav from "../../assets/logo.png";
import {useSignIn} from "../../hooks/useSignIn.ts";
import AuthLayout from "./layout.tsx";

// Reusable animated input component
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const AnimatedInput = ({label, ...props}) => {
    const [focused, setFocused] = useState(false);

    return (
        <div className="mb-4">
            <label className="text-sm font-medium transition-all duration-300">
                {label}
            </label>
            <div className={`relative mt-2 overflow-hidden rounded-md ${focused ? "ring-2 ring-blue-500" : ""}`}>
                <input
                    {...props}
                    className="w-full p-3 bg-gray-100 text-dark rounded-md outline-none transition-all duration-300 ring-1 focus:ring-2 focus:ring-blue-500"
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
                {/*<div*/}
                {/*    className={`absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all duration-500 ease-in-out ${focused ? "w-full" : "w-0"}`}></div>*/}
            </div>
        </div>
    );
};

// Progress indicator component
const ProgressIndicator = ({currentStep, totalSteps}: {
    currentStep: number, totalSteps: number
}) => {
    return (
        <ol className="flex items-center justify-between w-full p-3 space-x-2 text-sm font-medium text-center text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700 sm:p-4 sm:space-x-4 rtl:space-x-reverse">
            {Array.from({length: totalSteps}).map((_, index) => (
                <li
                    key={index}
                    className={`flex items-center ${index < currentStep ? "text-blue-600 dark:text-blue-500" : ""}`}
                >
          <span
              className={`flex items-center justify-center w-5 h-5 me-2 text-xs border rounded-full shrink-0 
              ${index < currentStep ? "border-blue-600 dark:border-blue-500" : "border-gray-500 dark:border-gray-400"}
              ${currentStep === index ? "bg-blue-50 dark:bg-blue-900/30" : ""}`}
          >
            {index < currentStep - 1 ? (
                <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            ) : (
                <span>{index + 1}</span>
            )}
          </span>
                    {index < totalSteps - 1 && (
                        <svg className="w-3 h-3 ms-2 sm:ms-4 rtl:rotate-180" aria-hidden="true"
                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 12 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="m7 9 4-4-4-4M1 9l4-4-4-4"/>
                        </svg>
                    )}
                </li>
            ))}
        </ol>
    );
};

// Background pattern component


// Main component
const SignUpPage = () => {
    const TOTAL_STEPS = 4;
    const su = useSignIn();
    const [form, setRegData] = useState({
        fName: "",
        lName: "",
        email: "",
        phone: "",
        password: "",
        cPassword: ""
    });

    const [errorMessage, setErrorMessage] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [slideDirection, setSlideDirection] = useState("right");
    const [transitioning, setTransitioning] = useState(false);

    // Handle step transitions with animation
    const changeStep = (newStep: number) => {
        if (newStep === step) return;

        setSlideDirection(newStep > step ? "right" : "left");
        setTransitioning(true);
        setTimeout(() => {
            setStep(newStep);
            setTransitioning(false);
        }, 300);
    };

    const validateStep = async () => {
        // Mock validation - in a real app would check email existence
        if (step === 2) {
            setLoading(true)
            const res = await su.exists(form.email);
            setLoading(false)
            if (res.error)
                return setErrorMessage(res.error)
        }

        changeStep(step + 1);
        setErrorMessage([]);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setRegData((prev) => ({...prev, [name]: value}));
    };

    const handleSubmit = async () => {
        if (step !== TOTAL_STEPS) {
            return validateStep();
        }

        if (loading) return;

        setLoading(true);

        if (form.password !== form.cPassword) {
            setErrorMessage(["Passwords do not match"]);
            setLoading(false);
            return;
        }

        const fd = new FormData();
        Object.entries(form).map(([k, v]) => {
            fd.append(k.toLowerCase(), v)
        })
        const res = await su.createUser(fd);
        setLoading(false)
        setErrorMessage(res.error ?? [])
        if (res.ok) {
            const urlParams = new URLSearchParams(window.location.search);
            const next = urlParams.get('next');

            window.location.href = res.rdr || next || '/';
        }
    };

    // Form step content
    const renderStepContent = () => {
        const slideClass = transitioning
            ? slideDirection === "right"
                ? "translate-x-full opacity-0"
                : "-translate-x-full opacity-0"
            : "translate-x-0 opacity-100";

        return (
            <div className={`transform transition-all duration-300 ease-in-out ${slideClass}`}>
                {step === 1 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Personal Information</h3>
                        <AnimatedInput
                            label="First Name"
                            name="fName"
                            placeholder="Your first name"
                            required
                            value={form.fName}
                            onChange={handleChange}
                            type="text"
                        />
                        <AnimatedInput
                            label="Last Name"
                            name="lName"
                            placeholder="Your last name"
                            required
                            value={form.lName}
                            onChange={handleChange}
                            type="text"
                        />
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Contact Information</h3>
                        <AnimatedInput
                            label="Email Address"
                            name="email"
                            placeholder="your.email@example.com"
                            required
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Phone Number</h3>
                        <AnimatedInput
                            label="Phone Number"
                            name="phone"
                            placeholder="+254 700000000"
                            required
                            value={form.phone}
                            onChange={handleChange}
                            type="text"
                        />
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Create Password</h3>
                        <AnimatedInput
                            label="Password"
                            name="password"
                            placeholder="Enter a secure password"
                            required
                            value={form.password}
                            onChange={handleChange}
                            type="password"
                        />
                        <AnimatedInput
                            label="Confirm Password"
                            name="cPassword"
                            placeholder="Confirm your password"
                            required
                            type="password"
                            value={form.cPassword}
                            onChange={handleChange}
                        />
                    </div>
                )}
            </div>
        );
    };

    // Mock navigation function
    const goToLogin = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        alert("Redirecting to login page...");
    };

    // Animation for step transitions
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
      @keyframes float {
        0%, 100% { transform: translate(0, 0); }
        25% { transform: translate(20px, 30px); }
        50% { transform: translate(-20px, 60px); }
        75% { transform: translate(30px, 20px); }
      }
    `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <AuthLayout>
            {/* Left Column - Logo & Step Indicator */}
            <div className="h-full flex flex-col w-full relative">
                <div className="flex flex-col items-center sm:items-start">
                    <div className="mb-2 transform transition-all duration-300 hover:scale-105">
                        <img src={Fav} className="h-24 w-24 drop-shadow-md" alt="Logo"/>
                    </div>
                    <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                        Sign Up
                    </h2>
                    <p className="text-gray-500 text-sm mb-6 max-w-xs">
                        Create your account to get started with our services
                    </p>
                </div>


                <div className="mt-auto hstack gap-2">
                    <ProgressIndicator currentStep={step} totalSteps={TOTAL_STEPS}/>
                    {step > 1 && (
                        <button
                            onClick={() => changeStep(step - 1)}
                            className="transition-all duration-200 ease-in-out cursor-pointer h-[45px] aspect-square
                    mt-4 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded-full flex items-center justify-center
                    hover:shadow-md transform hover:-translate-y-1"
                        >
                            <ArrowLeft/>
                        </button>
                    )}

                </div>
            </div>

            {/* Right Column - Form */}
            <div className="w-full flex flex-col overflow-x-hidden vstack h-full px-6 mb-auto relative">
                <div className="space-y-4 vstack  flex-grow-1">
                    {renderStepContent()}

                    {/* Error Messages */}
                    <div className="flex flex-col">
                        {errorMessage.map((v, i) => (
                            <span key={i} className="text-red-500 text-sm flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20"
                                             fill="currentColor">
                                          <path fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                clipRule="evenodd"/>
                                        </svg>
                                {v}
                                    </span>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between mt-auto items-center pt-4">
                        <div className="flex justify-between w-full items-center">
                            <div className="mt-6 hstack justify-between   items-center">
                                <a
                                    href="#"
                                    onClick={goToLogin}
                                    className="text-sm flex items-center gap-2 p-3 text-blue-500 hover:text-blue-600 transition-colors group"
                                >
                                    <ArrowRightSquare size={16} className="group-hover:animate-pulse"/>
                                    <span
                                        className="">
                        Create account
                      </span>
                                </a>
                            </div>

                            <button
                                onClick={event => {
                                    event.preventDefault();
                                    handleSubmit().then()
                                }}
                                disabled={loading}
                                className={`transition-all duration-300 ease-in-out ml-auto cursor-pointer h-[45px] 
                      ${loading ? "p-3 !rounded-full w-[45px]" : "w-auto py-3 px-6"} 
                      mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md flex items-center justify-center
                      hover:shadow-lg transform hover:-translate-y-1`}
                            >
                                {!loading && (
                                    <span className="whitespace-nowrap flex items-center gap-2">
                        {step === TOTAL_STEPS ? "Sign Up" : "Next"}
                                        {step !== TOTAL_STEPS && (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"
                                                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                      strokeWidth={2} d="M9 5l7 7-7 7"/>
                                            </svg>
                                        )}
                      </span>
                                )}
                                {loading && (
                                    <span className="animate-spin">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                      </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>


        </AuthLayout>
    );
};
export default SignUpPage;