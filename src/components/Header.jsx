import { useState } from "react";
import { FaBars } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FaRegHeart, FaRegUser } from "react-icons/fa";

export default function Header() {
    const [menuState, setMenuState] = useState("closed");
    const { items, wishlist, user, signOut } = useCart();
    const cartCount = items.reduce((count, item) => count + item.qty, 0);

    function toggleMenu() {
        setMenuState((prev) => (prev === "closed" ? "opened" : "closed"));
    }

    return (
        <header className="site-header fixed top-0 left-0 z-50 w-full h-20 bg-white border-b-2 border-gray-100">
            <div className="w-full max-w-7xl h-full mx-auto px-4 flex items-center justify-between">
                
                <h1>
                    <Link to="/" className="brand">
                        FIT<span>HUB</span>
                    </Link>
                </h1>

                <nav className="relative flex items-center gap-6">
                    <ul className="hidden md:flex items-center gap-6">
                        <li>
                            <NavLink className="hover:text-blue-600" end to="/">
                                Home
                            </NavLink>
                        </li>

                        <li>
                            <NavLink className="hover:text-blue-600" end to="/products">
                                Products
                            </NavLink>
                        </li>

                        <li><NavLink className="hover:text-blue-600" to="/categories">Categories</NavLink></li>
                        <li><NavLink className="hover:text-blue-600" to="/brands">Brands</NavLink></li>

                        <li>
                            <NavLink className="hover:text-blue-600" end to="/about">
                                About
                            </NavLink>
                        </li>
                    </ul>

                    <div className="header-actions">
                        <Link to="/wishlist" className="header-icon" aria-label={`Wishlist, ${wishlist.length} items`}><FaRegHeart /><span>{wishlist.length}</span></Link>
                        <Link to={user ? '/orders' : '/login'} className="header-icon" aria-label={user ? 'Your orders' : 'Sign in'}><FaRegUser /><span>{user ? user.name.split(' ')[0] : 'Account'}</span></Link>
                        {user && <button className="header-signout" type="button" onClick={signOut}>Sign out</button>}
                        <Link to="/cart" className="btn btn-primary">Cart <span>{cartCount}</span></Link>
                    </div>
                    
                    <button
                        type="button"
                        onClick={toggleMenu}
                        className="md:hidden"
                        aria-label="Toggle menu"
                    >
                        {menuState === "closed" ? (
                            <FaBars size={32} />
                        ) : (
                            <FaXmark size={32} />
                        )}
                    </button>

                    {menuState === "opened" && (
                        <ul className="mobile-menu md:hidden">
                            <li><NavLink end to="/" onClick={toggleMenu}>Home</NavLink></li>
                            <li><NavLink to="/products" onClick={toggleMenu}>Products</NavLink></li>
                            <li><NavLink to="/categories" onClick={toggleMenu}>Categories</NavLink></li>
                            <li><NavLink to="/brands" onClick={toggleMenu}>Brands</NavLink></li>
                            <li><NavLink to="/about" onClick={toggleMenu}>About</NavLink></li>
                            <li><Link to="/wishlist" onClick={toggleMenu}>Wishlist ({wishlist.length})</Link></li>
                            <li><Link to="/orders" onClick={toggleMenu}>Orders</Link></li>
                            <li><Link to="/addresses" onClick={toggleMenu}>Addresses</Link></li>
                            <li><Link to="/cart" onClick={toggleMenu}>Cart ({cartCount})</Link></li>
                            <li><Link to={user ? '/orders' : '/login'} onClick={toggleMenu}>{user ? user.name : 'Account'}</Link></li>
                        </ul>
                    )}
                </nav>
            </div>
        </header>
    );
}
