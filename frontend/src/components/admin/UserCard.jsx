import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

const roleLabels = {
  admin: "مسؤول",
  client: "عميل",
};

const tierLabels = {
  Retail: "عادي",
  Wholesale: "جملة",
  "Super Wholesale": "جملة كبرى",
};

const UserCard = ({ user, onDelete }) => {
  const navigate = useNavigate();
  const [loadingAction, setLoadingAction] = useState(false);

  const handleNavigation = (path) => {
    if (loadingAction) return;
    setLoadingAction(true);
    navigate(path);
  };

  const handleDelete = async () => {
    if (loadingAction) return;
    setLoadingAction(true);
    await onDelete(user._id);
    setLoadingAction(false);
  };

  return (
    <Card className="p-4 flex flex-col justify-between space-y-3 shadow-sm rounded-2xl">
      <div>
        <h3 className="font-semibold text-lg">{user.name}</h3>
        <p className="text-sm text-gray-600">📞 {user.phoneNumber || "غير متوفر"}</p>
        <p className="text-sm">🧾 الدور: {roleLabels[user.role] || user.role}</p>
        {user.role !== "admin" && (
          <p className="text-sm">🏷️ الفئة: {tierLabels[user.tier] || user.tier}</p>
        )}
        {user.totalDebt > 0 && (
          <p className="text-red-600 text-sm font-medium">
            💰 الدين: {user.totalDebt.toFixed(2)} دج
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-between gap-2 pt-2">
        <Button
          onClick={() => handleNavigation(`/admin/users/${user._id}`)}
          className="text-sm"
          disabled={loadingAction}
        >
          التفاصيل
        </Button>

        <Button
          onClick={() => handleNavigation(`/admin/users/${user._id}/edit`)}
          variant="outline"
          className="text-sm"
          disabled={loadingAction}
        >
          تعديل
        </Button>

        <Button
          variant="destructive"
          onClick={handleDelete}
          className="text-sm"
          disabled={loadingAction}
        >
          حذف
        </Button>
      </div>
    </Card>
  );
};

export default UserCard;
