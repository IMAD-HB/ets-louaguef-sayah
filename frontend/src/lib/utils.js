export const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
