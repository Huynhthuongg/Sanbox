import { Link } from "wouter";

export default function AuthPortal() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto pt-12 space-y-6">
        <h1 className="text-3xl font-black">Đăng nhập / Đăng ký</h1>
        <p className="text-sm text-white/70">
          Quy trình OAuth (Google/GitHub) được xử lý qua Clerk. Bấm nút bên dưới để vào trang xác thực chính thức.
        </p>
        <div className="grid gap-3">
          <Link href="/sign-in" className="rounded-xl px-4 py-3 bg-cyan-400 text-black font-bold text-center">Tiếp tục với Google / GitHub</Link>
          <Link href="/sign-up" className="rounded-xl px-4 py-3 border border-white/20 font-semibold text-center">Tạo tài khoản mới</Link>
        </div>
      </div>
    </div>
  );
}
