"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [comments, setComments] = useState([]);

  // 댓글 불러오기
  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .order("id", { ascending: false });

    if (!error) {
      setComments(data || []);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  // 댓글 작성
  const addComment = async () => {
    if (!username.trim() || !message.trim()) return;

    const { error } = await supabase.from("comments").insert({
      username,
      message,
    });

    if (!error) {
      setUsername("");
      setMessage("");
      fetchComments();
    }
  };

  // 댓글 삭제
  const deleteComment = async (id: number) => {
    await supabase.from("comments").delete().eq("id", id);
    fetchComments();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "40px 16px",
        color: "white",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 520 }}>

        {/* 상단 대분류 버튼 영역 */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <Link
            href="/"
            style={{
              flex: 1,
              textAlign: "center",
              padding: "8px 10px",
              borderRadius: 999,
              border: "1px solid #22c55e",
              background: "#22c55e",
              color: "#020617",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            자유 게시판
          </Link>

          <Link
            href="/storage"
            style={{
              flex: 1,
              textAlign: "center",
              padding: "8px 10px",
              borderRadius: 999,
              border: "1px solid #4b5563",
              background: "#020617",
              color: "#e5e7eb",
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            수장고 관리
          </Link>

          <Link
            href="/vehicle"
            style={{
              flex: 1,
              textAlign: "center",
              padding: "8px 10px",
              borderRadius: 999,
              border: "1px solid #4b5563",
              background: "#020617",
              color: "#e5e7eb",
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            차량 관리
          </Link>
        </div>

        {/* 메인 카드 박스 */}
        <div
          style={{
            width: "100%",
            background: "rgba(15,23,42,0.95)",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            border: "1px solid rgba(148,163,184,0.4)",
          }}
        >
          <h2
            style={{
              fontSize: 14,
              letterSpacing: 2,
              color: "#60a5fa",
              marginBottom: 10,
            }}
          >
            DONGBUART
          </h2>

          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
            방명록 / 댓글 게시판
          </h1>

          <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 20 }}>
            닉네임이랑 하고 싶은 말 아무거나 남겨보세요 :)
          </p>

          {/* 입력 폼 */}
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="닉네임"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid #334155",
              background: "#0f172a",
              marginBottom: 10,
              fontSize: 14,
              color: "white",
            }}
          />

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지 입력..."
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid #334155",
              background: "#0f172a",
              marginBottom: 12,
              fontSize: 14,
              color: "white",
              height: 80,
            }}
          />

          <button
            onClick={addComment}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 12,
              background: "#22c55e",
              border: "none",
              color: "#020617",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              marginBottom: 18,
            }}
          >
            작성하기
          </button>

          <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12 }}>
            총 {comments.length}개의 댓글
          </p>

          {/* 댓글 목록 */}
          {comments.map((item) => (
            <div
              key={item.id}
              style={{
                background: "#0f172a",
                padding: 16,
                borderRadius: 12,
                marginBottom: 12,
                border: "1px solid #1e293b",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <strong>{item.username}</strong>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>

              <p style={{ marginBottom: 10 }}>{item.message}</p>

              {/* 삭제 버튼 */}
              <button
                onClick={() => deleteComment(item.id)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  background: "#ef4444",
                  color: "white",
                  fontSize: 12,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}