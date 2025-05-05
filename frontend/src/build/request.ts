// axiosConfig.js
import axios, {AxiosRequestConfig} from 'axios';
import {getCookie} from "../hooks/useCsrf.ts";
import Config from "../assets/config.ts";

function toFormData(obj: Record<string, any>): FormData {
    const formData = new FormData();
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] !== undefined && obj[key] !== null) {
            formData.append(key, obj[key]);
        }
    }
    return formData;
}

export const request = axios.create({
    baseURL: Config.baseURL,
    withCredentials: true,
    headers: {
        // 'Content-Type': 'application/json'
    }
});
if (Config.baseURL.length > 0)
    request.interceptors.response.use(
        response => response,
        async error => {
            if (error.response && error.response.status === 403) {
                console.warn('CSRF token might be expired. Refreshing...');
                try {
                    await request.get('/api/csrf/');
                    request.defaults.headers['X-CSRFToken'] = getCookie('csrftoken');
                    return request.request(error.config);
                } catch (refreshError) {
                    console.error('Failed to refresh CSRF token.', refreshError);
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );

type RequestResponse<T> = {
    data: T
}

type RequestError = {
    message: string;
    status: number;
}


interface RequestInterface<T> {
    url: string;
    data: Record<string, unknown> | FormData;
    config?: AxiosRequestConfig
    success?: (response: RequestResponse<T>) => void;
    error?: (response: RequestError) => void;
    complete?: Closure;
    // ...more
}

function post<T>(
    options: RequestInterface<T>
) {
    const useFormData = !(options.data instanceof FormData) && !options?.config?.headers?.['Content-Type'];
    const payload = useFormData ? toFormData(options.data) : options.data;
    const h = {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        then_cb: (_: RequestResponse<T>) => {

        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        catch_cb: (_: RequestError) => {
        },
        done_cb: () => {
        }
    };

    (async () => {
        try {
            const response = await request.post<T>(options.url, payload, {
                ...options.config,
                headers: {
                    ...(useFormData ? {'Content-Type': 'multipart/form-data'} : {}),
                    ...options.config?.headers,
                },
            });

            const res: RequestResponse<T> = {data: response.data};

            options.success?.(res);
            h.then_cb(res);
        } catch (error: any) {
            const err: RequestError = {
                message: error?.response?.data?.error || error.message || 'Request failed.',
                status: error?.response?.status,
            };
            options.error?.(err);
            h.catch_cb?.(err);
        } finally {
            options.complete?.();
            h.done_cb?.();
        }
    })();
    return {
        then(fn: (response: RequestResponse<T>) => void) {
            h.then_cb = fn;
            return this;
        },
        catch(fn: (error: RequestError) => void) {
            h.catch_cb = fn;
            return this;
        },
        done(fn: () => void) {
            h.done_cb = fn;
            return this;
        }
    };
}

function get<T>(
    options: RequestInterface<T>
) {
    const h = {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        then_cb: (_: RequestResponse<T>) => {

        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        catch_cb: (_: RequestError) => {
        },
        done_cb: () => {
        }
    };

    (async () => {
        try {
            const response = await request.get<T>(options.url, {
                ...options.config,
                params: options.data, // For GET requests, data is passed as query parameters
                headers: {
                    ...options.config?.headers,
                },
            });

            const res: RequestResponse<T> = {data: response.data};

            options.success?.(res);
            h.then_cb(res);
        } catch (error: any) {
            const err: RequestError = {
                message: error?.response?.data?.error || error.message || 'Request failed.',
                status: error?.response?.status,
            };
            options.error?.(err);
            h.catch_cb?.(err);
        } finally {
            options.complete?.();
            h.done_cb?.();
        }
    })();
    return {
        then(fn: (response: RequestResponse<T>) => void) {
            h.then_cb = fn;
            return this;
        },
        catch(fn: (error: RequestError) => void) {
            h.catch_cb = fn;
            return this;
        },
        done(fn: () => void) {
            h.done_cb = fn;
            return this;
        }
    };
}

// Update the exported object to include the get function
export const $ = {
    post,
    get
}
export default request;
