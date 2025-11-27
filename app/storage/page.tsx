"use client";

import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function StoragePage() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [quantity, setQuantity] = useState("");
  const [memo, setMemo] = useState("");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // 📌 페이지 로드 시 목록 불러오기
  useEffect(() => {
    fetchItems();
  }, []);

  // 📌 항목 불러오기
  async function fetchItems() {
    setLoading(true);

    const { data, error } = await supabase
      .from("storage_items") // ⚠ 테이블 이름 반드시 정확해야 함!
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Select Error:", error);

      alert(
        "목록 불러오기 오류 발생\n\n" +
          "code: " + error.code + "\n" +
          "message: " + error.message
      );

      setLoading(false);
      return;
    }

    setItems(data || []);
    setLoading(false);
  }

  // 📌 항목 추가하기
  async function addItem() {
    if (!name || !location || !quantity) {
      alert("이름, 위치, 수량은 반드시 입력해야 합니다.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.from("storage_items").insert([
      {
        name,
        location,
        quantity: Number(quantity),
        memo,
      },
    ]);

    if (error) {
      console.error("Insert Error:", error);

      alert(
        "저장 중 오류 발생\n\n" +
          "code: " + error.code + "\n" +
          "message: " + error.message
      );

      setLoading(false);
      return;
    }

    // 입력 폼 초기화
    setName("");
    setLocation("");
    setQuantity("");
    setMemo("");

    // 목록 다시 불러오기
    fetchItems();
  }

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
        수장고 관리 시스템
      </h1>

      <p style={{ marginBottom: "20px", color: "#bbbbbb" }}>
        작품 / 물건 이름, 위치, 수량, 메모를 기록해 두고 나중에 쉽게 찾기 위한 공간입니다.
      </p>

      {/* 입력 폼 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <input
          placeholder="이름 (작품명 / 물건명)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="위치 (예: A-3 선반 / 창고 안쪽)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="수량 (숫자)"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="메모 (선택)"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          style={inputStyle}
        />

        <button
          onClick={addItem}
          disabled={loading}
          style={{
            ...buttonStyle,
            backgroundColor: loading ? "#888" : "#3cb371",
          }}
        >
          {loading ? "저장 중..." : "항목 추가"}
        </button>
      </div>

      <h3 style={{ marginBottom: "10px" }}>총 {items.length}개의 항목</h3>

      {/* 항목 리스트 */}
      {items.length === 0 ? (
        <p style={{ color: "#777" }}>아직 등록된 항목이 없습니다.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: "#111827",
                padding: "15px",
                borderRadius: "10px",
              }}
            >
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                {item.name}
              </div>
              <div style={{ marginTop: "5px" }}>📍 위치: {item.location}</div>
              <div>📦 수량: {item.quantity}</div>
              {item.memo && <div>📝 메모: {item.memo}</div>}
              <div style={{ marginTop: "5px", fontSize: "12px", color: "#777" }}>
                등록일: {new Date(item.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #444",
  backgroundColor: "#1f2937",
  color: "#fff",
};
const buttonStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
};