"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type StorageItem = {
  id: number;
  name: string | null;
  location: string | null;
  quantity: number | null;
  memo: string | null;
  created_at: string;
};

export default function StoragePage() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [quantity, setQuantity] = useState("");
  const [memo, setMemo] = useState("");
  const [items, setItems] = useState<StorageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // 목록 불러오기
  async function fetchItems() {
    const { data, error } = await supabase
      .from("storage_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("목록을 불러오는 중 오류가 발생했습니다.");
      return;
    }

    setItems((data ?? []) as StorageItem[]);
  }

  useEffect(() => {
    fetchItems();
  }, []);

  // 항목 추가
  async function addItem() {
    if (!name.trim()) {
      alert("이름은 필수입니다.");
      return;
    }

    setLoading(true);

    const qty = quantity ? Number(quantity) : null;

    const { error } = await supabase.from("storage_items").insert([
      {
        name,
        location,
        quantity: qty,
        memo,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error(error);
      alert("저장 중 오류가 발생했습니다.");
      return;
    }

    // 입력값 초기화 + 목록 갱신
    setName("");
    setLocation("");
    setQuantity("");
    setMemo("");
    fetchItems();
  }

  // 삭제
  async function deleteItem(id: number) {
    const ok = window.confirm("정말 이 항목을 삭제할까요?");
    if (!ok) return;

    setDeletingId(id);

    const { error } = await supabase
      .from("storage_items")
      .delete()
      .eq("id", id);

    setDeletingId(null);

    if (error) {
      console.error(error);
      alert("삭제 중 오류가 발생했습니다.");
      return;
    }

    fetchItems();
  }

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
        {/* 상단 네비게이션 (자유 / 수장고 / 차량) */}
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
              border: "1px solid #4b5563",
              background: "#020617",
              color: "#e5e7eb",
              fontSize: 13,
              fontWeight: 500,
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
              border: "1px solid #22c55e",
              background: "#22c55e",
              color: "#020617",
              fontSize: 13,
              fontWeight: 600,
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

        {/* 메인 카드 */}
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
          <h1 style={{ fontSize: 22, marginBottom: 4 }}>수장고 관리 시스템</h1>
          <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 16 }}>
            작품 / 물건 이름, 위치, 수량, 메모를 기록해 두고 나중에 찾기 쉽게
            관리하는 공간입니다.
          </p>

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
              placeholder="이름 (작품명 / 물건명)"
              value={name}
              onChange={(e) => setName(e.target.value)}
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

            <input
              placeholder="위치 (예: A-3 선반 / 창고 안쪽)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
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

            <input
              placeholder="수량 (숫자)"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
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
              placeholder="메모 (상태 / 특징 / 기타)"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #4b5563",
                background: "#020617",
                color: "white",
                fontSize: 14,
                minHeight: 70,
                resize: "vertical",
                outline: "none",
              }}
            />

            <button
              onClick={addItem}
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
              {loading ? "저장 중..." : "항목 추가"}
            </button>
          </div>

          <div
            style={{
              fontSize: 12,
              color: "#9ca3af",
              marginBottom: 8,
            }}
          >
            총 {items.length}개의 항목
          </div>

          <div
            style={{
              height: 1,
              background:
                "linear-gradient(to right, transparent, #4b5563, transparent)",
              marginBottom: 12,
            }}
          />

          {/* 목록 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.length === 0 && (
              <div
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                  textAlign: "center",
                  padding: "12px 0",
                }}
              >
                아직 등록된 항목이 없습니다.
              </div>
            )}

            {items.map((item) => (
              <div
                key={item.id}
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
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div
                      style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}
                    >
                      위치: {item.location || "-"} / 수량:{" "}
                      {item.quantity ?? "-"}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#6b7280",
                      marginLeft: 8,
                      textAlign: "right",
                    }}
                  >
                    {item.created_at &&
                      new Date(item.created_at).toLocaleString("ko-KR")}
                  </div>
                </div>

                {item.memo && (
                  <div
                    style={{
                      fontSize: 13,
                      color: "#e5e7eb",
                      marginTop: 4,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {item.memo}
                  </div>
                )}

                <div style={{ textAlign: "right", marginTop: 6 }}>
                  <button
                    onClick={() => deleteItem(item.id)}
                    disabled={deletingId === item.id}
                    style={{
                      fontSize: 11,
                      padding: "4px 8px",
                      borderRadius: 999,
                      border: "1px solid #4b5563",
                      background: "transparent",
                      color: "#f97373",
                      cursor:
                        deletingId === item.id ? "default" : "pointer",
                    }}
                  >
                    {deletingId === item.id ? "삭제 중..." : "삭제"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}