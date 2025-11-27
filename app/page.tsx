"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function Home() {
  const [comments, setComments] = useState([])
  const [message, setMessage] = useState("")
  const [username, setUsername] = useState("")

  useEffect(() => {
    fetchComments()
  }, [])

  async function fetchComments() {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error(error)
      return
    }
    setComments(data || [])
  }

  async function addComment() {
    if (!message.trim()) return

    const { error } = await supabase.from("comments").insert([
      { username, message }
    ])

    if (error) {
      console.error(error)
      return
    }

    setMessage("")
    fetchComments()
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h2>댓글 게시판</h2>

      <input
        placeholder="닉네임"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ width: "100%", marginBottom: 10, padding: 8 }}
      />

      <textarea
        placeholder="메시지 입력..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: "100%", height: 80, padding: 8 }}
      />

      <button onClick={addComment} style={{ marginTop: 10, padding: "8px 16px" }}>
        작성하기
      </button>

      <div style={{ marginTop: 30 }}>
        {comments.map((c) => (
          <div
            key={c.id}
            style={{
              padding: "10px 0",
              borderBottom: "1px solid #444",
            }}
          >
            <b>{c.username || "익명"}</b>
            <div>{c.message}</div>
            <div style={{ fontSize: 12, opacity: 0.5 }}>
              {c.created_at && new Date(c.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}