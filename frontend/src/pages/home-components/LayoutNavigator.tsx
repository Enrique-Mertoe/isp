import {ArrowLeft} from "lucide-react";
import React from "react";
import {useNavigate} from "react-router-dom";

export default function LayoutNavigator({
                                            children,
                                            title, description
                                        }: {
    children?: React.ReactNode, title: string, description?: string
}) {
    const navigate = useNavigate();
    return (
        <div className="w-full rounded-md bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-start space-x-2">
                    <button
                        type={"button"}
                        onClick={() => {
                            navigate(-1);
                        }}
                        className="p-2 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300"/>
                    </button>
                    <div className="vstack">
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h1>
                        {
                            description ? <p className="mt-1 text-sm text-gray-500">{description}</p>
                                : ''
                        }
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    {children}
                </div>
            </div>
        </div>
    )
}