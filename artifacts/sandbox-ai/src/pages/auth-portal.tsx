import { Link } from "wouter";
import { envChecklist, isAuthEnabled } from "@/config/auth-mode";

export default function AuthPortal() {
  const missingRequiredEnv = envChecklist.filter((item) => item.required && !item.value).map((item) => item.key);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto pt-12 space-y-6">
        <h1 className="text-3xl font-black">Đăng nhập / Đăng ký</h1>

        {isAuthEnabled ? (
          <p className="text-sm text-white/70">
            Quy trình OAuth (Google/GitHub) được xử lý qua Clerk. Bấm nút bên dưới để vào trang xác thực chính thức.
          </p>
        ) : (
          <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm text-yellow-100 space-y-2">
            <p className="font-semibold">Auth đang tắt ở môi trường hiện tại nên chưa thể đăng nhập.</p>
            {missingRequiredEnv.length > 0 && (
              <p className="text-yellow-200/90">Thiếu biến: {missingRequiredEnv.join(", ")}</p>
            )}
            <p className="text-yellow-200/90">Vào trang Health Config để kiểm tra cấu hình chi tiết.</p>
          </div>
        )}

        <div className="grid gap-3">
          {isAuthEnabled ? (
            <>
              <Link href="/sign-in" className="rounded-xl px-4 py-3 bg-cyan-400 text-black font-bold text-center">Tiếp tục với Google / GitHub</Link>
              <Link href="/sign-up" className="rounded-xl px-4 py-3 border border-white/20 font-semibold text-center">Tạo tài khoản mới</Link>
            </>
          ) : (
            <Link href="/health-config" className="rounded-xl px-4 py-3 bg-cyan-400 text-black font-bold text-center">Mở Health Config</Link>
          )}
        </div>
      </div>
    </div>
  );
}
