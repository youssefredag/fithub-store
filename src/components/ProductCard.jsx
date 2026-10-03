import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function ProductCard({id , name="Unknown Title" , price="$999" , image}) {
   const salePrice = (price * 0.99).toFixed(2);
    const { addToCart } = useCart();
    const [isImageOpen, setIsImageOpen] = useState(false);

    const handelAdding = () =>{
      const product = {
        id:id , 
        title: name,
        price: price,
        image: image
      }
      addToCart(product)
    }

   return (
    <>
    <article className="product-card">
      <button type="button" className="image-preview-trigger" onClick={() => setIsImageOpen(true)} aria-label={`View a larger image of ${name}`}>
        <img src={image} alt={name} />
      </button>
      <h3>
        <Link className="hover:text-blue-600" to={`/products/${id}`}>
          {name}
        </Link>
      </h3>
      <p>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Laboriosam
        sint mollitia vero eos voluptate
      </p>
      <p>salePrice: ${salePrice}</p>
      <del>Price: ${price}</del>
      <button onClick={handelAdding} className="btn">Add to cart 🛒</button>
    </article>
    {isImageOpen && (
      <div className="image-modal" role="dialog" aria-modal="true" aria-label={`${name} image`} onClick={() => setIsImageOpen(false)}>
        <div className="image-modal-content" onClick={(event) => event.stopPropagation()}>
          <button type="button" className="image-modal-close" onClick={() => setIsImageOpen(false)} aria-label="Close image preview">×</button>
          <img src={image} alt={name} />
        </div>
      </div>
    )}
    </>
  );
}

export default ProductCard;
