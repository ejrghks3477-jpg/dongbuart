"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// ⚠️ 여기만 실제 테이블 이름에 맞게 확인!
// Supabase 테이블 이름이 storage_items 이면 그대로 두고,
// 만약 storage 라고 만들어뒀으면 "storage" 로 바꿔줘.
const STORAGE_TABLE = "storage_items";

type Comment = {
  id: number;
  created_at: string;
  username: string | null;
  message: string | null;
};

type StorageItem = {
  id: number;
  created_at: string;
  name: string | null;
  location: string | null;
  quantity: number | null;
  memo: string | null;
};

type Tab = "board" | "storage" | "vehicle";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>("board");

  // -------------------- 자유 게시판 상태 --------------------
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);

  // -------------------- 수장고 상태 --------------------
  const [itemName, setItemName] = useState("");
  const [itemLocation, setItemLocation] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemMemo, setItemMemo] = useState("");
  const [items, setItems] = useState<StorageItem[]>([]);
  const [storageLoading, setStorageLoading] = useState(false);

  // -------------------- 초기 데이터 로딩 --------------------
  useEffect(() => {
    fetchComments();
    fetchItems();
  }, []);

  // ==================== 자유 게시판 함수 ====================

  async function fetchComments() {
    setCommentLoading(true);

    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Select comments error:", error);
      alert(
        "댓글 목록을 불러오는 중 오류가 발생했습니다.\n\n" +
          "code: " +
          error.code +
          "\nmessage: " +
          error.message
      );
      setCommentLoading(false);
      return;
    }

    setComments((data ?? []) as Comment[]);
    setCommentLoading(false);
  }

  async function addComment() {
    if (!username.trim() || !message.trim()) {
      alert("닉네임과 메시지를 모두 입력해주세요.");
      return;
    }

    setCommentLoading(true);

    const { error } = await supabase.from("comments").insert([
      {
        username,
        message,
      },
    ]);

    if (error) {
      console.error("Insert comment error:", error);
      alert(
        "댓글 저장 중 오류가 발생했습니다.\n\n" +
          "code: " +
          error.code +
          "\nmessage: " +
          error.message
      );
      setCommentLoading(false);
      return;
    }

    setUsername("");
    setMessage("");
    await fetchComments();
  }

  async function deleteComment(id: number) {
    const ok = confirm("정말 이 댓글을 삭제할까요?");
    if (!ok) return;

    const { error } = await supabase.from("comments").delete().eq("id", id);

    if (error) {
      console.error("Delete comment error:", error);
      alert(
        "댓글 삭제 중 오류가 발생했습니다.\n\n" +
          "code: " +
          error.code +
          "\nmessage: " +
          error.message
      );
      return;
    }

    await fetchComments();
  }

  // ==================== 수장고 함수 ====================

  async function fetchItems() {
    setStorageLoading(true);

    const { data, error } = await supabase
      .from(STORAGE_TABLE)
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Select storage error:", error);
      alert(
        "목록을 불러오는 중 오류가 발생했습니다.\n\n" +
          "code: " +
          error.code +
          "\nmessage: " +
          error.message
      );
      setStorageLoading(false);
      return;
    }

    setItems((data ?? []) as StorageItem[]);
    setStorageLoading(false);
  }

  async function addItem() {
    if (!itemName.trim() || !itemLocation.trim() || !itemQuantity.trim()) {
      alert("이름, 위치, 수량은 반드시 입력해야 합니다.");
      return;
    }

    const qty = Number(itemQuantity);
    if (Number.isNaN(qty)) {
      alert("수량은 숫자로 입력해주세요.");
      return;
    }

    setStorageLoading(true);

    const { error } = await supabase.from(STORAGE_TABLE).insert([
      {
        name: itemName,
        location: itemLocation,
        quantity: qty,
        memo: itemMemo,
      },
    ]);

    if (error) {
      console.error("Insert storage error:", error);
      alert(
        "저장 중 오류가 발생했습니다.\n\n" +
          "code: " +
          error.code +
          "\nmessage: " +
          error.message
      );
      setStorageLoading(false);
      return;
    }

    setItemName("");
    setItemLocation("");
    setItemQuantity("");
    setItemMemo("");

    await fetchItems();
  }

  async function deleteItem(id: number) {
    const ok = confirm("이 항목을 삭제할까요?");
    if (!ok) return;

    const { error } = await supabase.from(STORAGE_TABLE).delete().eq("id", id);

    if (error) {
      console.error("Delete storage error:", error);
      alert(
        "항목 삭제 중 오류가 발생했습니다.\n\n" +
          "code: " +
          error.code +
          "\nmessage: " +
          error.message
      );
      return;
    }

    await fetchItems();
  }

  // ==================== UI ====================

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex justify-center px-4 py-10">
      <div className="w-full max-w-3xl">
        {/* 상단 탭 */}
        <div className="flex gap-3 mb-6">
          <TabButton
            label="자유 게시판"
            active={activeTab === "board"}
            onClick={() => setActiveTab("board")}
          />
          <TabButton
            label="수장고 관리"
            active={activeTab === "storage"}
            onClick={() => setActiveTab("storage")}
          />
          <TabButton
            label="차량 관리"
            active={activeTab === "vehicle"}
            onClick={() => setActiveTab("vehicle")}
          />
        </div>

        {/* 콘텐츠 카드 */}
        <div className="bg-slate-900/80 rounded-3xl border border-slate-700/60 shadow-xl px-6 py-7 md:px-8 md:py-9">
          {activeTab === "board" && (
            <BoardSection
              username={username}
              message={message}
              setUsername={setUsername}
              setMessage={setMessage}
              addComment={addComment}
              comments={comments}
              deleteComment={deleteComment}
              loading={commentLoading}
            />
          )}

          {activeTab === "storage" && (
            <StorageSection
              itemName={itemName}
              itemLocation={itemLocation}
              itemQuantity={itemQuantity}
              itemMemo={itemMemo}
              setItemName={setItemName}
              setItemLocation={setItemLocation}
              setItemQuantity={setItemQuantity}
              setItemMemo={setItemMemo}
              addItem={addItem}
              items={items}
              deleteItem={deleteItem}
              loading={storageLoading}
            />
          )}

          {activeTab === "vehicle" && (
            <div>
              <h1 className="text-2xl font-bold mb-2">차량 관리 시스템</h1>
              <p className="text-slate-300">
                이 탭은 나중에 차량 정비, 주유 기록, 보험 만기일 등을 관리하는
                용도로 확장할 수 있어요. 일단은 준비 중입니다 🙂
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// -------------------- 하위 컴포넌트들 --------------------

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold border transition-colors
      ${
        active
          ? "bg-emerald-500 text-white border-emerald-400"
          : "bg-slate-900 text-slate-200 border-slate-600"
      }`}
    >
      {label}
    </button>
  );
}

function BoardSection(props: {
  username: string;
  message: string;
  setUsername: (v: string) => void;
  setMessage: (v: string) => void;
  addComment: () => void;
  comments: Comment[];
  deleteComment: (id: number) => void;
  loading: boolean;
}) {
  const {
    username,
    message,
    setUsername,
    setMessage,
    addComment,
    comments,
    deleteComment,
    loading,
  } = props;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">방명록 / 댓글 게시판</h1>
      <p className="text-slate-300 mb-6 text-sm">
        닉네임이랑 하고 싶은 말 아무거나 남겨보세요 :)
      </p>

      <div className="space-y-3 mb-4">
        <input
          className="w-full rounded-xl bg-slate-800 px-4 py-3 text-sm border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="닉네임"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <textarea
          className="w-full rounded-xl bg-slate-800 px-4 py-3 text-sm border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 min-h-[80px]"
          placeholder="메시지 입력..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-sm font-semibold py-3 transition-colors disabled:bg-slate-500"
          onClick={addComment}
          disabled={loading}
        >
          {loading ? "작성 중..." : "작성하기"}
        </button>
      </div>

      <div className="text-xs text-slate-400 mb-3">
        총 {comments.length}개의 댓글
      </div>

      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {comments.map((c) => (
          <div
            key={c.id}
            className="bg-slate-800/80 rounded-2xl px-4 py-3 flex justify-between gap-3"
          >
            <div>
              <div className="font-semibold text-sm">
                {c.username || "익명"}
              </div>
              <div className="text-xs text-slate-400 mb-1">
                {new Date(c.created_at).toLocaleString()}
              </div>
              <div className="text-sm whitespace-pre-wrap">
                {c.message || ""}
              </div>
            </div>
            <button
              onClick={() => deleteComment(c.id)}
              className="text-xs text-red-300 hover:text-red-400 self-start"
            >
              삭제
            </button>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-sm text-slate-400">
            아직 작성된 댓글이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}

function StorageSection(props: {
  itemName: string;
  itemLocation: string;
  itemQuantity: string;
  itemMemo: string;
  setItemName: (v: string) => void;
  setItemLocation: (v: string) => void;
  setItemQuantity: (v: string) => void;
  setItemMemo: (v: string) => void;
  addItem: () => void;
  items: StorageItem[];
  deleteItem: (id: number) => void;
  loading: boolean;
}) {
  const {
    itemName,
    itemLocation,
    itemQuantity,
    itemMemo,
    setItemName,
    setItemLocation,
    setItemQuantity,
    setItemMemo,
    addItem,
    items,
    deleteItem,
    loading,
  } = props;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">수장고 관리 시스템</h1>
      <p className="text-slate-300 mb-6 text-sm">
        작품 / 물건 이름, 위치, 수량, 메모를 기록해 두고 나중에 찾기 쉽게
        관리하는 공간입니다.
      </p>

      <div className="space-y-3 mb-4">
        <input
          className="w-full rounded-xl bg-slate-800 px-4 py-3 text-sm border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="이름 (작품명 / 물건명)"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />
        <input
          className="w-full rounded-xl bg-slate-800 px-4 py-3 text-sm border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="위치 (예: A-3 선반 / 창고 안쪽)"
          value={itemLocation}
          onChange={(e) => setItemLocation(e.target.value)}
        />
        <input
          className="w-full rounded-xl bg-slate-800 px-4 py-3 text-sm border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="수량 (숫자)"
          value={itemQuantity}
          onChange={(e) => setItemQuantity(e.target.value)}
        />
        <input
          className="w-full rounded-xl bg-slate-800 px-4 py-3 text-sm border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="메모 (상태 / 특징 / 기타)"
          value={itemMemo}
          onChange={(e) => setItemMemo(e.target.value)}
        />

        <button
          className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-sm font-semibold py-3 transition-colors disabled:bg-slate-500"
          onClick={addItem}
          disabled={loading}
        >
          {loading ? "저장 중..." : "항목 추가"}
        </button>
      </div>

      <div className="text-xs text-slate-400 mb-3">
        총 {items.length}개의 항목
      </div>

      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-slate-800/80 rounded-2xl px-4 py-3 flex justify-between gap-3"
          >
            <div>
              <div className="font-semibold text-sm">{item.name}</div>
              <div className="text-xs text-slate-400 mb-1">
                {new Date(item.created_at).toLocaleString()}
              </div>
              <div className="text-sm">📍 위치: {item.location}</div>
              <div className="text-sm">📦 수량: {item.quantity}</div>
              {item.memo && (
                <div className="text-sm">📝 메모: {item.memo}</div>
              )}
            </div>
            <button
              onClick={() => deleteItem(item.id)}
              className="text-xs text-red-300 hover:text-red-400 self-start"
            >
              삭제
            </button>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-sm text-slate-400">
            아직 등록된 항목이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}