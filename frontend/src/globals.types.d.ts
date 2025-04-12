declare type FetchResponse<T> = {
    ok?: boolean;
    data?: T;
    error?: string[];
    message?: string;
    rdr?: string
}
type Dict<T = unknown> = Record<string, T>