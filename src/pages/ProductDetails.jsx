import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { useParams } from "react-router-dom"
import { useCart } from "../context/CartContext";

export default function ProductDetails() {
  const { id } = useParams();
  const [product , setProduct] = useState(null);
  const [isLoading , setIsloading] = useState(true);
  const { addToCart } = useCart();
  
  const handelAdding = () =>{
    console.log("handelAdding")
    let product2 = {
      id: id , 
      title: product.title,
      price: product.price,
      image: product.images[0]
    }
    addToCart(product2)
  }


  function discount(price, percent) {
    let discountValue = price * percent; 
    let result = price - discountValue;
    return result.toFixed(2);
  }

  useEffect(()=>{
      fetch(`https://dummyjson.com/products/${id}`)
        .then((res)=> res.json())
        .then((data) => {
          console.log(data)
          setProduct(data);
          setIsloading(false);
        })
    }
  ,[]);

  if (isLoading) {
    return <div className="flex justify-center items-center w-full h-screen">
      Data is loading....
    </div>
  }


  return (
    <div className="flex gap-4 justify-between">
      <div  className="flex w-full justify-center items-center">
        <img src={product.images[0]} alt="product" />
      </div>
      <div className="product-info  flex flex-col gap-2 max-w-1/2 h-screen justify-center">
        <h2 className="text-2xl">{product.title}</h2>
        
        <div className="flex gap-2 items-center">
          <div className="flex gap-0.5">
            <FaStar />
            <FaStar />
            <FaStar />
          </div>
          <p> {product.rating} by {product.reviews.length} user</p>
        </div>
        <div className="flex gap-2 border border-blue-500 rounded-xl w-fit p-2">
          <div >
            <p className="text-lg">${discount(product.price , 10.48/100 )}</p>
            <del className="text-red-700 opacity-60">${product.price}</del>
          </div>
          <div className="flex justify-center items-center flex-col text-red-700" >
            <p>{parseInt(product.discountPercentage)}%</p> 
            <p>DISCOUND</p>            
          </div>
        </div>
        <p>{product.description}</p>
        
        <h3>Categories:</h3>
        <div className="">
          <p className="border w-fit p-1 border-blue-600 rounded-md bg-blue-500 text-white">{product.category}</p>
        </div>
        <button onClick={handelAdding} className="btn">Add to cart 🛒</button>
      </div>
    </div>
  )
}
