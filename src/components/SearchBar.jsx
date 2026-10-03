import { useEffect, useState } from "react";
import PropTypes from "prop-types";

export default function SearchBar({ products , setVisableProducts}) {
  const [q, setQ] = useState("");

  useEffect(()=>{
    const query = q.trim().toLowerCase();
    setVisableProducts(products.filter((product) => product.title.toLowerCase().includes(query)));
  }, [q, products, setVisableProducts])

  return (
    <input
      value={q}
      onChange={(e) => {
        setQ(e.target.value);
      }}
      placeholder="Search products…"
    />
  );
}

SearchBar.propTypes = {
  products: PropTypes.arrayOf(PropTypes.object).isRequired,
  setVisableProducts: PropTypes.func.isRequired,
};