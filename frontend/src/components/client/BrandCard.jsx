import { Link } from "react-router-dom";

const BrandCard = ({ brand }) => {
  return (
    <Link
      to={`/client/brands/${brand._id}`}
      className="flex flex-col items-center bg-white p-4 rounded-xl shadow hover:shadow-lg transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={`عرض تفاصيل الماركة ${brand.name}`}
    >
      <img
        src={brand.logo}
        alt={brand.name}
        className="w-24 h-24 object-contain mb-2"
        loading="lazy"
        decoding="async"
      />
      <h3 className="text-lg font-semibold text-gray-700 text-center">{brand.name}</h3>
    </Link>
  );
};

export default BrandCard;
