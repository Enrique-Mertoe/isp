import {useState, useEffect} from 'react';
import {
    Search,
    Filter,
    Users,
    Activity,
    Sliders,
    UserPlus,
    Check,
    X,
    ChevronDown,
    Trash2,
    Edit,
    Wifi,
    HelpCircle,
    Loader,
    ArrowUp,
    ArrowDown,
} from 'lucide-react';
import Layout from "../home-components/Layout.tsx";
import LayoutNavigator from "../home-components/LayoutNavigator.tsx";
import {useDialog} from "../../ui/providers/DialogProvider.tsx";
import CreateTeam from "../team/CreateTeam.tsx";
import {$} from "../../build/request.ts";

// Team roles with corresponding UI elements
const TEAM_ROLES = {
    'technician': {color: 'bg-blue-100 text-blue-800', icon: <Wifi size={16}/>},
    'support': {color: 'bg-green-100 text-green-800', icon: <HelpCircle size={16}/>},
    'admin': {color: 'bg-purple-100 text-purple-800', icon: <Users size={16}/>},
    'manager': {color: 'bg-amber-100 text-amber-800', icon: <Sliders size={16}/>}
};
// Performance indicator component
const PerformanceIndicator = ({score}) => {
    let colorClass = 'bg-gray-200';
    if (score >= 90) colorClass = 'bg-green-500';
    else if (score >= 80) colorClass = 'bg-blue-500';
    else if (score >= 70) colorClass = 'bg-yellow-500';
    else colorClass = 'bg-red-500';

    return (
        <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`${colorClass} h-2 rounded-full`} style={{width: `${score}%`}}></div>
            </div>
            <span className="ml-2 text-sm font-medium">{score}%</span>
        </div>
    );
};

// Team member card component
const TeamMemberCard = ({member, onEdit, onDelete}) => {
    const roleSettings = TEAM_ROLES[member.role] || {color: 'bg-gray-100 text-gray-800', icon: null};

    return (
        <div
            className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <img
                            src={member.avatar}
                            alt={member.name}
                            className="h-10 w-10 rounded-full object-cover border-2 border-gray-100"
                        />
                        <div className="ml-3">
                            <h3 className="font-medium text-gray-900">{member.name}</h3>
                            <div className="flex items-center mt-1">
                <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleSettings.color}`}>
                  {roleSettings.icon && <span className="mr-1">{roleSettings.icon}</span>}
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </span>
                                <span
                                    className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {member.status === 'active' ? <Check size={12} className="mr-1"/> : <X size={12} className="mr-1"/>}
                                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={() => onEdit(member)}
                                className="p-1 text-gray-500 hover:text-blue-600 transition-colors">
                            <Edit size={16}/>
                        </button>
                        <button onClick={() => onDelete(member.id)}
                                className="p-1 text-gray-500 hover:text-red-600 transition-colors">
                            <Trash2 size={16}/>
                        </button>
                    </div>
                </div>

                <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-1">{member.email}</p>
                    <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-500">Performance</span>
                        </div>
                        <PerformanceIndicator score={member.performance}/>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main component
export default function TeamManagement() {
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingMember, setEditingMember] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'technician',
        status: 'active'
    });

    // Simulate data loading
    useEffect(() => {
        const fetchData = () => {
            setIsLoading(true);
            // Simulate network delay
            // await new Promise(resolve => setTimeout(resolve, 1200));
            // setMembers(mockTeamMembers);
            $.post({
                url: "api/team/",
                data: {
                    action: "members"
                }
            }).done(() => setIsLoading(false))
                .then(res => {

                })
            ;
        };

        fetchData();
    }, []);

    // Filter and sort members
    const filteredMembers = members.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || member.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || member.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    }).sort((a, b) => {
        if (sortField === 'name') {
            return sortDirection === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        } else if (sortField === 'performance') {
            return sortDirection === 'asc'
                ? a.performance - b.performance
                : b.performance - a.performance;
        }
        return 0;
    });

    // Handle sorting
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Handle editing a team member
    const handleEdit = (member) => {
        setEditingMember(member);
        setFormData({
            name: member.name,
            email: member.email,
            role: member.role,
            status: member.status
        });
        setShowAddForm(true);
    };

    // Handle deleting a team member
    const handleDelete = (id) => {
        setMembers(members.filter(member => member.id !== id));
    };

    // Handle input changes for the form


    // Handle adding/updating a team member
    const handleAddOrUpdate = () => {

        if (editingMember) {
            // Update existing member
            setMembers(members.map(member =>
                member.id === editingMember.id
                    ? {...member, ...formData}
                    : member
            ));
            setEditingMember(null);
        } else {
            // Add new member
            const newMember = {
                id: Math.max(...members.map(m => m.id)) + 1,
                ...formData,
                performance: Math.floor(Math.random() * 31) + 70, // Random performance between 70-100
                avatar: '/api/placeholder/40/40'
            };
            setMembers([...members, newMember]);
        }

        // Reset form and close modal
        setFormData({
            name: '',
            email: '',
            role: 'technician',
            status: 'active'
        });
        setShowAddForm(false);
    };

    // Render the sort direction indicator
    const renderSortIndicator = (field) => {
        if (sortField !== field) return null;

        return sortDirection === 'asc'
            ? <ArrowUp size={14} className="ml-1"/>
            : <ArrowDown size={14} className="ml-1"/>;
    };

    // Render add/edit form


    // Render role filter dropdown
    const renderRoleFilter = () => {
        const [isOpen, setIsOpen] = useState(false);

        return (
            <div className="relative">
                <button
                    className="inline-flex items-center py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="mr-1">Role:</span>
                    <span className="font-medium">
            {roleFilter === 'all' ? 'All Roles' : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}
          </span>
                    <ChevronDown size={16} className="ml-1"/>
                </button>
                {isOpen && (
                    <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
                        <div className="py-1">
                            <button
                                onClick={() => {
                                    setRoleFilter('all');
                                    setIsOpen(false);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                All Roles
                            </button>
                            {Object.keys(TEAM_ROLES).map(role => (
                                <button
                                    key={role}
                                    onClick={() => {
                                        setRoleFilter(role);
                                        setIsOpen(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Render status filter dropdown
    const renderStatusFilter = () => {
        const [isOpen, setIsOpen] = useState(false);

        return (
            <div className="relative">
                <button
                    className="inline-flex items-center py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="mr-1">Status:</span>
                    <span className="font-medium">
            {statusFilter === 'all' ? 'All Statuses' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
          </span>
                    <ChevronDown size={16} className="ml-1"/>
                </button>
                {isOpen && (
                    <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
                        <div className="py-1">
                            <button
                                onClick={() => {
                                    setStatusFilter('all');
                                    setIsOpen(false);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                All Statuses
                            </button>
                            <button
                                onClick={() => {
                                    setStatusFilter('active');
                                    setIsOpen(false);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Active
                            </button>
                            <button
                                onClick={() => {
                                    setStatusFilter('inactive');
                                    setIsOpen(false);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Inactive
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const dialog = useDialog();

    // Main render
    return (
        <Layout>
            <div className="bg-gray-50 team">
                <LayoutNavigator
                    title={"Team Management"}
                    description={"Manage your ISP support team members and their roles"}
                />

                {/* Main content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Filters and controls */}
                    <div
                        className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                        <div className="flex-1 sm:max-w-sm">
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={18} className="text-gray-400"/>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search team members..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 outline-0 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md border-gray-300 p-2 border"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            {renderRoleFilter()}
                            {renderStatusFilter()}
                            <button
                                onClick={() => {
                                    const d = dialog.create({
                                        size: "lg",
                                        content: <CreateTeam handler={{
                                            dismiss: () => d.dismiss(),
                                            editingMember
                                        }}/>
                                    })
                                }}
                                className="inline-flex items-center py-2 px-3 border border-transparent rounded-md shadow-sm text-sm leading-4 font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <UserPlus size={16} className="mr-1"/>
                                Add Member
                            </button>
                        </div>
                    </div>

                    {/* Stats cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Total team members */}
                        <div className="bg-white rounded-lg shadow-sm p-5">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-blue-100 text-blue-800">
                                    <Users size={20}/>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-sm font-medium text-gray-500">Total Members</h3>
                                    <span className="text-2xl font-semibold">{isLoading ? '-' : members.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Active team members */}
                        <div className="bg-white rounded-lg shadow-sm p-5">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-green-100 text-green-800">
                                    <Activity size={20}/>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-sm font-medium text-gray-500">Active Members</h3>
                                    <span className="text-2xl font-semibold">
                  {isLoading ? '-' : members.filter(m => m.status === 'active').length}
                </span>
                                </div>
                            </div>
                        </div>

                        {/* Technicians */}
                        <div className="bg-white rounded-lg shadow-sm p-5">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-blue-100 text-blue-800">
                                    <Wifi size={20}/>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-sm font-medium text-gray-500">Technicians</h3>
                                    <span className="text-2xl font-semibold">
                  {isLoading ? '-' : members.filter(m => m.role === 'technician').length}
                </span>
                                </div>
                            </div>
                        </div>

                        {/* Support staff */}
                        <div className="bg-white rounded-lg shadow-sm p-5">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-green-100 text-green-800">
                                    <HelpCircle size={20}/>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-sm font-medium text-gray-500">Support Staff</h3>
                                    <span className="text-2xl font-semibold">
                  {isLoading ? '-' : members.filter(m => m.role === 'support').length}
                </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sort controls */}
                    <div className="mb-4 flex items-center justify-between bg-white rounded-lg shadow-sm py-3 px-4">
                        <div className="text-sm font-medium text-gray-500">
                            {filteredMembers.length} team member{filteredMembers.length !== 1 ? 's' : ''} found
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">Sort by:</span>
                            <button
                                onClick={() => handleSort('name')}
                                className={`text-sm font-medium flex items-center ${sortField === 'name' ? 'text-blue-600' : 'text-gray-700'}`}
                            >
                                Name
                                {renderSortIndicator('name')}
                            </button>
                            <button
                                onClick={() => handleSort('performance')}
                                className={`text-sm font-medium flex items-center ${sortField === 'performance' ? 'text-blue-600' : 'text-gray-700'}`}
                            >
                                Performance
                                {renderSortIndicator('performance')}
                            </button>
                        </div>
                    </div>

                    {/* Team member list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {isLoading ? (
                            // Skeleton loading state
                            Array(6).fill(0).map((_, i) => (
                                <div key={i}
                                     className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 animate-pulse">
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                                                <div className="ml-3">
                                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                                    <div className="mt-1 h-3 bg-gray-200 rounded w-16"></div>
                                                </div>
                                            </div>
                                            <div className="h-6 w-12 bg-gray-200 rounded"></div>
                                        </div>
                                        <div className="mt-2">
                                            <div className="h-3 bg-gray-200 rounded w-32 mb-3"></div>
                                            <div className="mt-4">
                                                <div className="h-2 bg-gray-200 rounded w-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : filteredMembers.length > 0 ? (
                            // Team member cards
                            filteredMembers.map(member => (
                                <TeamMemberCard
                                    key={member.id}
                                    member={member}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))
                        ) : (
                            // No results found
                            <div
                                className="col-span-full flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm border border-gray-100">
                                <Filter size={40} className="text-gray-300 mb-3"/>
                                <h3 className="text-gray-500 font-medium text-lg">No team members found</h3>
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setRoleFilter('all');
                                        setStatusFilter('all');
                                    }}
                                    className="mt-4 inline-flex items-center py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Add member
                                </button>
                            </div>
                        )}
                    </div>
                </div>


                {/* Simulated loading indicator for DB operations */}
                {isLoading && (
                    <div
                        className="fixed bottom-5 right-5 bg-white rounded-full shadow-lg p-3 flex items-center animate-fadeIn">
                        <div className="animate-spin mr-2">
                            <Loader size={16} className="text-blue-600"/>
                        </div>
                        <span className="text-sm font-medium text-gray-700">Loading team data...</span>
                    </div>
                )}


            </div>
        </Layout>
    );
}