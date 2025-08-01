/* eslint-disable no-unused-vars */
import {
  useGetUserCartQuery,
  useClearCartMutation,
  useUpdateCartItemMutation,
} from "../redux/api/cartApiSlice";
import { useCreateCheckoutSessionMutation } from "../redux/api/paymentApiSlice";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Cart = () => {
  const user = useSelector((state) => state.auth.user);
  const {
    data = [],
    isLoading,
    refetch,
  } = useGetUserCartQuery(undefined, { skip: !user });
  const [updateCart] = useUpdateCartItemMutation();
  const [clearCart] = useClearCartMutation();
  const [createCheckoutSession] = useCreateCheckoutSessionMutation();

  const controls = useAnimation();
  const [removingItemId, setRemovingItemId] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const navigate = useNavigate();

  const subtotal = data.reduce(
    (acc, item) => acc + item.productId.price * item.quantity,
    0
  );
  const tax = subtotal * 0.13;
  const total = subtotal + tax;

  useEffect(() => {
    controls.start({
      count: total,
      transition: { duration: 0.5, ease: "easeOut" },
    });
  }, [total]);

  const handleQuantityChange = async (productId, change) => {
    const item = data.find((item) => item.productId._id === productId);
    if (!item) return;

    const newQty = item.quantity + change;
    if (newQty < 0) return;

    setUpdatingItemId(productId);

    try {
      await updateCart({ productId, quantity: newQty }).unwrap();
      refetch();
    } catch (err) {
      toast.error(err.data?.message || "Error updating quantity");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemove = async (productId) => {
    setRemovingItemId(productId);
    try {
      await updateCart({ productId, quantity: 0 }).unwrap();
      refetch();
    } catch (err) {
      toast.error(err.data?.message || "Error removing item");
    } finally {
      setRemovingItemId(null);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart().unwrap();
      refetch();
      toast.success("Cart cleared!");
    } catch (err) {
      toast.error(err.data?.message || "Error clearing cart");
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    try {
      const res = await createCheckoutSession({ cartItems: data }).unwrap();

      if (res?.url) {
        window.location.href = res.url; // ⬅️ redirect to Stripe Checkout
      } else {
        toast.error("No checkout Url returned");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isLoading) return <p>Loading cart...</p>;

  return (
    <section className="max-w-6xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold mb-6">Your Cart</h2>

      {data.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 bg-white shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-4">Image</th>
                <th className="p-4">Name</th>
                <th className="p-4">Quantity</th>
                <th className="p-4"> Price</th>
                <th className="p-4">Total</th>
                <th className="p-4 text-right"></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {data.map((item) => (
                  <motion.tr
                    key={item._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="border-t"
                  >
                    <td className="p-4">
                      <img
                        src={item.productId.images[0]}
                        alt={item.productId.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td
                      className="p-4 font-semibold hover:underline cursor-pointer"
                      onClick={() =>
                        navigate(`/product-details/${item.productId._id}`)
                      }
                    >
                      {item.productId.name.slice(0, 15)}...
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                          onClick={() =>
                            handleQuantityChange(item.productId._id, -1)
                          }
                          disabled={
                            item.quantity <= 1 ||
                            updatingItemId === item.productId._id
                          }
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                          onClick={() =>
                            handleQuantityChange(item.productId._id, 1)
                          }
                          disabled={updatingItemId === item.productId._id}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      ${Number(item.productId.price).toFixed(2)}
                    </td>
                    <td className="p-4 font-semibold text-center">
                      {updatingItemId === item.productId._id ? (
                        <div
                          className="
                            inline-block
                            h-5 w-5
                            border-t-2 border-blue-500 border-solid
                            rounded-full
                            animate-spin
                          "
                          aria-label="Updating total"
                        />
                      ) : (
                        `$${(
                          Number(item.productId.price) * item.quantity
                        ).toFixed(2)}`
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <motion.button
                        onClick={() => handleRemove(item.productId._id)}
                        className="text-red-500 hover:underline text-sm cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={removingItemId === item.productId._id}
                      >
                        {removingItemId === item.productId._id
                          ? "Removing..."
                          : "Remove"}
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          <div className="mt-8 text-right space-y-2">
            <p className="text-sm">
              Subtotal:{" "}
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </p>
            <p className="text-sm">
              Tax (13% HST):{" "}
              <span className="font-semibold">${tax.toFixed(2)}</span>
            </p>
            <motion.p
              className="text-lg font-bold"
              animate={controls}
              initial={{ count: 0 }}
            >
              Total: <motion.span>${total.toFixed(2)}</motion.span>
            </motion.p>
          </div>

          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handleClearCart}
              className="text-sm text-gray-700 hover:text-red-600"
            >
              Clear Cart
            </button>

            <button
              onClick={handleCheckout}
              className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Cart;
