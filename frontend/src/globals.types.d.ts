declare type FetchResponse<T> = {
    ok?: boolean;
    data?: T;
    error?: string[];
    message?: string;
    rdr?: string
}
type Dict<T = unknown> = Record<string, T>

type NavItemType = {
    label: string;
    icon: string;
    link: string;
    badge?: number | string;
}
type Mikrotik = {
    id: string;
    name: string;
    ip_address: string;
    location: string;
    username: string;
}

type NetPackage = {
    id: string;
    name: string;
    price: string;
    upload_speed: string;
    download_speed: string;
    type: string;
    router: Mikrotik;
};

type UserInfo = {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'user';
    due_amount: number;

    package: NetPackage;
    // router: Mikrotik;
};

type RoutersResponse = {
    routers: Mikrotik[];
    all_count: number;
    active_count: number;
    inactive_count: number;
};