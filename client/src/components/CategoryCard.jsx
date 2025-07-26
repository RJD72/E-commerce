import { DirectionAwareHover } from "../components/ui/direction-aware-hover";

const CategoryCard = ({ imageUrl, category }) => {
  return (
    <div className=" relative  flex items-center justify-center w-full">
      <DirectionAwareHover imageUrl={imageUrl}>
        <p className="font-bold text-xl capitalize">{category}</p>
      </DirectionAwareHover>
    </div>
  );
};
export default CategoryCard;
