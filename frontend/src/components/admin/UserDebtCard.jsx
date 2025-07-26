import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { toast } from "react-toastify";

const UserDebtCard = ({ user, onSettle }) => {
  const [newDebt, setNewDebt] = useState(user.totalDebt || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSettle = async () => {
    const parsedDebt = parseFloat(newDebt);

    if (isNaN(parsedDebt) || parsedDebt < 0) {
      toast.error("الرجاء إدخال مبلغ صالح (0 أو أكثر)");
      return;
    }

    const confirmed = window.confirm(
      `هل تريد تحديث المديونية إلى ${parsedDebt} د.ج؟`
    );
    if (!confirmed || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSettle(user._id, parsedDebt);
      toast.success("✅ تم تحديث المديونية بنجاح");
    } catch (err) {
      toast.error("حدث خطأ أثناء تحديث المديونية");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{user.name}</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full space-y-2">
          <p className="text-sm text-muted-foreground">
            رقم الهاتف: {user.phoneNumber || "—"}
          </p>

          <div>
            <label
              htmlFor={`debt-${user._id}`}
              className="text-sm font-medium block mb-1"
            >
              المديونية (د.ج)
            </label>
            <input
              id={`debt-${user._id}`}
              type="number"
              min="0"
              value={newDebt}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  setNewDebt(""); // allow clearing input
                } else if (!isNaN(value) && parseFloat(value) >= 0) {
                  setNewDebt(value);
                }
              }}
              className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
        </div>

        <Button
          variant="destructive"
          onClick={handleSettle}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? "جار التحديث..." : "تحديث"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserDebtCard;
