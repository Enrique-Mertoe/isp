import {useEffect} from 'react';
import {Routes, Route, useLocation} from 'react-router-dom';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import HomePage from "./pages/Home.tsx";
import ClientsPage from "./pages/ClientsPage.tsx";
import SignInPage from "./pages/auth/SignInPage.tsx";
import PackagesPage from "./pages/PackagesPage.tsx";
import RoutersPage from "./pages/RoutersPage.tsx";
import {AppProvider} from "./ui/AppContext.tsx";
import ISPPage from "./pages/ISPPage.tsx";
import SignUpPage from "./pages/auth/SignUpPage.tsx";
import RouterView from "./pages/RouterView.tsx";
// import PaymentAndBillingPage from "./pages/PaymentAndBillingPage.tsx";
import PaymentsPage from "./pages/PaymentsPage.tsx";
import ManagementPage from "./pages/ManagementPage.tsx";

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
                <Route path="/users/" element={<ClientsPage/>}/>
                <Route path="/isp/" element={<ISPPage/>}/>
                <Route path="/packages/" element={<PackagesPage/>}/>
                <Route path="/payments/" element={<PaymentsPage/>}/>
                <Route path="/management/" element={<ManagementPage/>}/>
                <Route path="/mikrotiks/" element={<RoutersPage/>}/>
                <Route path="/mikrotiks/:pk/" element={<RouterView/>}/>
                <Route path="/auth/login/" element={<SignInPage/>}/>
                <Route path="/auth/register/" element={<SignUpPage/>}/>
            </Routes>
        </AppProvider>
    );
}

export default RouterAwareApp;