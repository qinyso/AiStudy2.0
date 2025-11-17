import {Navigate,Outlet} from 'react-router-dom';
const PrivateRoute=()=>{
    const isAuthenticated =!! localStorage.getItem('authToken');
    return isAuthenticated?(<Outlet/>):(<Navigate to="/Enter" state={{ from:window.location.pathname}}replace/>);
}
export default PrivateRoute;