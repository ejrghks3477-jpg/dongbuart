"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

type Comment = {
  id: number
  username: string | null
  message: string | null
  created_at: string
}

export default function Home() {
  const [comments, setComments] = useState<Comment[]>([])
  const [message, setMessage] = useState("")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    fetchComments()
  }, [])

  // 댓글 목록 불러오기
  async function fetchComments() {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setComments((data ?? []) as Comment[])
  }

  // 댓글 추가
  async function addComment() {
    if (!message.trim() || !username.trim()) return

    setLoading(true)

    const { error } = await supabase.from("comments").insert([
      {
        username,
        message,
      },
    ])

    setLoading(false)

    if (error) {
      console.error(error)
      alert("저장 중 오류가 발생했어요 ㅠㅠ")
      return
    }

    setMessage("")
    await fetchComments()
  }

  // 댓글 삭제
  async function deleteComment(id: number) {
    const ok = window.confirm("정말 이 댓글을 삭제할까요?")
    if (!ok) return

    setDeletingId(id)

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", id)

    setDeletingId(null)

    if (error) {
      console.error(error)
      alert("삭제 중 오류가 발생했어요 ㅠㅠ")
      return
    }

    await fetchComments()
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617", // 전체 배경
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "40px 16px",
        color: "white",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "rgba(15,23,42,0.95)",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          border: "1px solid rgba(148,163,184,0.4)",
        }}
      >
        {/* 헤더 */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#38bdf8",
              marginBottom: 8,
            }}
          >
            DONGBUART
          </div>
          <h1 style={{ fontSize: 24, margin: 0, marginBottom: 4 }}>
            방명록 / 댓글 게시판
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "#9ca3af",
            }}
          >
            닉네임이랑 하고 싶은 말 아무거나 남겨보세요 :)
          </p>
        </div>

        {/* 입력 폼 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 20,
          }}
        >
          <input
            placeholder="닉네임"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #4b5563",
              background: "#020617",
              color: "white",
              fontSize: 14,
              outline: "none",
            }}
          />

          <textarea
            placeholder="메시지 입력..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #4b5563",
              background: "#020617",
              color: "white",
              fontSize: 14,
              minHeight: 80,
              resize: "vertical",
              outline: "none",
            }}
          />

          <button
            onClick={addComment}
            disabled={loading}
            style={{
              marginTop: 4,
              padding: "10px 14px",
              borderRadius: 999,
              border: "none",
              background: loading ? "#4b5563" : "#22c55e",
              color: "black",
              cursor: loading ? "default" : "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {loading ? "작성 중..." : "작성하기"}
          </button>
        </div>

        {/* 카운트 */}
        <div
          style={{
            fontSize: 12,
            color: "#9ca3af",
            marginBottom: 8,
          }}
        >
          총 {comments.length}개의 댓글
        </div>

        <div
          style={{
            height: 1,
            background:
              "linear-gradient(to right, transparent, #4b5563, transparent)",
            marginBottom: 12,
          }}
        />

        {/* 댓글 리스트 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {comments.length === 0 && (
            <div
              style={{
                fontSize: 13,
                color: "#6b7280",
                textAlign: "center",
                padding: "12px 0",
              }}
            >
              아직 댓글이 없습니다. 첫 댓글의 주인공이 되어보세요 👀
            </div>
          )}

          {comments.map((c) => (
            <div
              key={c.id}
              style={{
                padding: 12,
                borderRadius: 10,
                background: "#020617",
                border: "1px solid #1f2937",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: 600 }}>
                  {c.username || "익명"}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "#6b7280",
                  }}
                >
                  {c.created_at &&
                    new Date(c.created_at).toLocaleString("ko-KR")}
                </span>
              </div>

              <div
                style={{
                  fontSize: 14,
                  whiteSpace: "pre-wrap",
                  marginBottom: 6,
                }}
              >
                {c.message}
              </div>

              {/* 삭제 버튼 */}
              <div style={{ textAlign: "right" }}>
                <button
                  onClick={() => deleteComment(c.id)}
                  disabled={deletingId === c.id}
                  style={{
                    fontSize: 11,
                    padding: "4px 8px",
                    borderRadius: 999,
                    border: "1px solid #4b5563",
                    background: "transparent",
                    color: "#f97373",
                    cursor:
                      deletingId === c.id ? "default" : "pointer",
                  }}
                >
                  {deletingId === c.id ? "삭제 중..." : "삭제"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}