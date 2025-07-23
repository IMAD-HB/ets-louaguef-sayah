import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import { toast, ToastContainer } from "react-toastify";
import { useRef } from "react";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const isSubmittingRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;

    try {
      const { data: res } = await API.post("/auth/login", data);
      login(res.user);

      navigate(res.user.role === "admin" ? "/admin" : "/client");
    } catch (err) {
      toast.error("❌ اسم المستخدم أو كلمة المرور غير صحيحة");
    } finally {
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 1000); // throttle duration
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-gray-100 w-full max-w-md p-6 sm:p-8 rounded-xl shadow-md space-y-5"
        noValidate
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">تسجيل الدخول</h2>

        <div>
          <label htmlFor="username" className="block mb-1 font-medium text-gray-700">
            اسم المستخدم
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            {...register("username", { required: "مطلوب" })}
            className="w-full border border-gray-300 p-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-invalid={!!errors.username}
            aria-describedby="username-error"
          />
          {errors.username && (
            <p id="username-error" className="text-red-500 text-sm mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block mb-1 font-medium text-gray-700">
            كلمة المرور
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password", {
              required: "مطلوب",
              minLength: {
                value: 8,
                message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
              },
            })}
            className="w-full border border-gray-300 p-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-invalid={!!errors.password}
            aria-describedby="password-error"
          />
          {errors.password && (
            <p id="password-error" className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "جارٍ التحقق..." : "دخول"}
        </button>

        <ToastContainer position="top-center" rtl />
      </form>
    </div>
  );
}

export default Login;
