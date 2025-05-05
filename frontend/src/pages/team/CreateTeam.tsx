import {AlertTriangle, Check, Mail, Shield, User, X} from "lucide-react";
import React, {useEffect, useState} from "react";
import {TEAM_ROLES} from "./utility.tsx";

interface Handler {
    editingMember: any;
    dismiss: Closure
}

const CreateTeam: React.FC<{ handler: Handler }> = ({handler}) => {
    const editingMember = handler.editingMember
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'technician',
        status: 'active'
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formError, setFormError] = useState('');
    const handleInputChange = (field: string, value: string) => {
        setFormData({
            ...formData,
            [field]: value
        });
    };
    const validateForm = () => {
        if (!formData.name.trim()) return "Name is required";
        if (!formData.email.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Email is invalid";
        return "";
    };
    const handleAddOrUpdate = () => {
        const error = validateForm();
        if (error) {
            setFormError(error);
            return;
        }

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        }, 800);
    };
    useEffect(() => {
        const inputs = document.querySelectorAll('.form-field');
        inputs.forEach((input, index) => {
            setTimeout(() => {
                input.classList.add('opacity-100', 'translate-y-0');
            }, 100 * (index + 1));
        });
    }, []);
    return (
        <div
            className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-2xl w-full  overflow-hidden transition-all duration-300 transform">
            {/* Header with animated gradient border */}
            <div className="relative">
                <div
                    className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-pulse"></div>
                <div className="flex justify-between items-center p-6">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-blue-50 p-2 text-blue-600 animate-fadeIn">
                            <User size={20} className="animate-pulse"/>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                            {editingMember ? 'Edit Team Member' : 'Add Team Member'}
                        </h2>
                    </div>
                    <button
                        onClick={() => handler.dismiss()}
                        className="rounded-full p-4 cursor-pointer text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
                    >
                        <X size={20}/>
                    </button>
                </div>
            </div>

            {formError && (
                <div
                    className="mx-6 mb-4 flex items-center p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 animate-fadeIn">
                    <AlertTriangle size={16} className="mr-2 flex-shrink-0"/>
                    <p>{formError}</p>
                </div>
            )}

            {success && (
                <div
                    className="mx-6 mb-4 flex items-center p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100 animate-fadeIn">
                    <Check size={16} className="mr-2 flex-shrink-0"/>
                    <p>Member {editingMember ? 'updated' : 'added'} successfully!</p>
                </div>
            )}

            <div className="p-6 pt-2 space-y-5">
                {/* Form fields with animation */}
                <div className="form-field opacity-0 translate-y-4 transition-all duration-300 ease-out">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
                        <User size={16} className="mr-2 text-blue-500"/>
                        Full Name
                    </label>
                    <input
                        type="text"
                        placeholder="Enter full name"
                        className="w-full px-4 py-2.5 outline-0 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                </div>

                <div className="form-field opacity-0 translate-y-4 transition-all duration-300 ease-out">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
                        <Mail size={16} className="mr-2 text-blue-500"/>
                        Email Address
                    </label>
                    <input
                        type="email"
                        placeholder="name@company.com"
                        className="w-full px-4 py-2.5 rounded-lg outline-0 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                </div>

                <div className="form-field opacity-0 translate-y-4 transition-all duration-300 ease-out">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
                        <Shield size={16} className="mr-2 text-blue-500"/>
                        Role
                    </label>
                    <div className="relative">
                        <select
                            className="w-full appearance-none px-4 py-2.5 outline-0 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white pr-10"
                            value={formData.role}
                            onChange={(e) => handleInputChange('role', e.target.value)}
                        >
                            {Object.keys(TEAM_ROLES).map(role => (
                                <option key={role} value={role}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </option>
                            ))}
                        </select>
                        <div
                            className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="form-field opacity-0 translate-y-4 transition-all duration-300 ease-out">
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Status</label>
                    <div className="flex space-x-4">
                        <label className="flex items-center cursor-pointer">
                            <div
                                className={`w-10 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${formData.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}>
                                <div
                                    className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${formData.status === 'active' ? 'translate-x-4' : ''}`}></div>
                            </div>
                            <div className="ml-3 text-gray-700 font-medium">
                                {formData.status === 'active' ? 'Active' : 'Inactive'}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={formData.status === 'active'}
                                onChange={(e) => handleInputChange('status', e.target.checked ? 'active' : 'inactive')}
                            />
                        </label>
                    </div>
                </div>
            </div>

            {/* Footer with actions */}
            <div className="p-6 bg-gray-50 flex justify-end space-x-3 border-t border-gray-100">
                <button
                    onClick={() => handler.dismiss()}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 flex items-center"
                >
                    <span>Cancel</span>
                </button>
                <button
                    onClick={handleAddOrUpdate}
                    disabled={loading}
                    className={`px-6 py-2 rounded-lg font-medium text-white ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} transition-all duration-200 flex items-center`}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </>
                    ) : (
                        <>
                            <Check size={16} className="mr-1.5"/>
                            {editingMember ? 'Update' : 'Add'} Member
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

export default CreateTeam