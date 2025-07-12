import { FaRegHeart, FaRegStar } from "react-icons/fa";

const FeaturedCard = () => {
  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=686&q=80"
          alt="Floral dress"
          className="w-full h-80 object-cover"
        />
        <div className="absolute top-2 right-2">
          <button className="p-2 rounded-full bg-white text-gray-700 hover:bg-pink-100 hover:text-pink-600 transition-colors duration-300">
            <FaRegHeart />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <span className="text-xs font-semibold text-white">New Arrival</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              <a href="#">
                <span aria-hidden="true" className="absolute inset-0"></span>
                Floral Summer Dress
              </a>
            </h3>
            <p className="mt-1 text-sm text-gray-500">Women's Dress</p>
          </div>
          <p className="text-sm font-medium text-pink-600">$39.99</p>
        </div>
        <div className="mt-4 flex space-x-2">
          <FaRegStar />
          <FaRegStar />
          <FaRegStar />
          <FaRegStar />
          <FaRegStar />
        </div>
        <div className="mt-4">
          <button className="w-full bg-midnight-navy hover:bg-off-white-linen text-white py-2 px-4 rounded-full text-sm font-medium">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};
export default FeaturedCard;
