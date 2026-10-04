import Header from "../components/Header";
import { Outlet } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Layout() {
const { apiError, dismissApiError } = useCart();
return (
    <>
    <Header />
       <main className="pt-20">
        {apiError && <div className="api-error-banner" role="alert"><span>{apiError}</span><button type="button" onClick={dismissApiError} aria-label="Dismiss error">Dismiss</button></div>}
        <Outlet />
       </main>
    </>
  )
}
