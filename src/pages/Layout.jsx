import Header from "../components/Header";
import { Outlet } from "react-router-dom";

export default function Layout() {
return (
    <>
    <Header />
       <main className="pt-20">
        <Outlet />
       </main>
    </>
  )
}
