export interface Package {
    id: number;
    name: string;
    price: number;
    speed: string;
    duration: string;
    subscribers: number;
    status: "active" | "inactive";
    created: string;
    router_id?: number;
    router_identity?: string;
    type: "ppoe" | "hotspot";
}

export interface Router {
    id: number;
    name: string;
    ip_address: string;
    location: string;
    username: string;
    password: string;
    identity: string
}

export interface NewPackage {
    name: string;
    price: string;
    speed: string;
    duration: string;
    durationUnit: "days" | "minutes" | "months";
    status: "active" | "inactive";
    router_id: number | null;
    router_identity?: string;
    type: "ppoe" | "hotspot";
}