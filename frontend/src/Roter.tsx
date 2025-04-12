import {useEffect} from 'react';
import {Routes, Route, useLocation} from 'react-router-dom';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import HomePage from "./pages/Home.tsx";
import UsersPage from "./pages/UsersPage.tsx";
import SignInPage from "./pages/auth/SignInPage.tsx";
import PackagesPage from "./pages/PackagesPage.tsx";
import MikroTikPage from "./pages/MikroTikPage.tsx";
import 'flowbite';
import {AppProvider} from "./ui/AppContext.tsx";

function RouterAwareApp() {
    const location = useLocation();

    useEffect(() => {
        NProgress.start();
        NProgress.done();
    }, [location]);

    return (
        <AppProvider>
            <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/users" element={<UsersPage/>}/>
                <Route path="/packages" element={<PackagesPage/>}/>
                <Route path="/mikrotiks" element={<MikroTikPage/>}/>
                <Route path="/auth/login" element={<SignInPage/>}/>
            </Routes>
        </AppProvider>
    );
}

export default RouterAwareApp;