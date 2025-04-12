import {useState} from "react";
import Config from "../assets/config.ts";
import request from "../build/request.ts";

type SignInData = {
    email: string;
    password: string;
};

type SignInResponse = FetchResponse<object> & {};

export const useSignIn = () => {
    const [loading,] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const signIn = async ({email, password}: SignInData): Promise<SignInResponse> => {
        setError(null);
        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);
            const response = await request.post(Config.authUrl, formData);
            console.log(response)
            return response.data;
        } catch (err: any) {
            const errMsg =
                err.response?.data?.error ||
                err.message ||
                'An unexpected error occurred';

            return {ok: false, error: errMsg};
        }
    };

    return {signIn, loading, error};
};