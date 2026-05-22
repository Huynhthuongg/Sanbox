import { Link } from "wouter";
import { isAuthEnabled } from "@/config/auth-mode";

export default function AuthPortal() {
  const signInHref = isAuthEnabled ? "/sign-in" : "/health-config";
  const signUpHref = isAuthEnabled ? "/sign-up" : "/health-config";

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto pt-12 space-y-6">
        <h1 className="text-3xl font-black">Đăng nhập / Đăng ký</h1>
        <p className="text-sm text-white/70">
          {isAuthEnabled
            ? "Quy trình OAuth (Google/GitHub) được xử lý qua Clerk. Bấm nút bên dưới để vào trang xác thực chính thức."
            : "Auth đang chạy ở chế độ public nên đăng nhập/đăng ký tạm thời không khả dụng. Mở Health Config để xem biến môi trường cần thiết."}
        </p>
        <div className="grid gap-3">
          <Link href={signInHref} className="rounded-xl px-4 py-3 bg-cyan-400 text-black font-bold text-center">
            {isAuthEnabled ? "Tiếp tục với Google / GitHub" : "Mở Health Config"}
          </Link>
          <Link href={signUpHref} className="rounded-xl px-4 py-3 border border-white/20 font-semibold text-center">
            {isAuthEnabled ? "Tạo tài khoản mới" : "Xem cấu hình auth"}
          </Link>
        </div>
      </div>
    </div>
  );
}
