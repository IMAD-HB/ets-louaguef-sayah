const getProductPriceForUser = (product, user) => {
  const key = product._id.toString();

  if (user?.customPrices && user.customPrices[key] !== undefined) {
    return user.customPrices[key];
  }

  if (!user?.tier) {
    return product.basePrices?.Retail ?? 0; // Default to Retail if no tier
  }

  return product.basePrices[user.tier] ?? product.basePrices?.Retail ?? 0;
};

export default getProductPriceForUser;
