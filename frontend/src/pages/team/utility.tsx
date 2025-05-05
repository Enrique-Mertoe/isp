import {HelpCircle, Sliders, Users, Wifi} from "lucide-react";

export const TEAM_ROLES = {
    'technician': {color: 'bg-blue-100 text-blue-800', icon: <Wifi size={16}/>},
    'support': {color: 'bg-green-100 text-green-800', icon: <HelpCircle size={16}/>},
    'admin': {color: 'bg-purple-100 text-purple-800', icon: <Users size={16}/>},
    'manager': {color: 'bg-amber-100 text-amber-800', icon: <Sliders size={16}/>}
};