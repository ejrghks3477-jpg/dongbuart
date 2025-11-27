"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase"; // 경로 주의!

type AuthMode = "login" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // 현재 로그인한 유저 확인
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error(error);
        return;
      }
      setUserEmail(data.user?.email ?? null);
    };
    fetchUser();
  }, []);

  // 로그인 / 회원가입 처리
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        // 회원가입
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        setMessage(
          "회원가입 성공!\n(이메일 인증이 켜져 있으면, 메일을 확인해서 인증까지 해줘야 로그인 됩니다.)"
        );
      } else {
        // 로그인
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        setUserEmail(data.user?.email ?? null);
        setMessage("로그인 성공!");
      }
    } catch (err: any) {
      console.error(err);
      setMessage(err.message ?? "에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃
  const handleLogout = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUserEmail(null);
      setMessage("로그아웃 되었습니다.");
    } catch (err: any) {
      console.error(err);
      setMessage(err.message ?? "로그아웃 중 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-700 rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl font-bold mb-1">로그인 / 회원가입</h1>
        <p className="text-sm text-slate-400 mb-4">
          이메일과 비밀번호로 로그인하거나 새로 가입할 수 있는 페이지입니다.
        </p>

        {/* 로그인 / 회원가입 모드 스위치 */}
        <div className="flex mb-4 rounded-full bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 text-sm rounded-full transition ${
              mode === "login"
                ? "bg-emerald-500 text-slate-900 font-semibold"
                : "text-slate-300"
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 text-sm rounded-full transition ${
              mode === "signup"
                ? "bg-emerald-500 text-slate-900 font-semibold"
                : "text-slate-300"
            }`}
          >
            회원가입
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">이메일</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">비밀번호</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="6자 이상 입력"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? "처리 중..."
              : mode === "login"
              ? "로그인하기"
              : "회원가입하기"}
          </button>
        </form>

        {/* 로그인 되어 있을 때 */}
        {userEmail && (
          <div className="mt-4 p-3 rounded-lg bg-slate-800 text-sm flex items-center justify-between">
            <div>
              <div className="text-slate-300">현재 로그인한 계정</div>
              <div className="font-mono text-xs text-emerald-400">
                {userEmail}
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="ml-2 text-xs px-3 py-1 rounded-full bg-slate-700 hover:bg-slate-600"
            >
              로그아웃
            </button>
          </div>
        )}

        {/* 에러 / 안내 메시지 */}
        {message && (
          <div className="mt-3 text-xs text-amber-300 bg-amber-900/40 rounded-lg px-3 py-2 whitespace-pre-line">
            {message}
          </div>
        )}

        <p className="mt-4 text-xs text-slate-500">
          메인으로 돌아가려면 주소창에{" "}
          <span className="font-mono text-emerald-400">
            / (슬래시만)
          </span>{" "}
          또는{" "}
          <span className="font-mono text-emerald-400">/storage</span>,{" "}
          <span className="font-mono text-emerald-400">/car</span> 같은
          경로를 입력해서 이동할 수 있어요.
        </p>
      </div>
    </div>
  );
}