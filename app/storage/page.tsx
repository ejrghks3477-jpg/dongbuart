"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

// 🔹 Supabase 테이블 이름
const COMMENT_TABLE = "comments";
const STORAGE_TABLE = "storage_items";
const CAR_LOG_TABLE = "car_logs";

// 🔹 타입 정의
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

type CarLog = {
  id: number;
  created_at: string;
  car_number: string | null;
  odometer: number | null;
  driver: string | null;
  route: string | null;
  service: string | null;
};

type Tab = "board" | "storage" | "car";

const CAR_NUMBERS = ["서울82바1253", "서울82바1252"];

export default function HomePage() {
  // ====== 공통 탭 상태 ======
  const [activeTab, setActiveTab] = useState<Tab>("board");

  // ====== 자유 게시판 상태 ======
  const [comments, setComments] = useState<Comment[]>([]);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);

  // ====== 수장고 상태 ======
  const [storageItems, setStorageItems] = useState<StorageItem[]>([]);
  const [storageName, setStorageName] = useState("");
  const [storageLocation, setStorageLocation] = useState("");
  const [storageQuantity, setStorageQuantity] = useState("");
  const [storageMemo, setStorageMemo] = useState("");
  const [storageSearchKeyword, setStorageSearchKeyword] = useState("");
  const [isStorageSubmitting, setIsStorageSubmitting] = useState(false);
  const [storageEditId, setStorageEditId] = useState<number | null>(null);

  // ====== 차량 관리 상태 ======
  const [currentCar, setCurrentCar] = useState<string>(CAR_NUMBERS[0]);
  const [carLogs, setCarLogs] = useState<CarLog[]>([]);
  const [carOdometer, setCarOdometer] = useState("");
  const [carDriver, setCarDriver] = useState("");
  const [carRoute, setCarRoute] = useState("");
  const [carService, setCarService] = useState("");
  const [isCarSubmitting, setIsCarSubmitting] = useState(false);
  const [carEditId, setCarEditId] = useState<number | null>(null);

  // ====== 초기 로드 ======
  useEffect(() => {
    loadComments();
    loadStorageItems();
    loadCarLogs(CAR_NUMBERS[0]);
  }, []);

  // ==========================
  //  자유 게시판
  // ==========================
  async function loadComments() {
    try {
      const { data, error } = await supabase
        .from(COMMENT_TABLE)
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("댓글 불러오기 에러:", error);
        alert("댓글을 불러오는 중 오류가 발생했습니다.");
        return;
      }
      setComments(data ?? []);
    } catch (e) {
      console.error(e);
      alert("댓글을 불러오는 중 오류가 발생했습니다.");
    }
  }

  async function addComment(e: FormEvent) {
    e.preventDefault();
    if (!message.trim()) {
      alert("메시지를 입력해 주세요.");
      return;
    }

    setIsCommentSubmitting(true);
    try {
      const { error } = await supabase.from(COMMENT_TABLE).insert({
        username: username.trim() || "익명",
        message: message.trim(),
      });

      if (error) {
        console.error("댓글 작성 에러:", error);
        alert("댓글 작성 중 오류가 발생했습니다.");
        return;
      }

      setMessage("");
      await loadComments();
    } catch (e) {
      console.error(e);
      alert("댓글 작성 중 오류가 발생했습니다.");
    } finally {
      setIsCommentSubmitting(false);
    }
  }

  async function deleteComment(id: number) {
    if (!confirm("정말 이 댓글을 삭제할까요?")) return;

    try {
      const { error } = await supabase.from(COMMENT_TABLE).delete().eq("id", id);
      if (error) {
        console.error("댓글 삭제 에러:", error);
        alert("댓글 삭제 중 오류가 발생했습니다.");
        return;
      }
      await loadComments();
    } catch (e) {
      console.error(e);
      alert("댓글 삭제 중 오류가 발생했습니다.");
    }
  }

  // ==========================
  //  수장고
  // ==========================
  async function loadStorageItems(keyword?: string) {
    try {
      let query = supabase
        .from(STORAGE_TABLE)
        .select("*")
        .order("id", { ascending: false });

      if (keyword && keyword.trim() !== "") {
        const k = keyword.trim();
        query = query.or(`name.ilike.%${k}%,location.ilike.%${k}%`);
      }

      const { data, error } = await query;
      if (error) {
        console.error("수장고 목록 불러오기 에러:", error);
        alert("목록을 불러오는 중 오류가 발생했습니다.");
        return;
      }

      setStorageItems(data ?? []);
    } catch (e) {
      console.error(e);
      alert("목록을 불러오는 중 오류가 발생했습니다.");
    }
  }

  function clearStorageForm() {
    setStorageName("");
    setStorageLocation("");
    setStorageQuantity("");
    setStorageMemo("");
    setStorageEditId(null);
  }

  async function submitStorageItem(e: FormEvent) {
    e.preventDefault();

    if (!storageName.trim()) {
      alert("이름을 입력해 주세요.");
      return;
    }
    if (!storageLocation.trim()) {
      alert("위치를 입력해 주세요.");
      return;
    }

    const quantityNum = storageQuantity.trim()
      ? Number(storageQuantity.trim())
      : null;
    if (storageQuantity.trim() && Number.isNaN(quantityNum)) {
      alert("수량은 숫자로 입력해 주세요.");
      return;
    }

    setIsStorageSubmitting(true);
    try {
      if (storageEditId === null) {
        // 새 항목 추가
        const { error } = await supabase.from(STORAGE_TABLE).insert({
          name: storageName.trim(),
          location: storageLocation.trim(),
          quantity: quantityNum,
          memo: storageMemo.trim() || null,
        });
        if (error) {
          console.error("수장고 항목 추가 에러:", error);
          alert("저장 중 오류가 발생했습니다.");
          return;
        }
      } else {
        // 기존 항목 수정
        const { error } = await supabase
          .from(STORAGE_TABLE)
          .update({
            name: storageName.trim(),
            location: storageLocation.trim(),
            quantity: quantityNum,
            memo: storageMemo.trim() || null,
          })
          .eq("id", storageEditId);
        if (error) {
          console.error("수장고 항목 수정 에러:", error);
          alert("수정 중 오류가 발생했습니다.");
          return;
        }
      }

      clearStorageForm();
      await loadStorageItems(storageSearchKeyword);
    } catch (e) {
      console.error(e);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsStorageSubmitting(false);
    }
  }

  function startEditStorageItem(item: StorageItem) {
    setStorageEditId(item.id);
    setStorageName(item.name ?? "");
    setStorageLocation(item.location ?? "");
    setStorageQuantity(
      typeof item.quantity === "number" ? String(item.quantity) : ""
    );
    setStorageMemo(item.memo ?? "");
  }

  async function deleteStorageItem(id: number) {
    if (!confirm("이 항목을 삭제할까요?")) return;

    try {
      const { error } = await supabase
        .from(STORAGE_TABLE)
        .delete()
        .eq("id", id);
      if (error) {
        console.error("수장고 항목 삭제 에러:", error);
        alert("삭제 중 오류가 발생했습니다.");
        return;
      }
      if (storageEditId === id) clearStorageForm();
      await loadStorageItems(storageSearchKeyword);
    } catch (e) {
      console.error(e);
      alert("삭제 중 오류가 발생했습니다.");
    }
  }

  // ==========================
  //  차량 관리
  // ==========================
  async function loadCarLogs(carNumber?: string) {
    const targetCar = carNumber || currentCar;
    if (!targetCar) return;

    try {
      const { data, error } = await supabase
        .from(CAR_LOG_TABLE)
        .select("*")
        .eq("car_number", targetCar)
        .order("id", { ascending: false });

      if (error) {
        console.error("차량 로그 불러오기 에러:", error);
        // 테이블 아직 안 만들었을 때도 여기로 옴
        return;
      }

      setCarLogs(data ?? []);
    } catch (e) {
      console.error(e);
    }
  }

  function clearCarForm() {
    setCarOdometer("");
    setCarDriver("");
    setCarRoute("");
    setCarService("");
    setCarEditId(null);
  }

  async function submitCarLog(e: FormEvent) {
    e.preventDefault();

    if (!currentCar) {
      alert("차량을 선택해 주세요.");
      return;
    }
    if (!carOdometer.trim()) {
      alert("키로수를 입력해 주세요.");
      return;
    }
    const odoNum = Number(carOdometer.trim());
    if (Number.isNaN(odoNum)) {
      alert("키로수는 숫자로 입력해 주세요.");
      return;
    }
    if (!carDriver.trim()) {
      alert("운전자 이름을 입력해 주세요.");
      return;
    }

    setIsCarSubmitting(true);
    try {
      if (carEditId === null) {
        // 새 로그
        const { error } = await supabase.from(CAR_LOG_TABLE).insert({
          car_number: currentCar,
          odometer: odoNum,
          driver: carDriver.trim(),
          route: carRoute.trim() || null,
          service: carService.trim() || null,
        });
        if (error) {
          console.error("차량 로그 추가 에러:", error);
          alert("저장 중 오류가 발생했습니다.");
          return;
        }
      } else {
        // 수정
        const { error } = await supabase
          .from(CAR_LOG_TABLE)
          .update({
            car_number: currentCar,
            odometer: odoNum,
            driver: carDriver.trim(),
            route: carRoute.trim() || null,
            service: carService.trim() || null,
          })
          .eq("id", carEditId);
        if (error) {
          console.error("차량 로그 수정 에러:", error);
          alert("수정 중 오류가 발생했습니다.");
          return;
        }
      }

      clearCarForm();
      await loadCarLogs(currentCar);
    } catch (e) {
      console.error(e);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsCarSubmitting(false);
    }
  }

  function startEditCarLog(log: CarLog) {
    setCarEditId(log.id);
    setCarOdometer(
      typeof log.odometer === "number" ? String(log.odometer) : ""
    );
    setCarDriver(log.driver ?? "");
    setCarRoute(log.route ?? "");
    setCarService(log.service ?? "");
  }

  async function deleteCarLog(id: number) {
    if (!confirm("이 운행 기록을 삭제할까요?")) return;

    try {
      const { error } = await supabase
        .from(CAR_LOG_TABLE)
        .delete()
        .eq("id", id);
      if (error) {
        console.error("차량 로그 삭제 에러:", error);
        alert("삭제 중 오류가 발생했습니다.");
        return;
      }
      if (carEditId === id) clearCarForm();
      await loadCarLogs(currentCar);
    } catch (e) {
      console.error(e);
      alert("삭제 중 오류가 발생했습니다.");
    }
  }

  // ==========================
  //  렌더링
  // ==========================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-sm font-semibold tracking-[0.3em] text-emerald-300">
            DONGBUART
          </h1>
          <h2 className="mt-2 text-2xl font-bold">관리 시스템</h2>

          {/* 탭 버튼 */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setActiveTab("board")}
              className={`flex-1 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                activeTab === "board"
                  ? "border-emerald-400 bg-emerald-500 text-slate-950"
                  : "border-slate-600 bg-slate-900/60 text-slate-200 hover:border-emerald-400/60"
              }`}
            >
              자유 게시판
            </button>
            <button
              onClick={() => setActiveTab("storage")}
              className={`flex-1 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                activeTab === "storage"
                  ? "border-emerald-400 bg-emerald-500 text-slate-950"
                  : "border-slate-600 bg-slate-900/60 text-slate-200 hover:border-emerald-400/60"
              }`}
            >
              수장고 관리
            </button>
            <button
              onClick={() => {
                setActiveTab("car");
                loadCarLogs(currentCar);
              }}
              className={`flex-1 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                activeTab === "car"
                  ? "border-emerald-400 bg-emerald-500 text-slate-950"
                  : "border-slate-600 bg-slate-900/60 text-slate-200 hover:border-emerald-400/60"
              }`}
            >
              차량 관리
            </button>
          </div>
        </header>

        {/* 메인 카드 */}
        <main className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-slate-900/40 backdrop-blur">
          {/* ===== 자유게시판 ===== */}
          {activeTab === "board" && (
            <section>
              <h3 className="text-xl font-semibold">방명록 / 댓글 게시판</h3>
              <p className="mt-1 text-sm text-slate-400">
                닉네임이랑 하고 싶은 말 아무거나 남겨보세요 :)
              </p>

              <form onSubmit={addComment} className="mt-6 space-y-3">
                <input
                  type="text"
                  placeholder="닉네임"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg bg-slate-800/80 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-1 ring-slate-700 focus:ring-2 focus:ring-emerald-400/80"
                />
                <textarea
                  placeholder="메시지 입력..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[90px] w-full resize-none rounded-lg bg-slate-800/80 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-1 ring-slate-700 focus:ring-2 focus:ring-emerald-400/80"
                />
                <button
                  type="button"
                  disabled={isCommentSubmitting}
                  className="mt-2 w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                >
                  {isCommentSubmitting ? "작성 중..." : "작성하기"}
                </button>
              </form>

              <p className="mt-6 text-xs text-slate-500">
                총 {comments.length}개의 댓글
              </p>

              <div className="mt-3 space-y-3">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-2xl bg-slate-900/80 px-4 py-3 text-sm ring-1 ring-slate-800"
                  >
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="font-semibold">
                        {c.username || "익명"}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>
                          {new Date(c.created_at).toLocaleString("ko-KR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteComment(c.id)}
                          className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300 hover:bg-red-500/80 hover:text-white"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap text-slate-100">
                      {c.message}
                    </p>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="mt-4 text-center text-xs text-slate-500">
                    아직 등록된 댓글이 없습니다.
                  </p>
                )}
              </div>
            </section>
          )}

          {/* ===== 수장고 ===== */}
          {activeTab === "storage" && (
            <section>
              <h3 className="text-xl font-semibold">수장고 관리 시스템</h3>
              <p className="mt-1 text-sm text-slate-400">
                작품 / 물건 이름, 위치, 수량, 메모를 기록해 두고 나중에 찾기
                쉽게 관리하는 공간입니다.
              </p>

              {/* 검색 */}
              <div className="mt-4 mb-4 flex gap-2">
                <input
                  type="text"
                  placeholder="이름 또는 위치로 검색"
                  value={storageSearchKeyword}
                  onChange={(e) => setStorageSearchKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      loadStorageItems(storageSearchKeyword);
                    }
                  }}
                  className="flex-1 rounded-lg bg-slate-800/80 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-1 ring-slate-700 focus:ring-2 focus:ring-emerald-400/80"
                />
                <button
                  onClick={() => loadStorageItems(storageSearchKeyword)}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  검색
                </button>
                <button
                  onClick={() => {
                    setStorageSearchKeyword("");
                    loadStorageItems();
                  }}
                  className="rounded-lg bg-slate-700 px-3 py-2 text-sm text-slate-100 hover:bg-slate-600"
                >
                  전체
                </button>
              </div>

              {/* 입력 폼 */}
              <form onSubmit={submitStorageItem} className="space-y-3">
                <input
                  type="text"
                  placeholder="이름 (작품명 / 물건명)"
                  value={storageName}
                  onChange={(e) => setStorageName(e.target.value)}
                  className="w-full rounded-lg bg-slate-800/80 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-1 ring-slate-700 focus:ring-2 focus:ring-emerald-400/80"
                />
                <input
                  type="text"
                  placeholder="위치 (예: A-3 선반 / 창고 안쪽)"
                  value={storageLocation}
                  onChange={(e) => setStorageLocation(e.target.value)}
                  className="w-full rounded-lg bg-slate-800/80 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-1 ring-slate-700 focus:ring-2 focus:ring-emerald-400/80"
                />
                <input
                  type="text"
                  placeholder="수량 (숫자)"
                  value={storageQuantity}
                  onChange={(e) => setStorageQuantity(e.target.value)}
                  className="w-full rounded-lg bg-slate-800/80 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-1 ring-slate-700 focus:ring-2 focus:ring-emerald-400/80"
                />
                <textarea
                  placeholder="메모 (상태 / 특징 / 기타)"
                  value={storageMemo}
                  onChange={(e) => setStorageMemo(e.target.value)}
                  className="min-h-[70px] w-full resize-none rounded-lg bg-slate-800/80 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-1 ring-slate-700 focus:ring-2 focus:ring-emerald-400/80"
                />

                <div className="mt-1 flex gap-2">
                  <button
                    type="submit"
                    disabled={isStorageSubmitting}
                    className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                  >
                    {isStorageSubmitting
                      ? storageEditId
                        ? "수정 중..."
                        : "저장 중..."
                      : storageEditId
                      ? "수정 완료"
                      : "항목 추가"}
                  </button>
                  {storageEditId !== null && (
                    <button
                      type="button"
                      onClick={clearStorageForm}
                      className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-slate-100 hover:bg-slate-600"
                    >
                      수정 취소
                    </button>
                  )}
                </div>
              </form>

              {/* 목록 */}
              <p className="mt-6 text-xs text-slate-500">
                총 {storageItems.length}개의 항목
              </p>
              <div className="mt-3 space-y-3">
                {storageItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-slate-900/80 px-4 py-3 text-sm ring-1 ring-slate-800"
                  >
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold">
                          {item.name || "(이름 없음)"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          위치: {item.location || "-"} / 수량:{" "}
                          {typeof item.quantity === "number"
                            ? item.quantity
                            : "-"}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-[11px] text-slate-500">
                        <span>
                          {new Date(item.created_at).toLocaleString("ko-KR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => startEditStorageItem(item)}
                            className="rounded-full bg-slate-700 px-2 py-0.5 hover:bg-emerald-500 hover:text-slate-950"
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteStorageItem(item.id)}
                            className="rounded-full bg-slate-800 px-2 py-0.5 hover:bg-red-500 hover:text-white"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                    {item.memo && (
                      <p className="mt-1 whitespace-pre-wrap text-xs text-slate-200">
                        메모: {item.memo}
                      </p>
                    )}
                  </div>
                ))}
                {storageItems.length === 0 && (
                  <p className="mt-4 text-center text-xs text-slate-500">
                    아직 등록된 항목이 없습니다.
                  </p>
                )}
              </div>
            </section>
          )}

          {/* ===== 차량 관리 ===== */}
          {activeTab === "car" && (
            <section>
              <h3 className="text-xl font-semibold">차량 관리 시스템</h3>
              <p className="mt-1 text-sm text-slate-400">
                각 차량의 키로수 / 운전자 / 경유지 / 최근 수리내용을 기록하는
                공간입니다.
              </p>

              {/* 차량 선택 버튼 */}
              <div className="mt-4 mb-4 flex gap-3">
                {CAR_NUMBERS.map((car) => (
                  <button
                    key={car}
                    onClick={() => {
                      setCurrentCar(car);
                      clearCarForm();
                      loadCarLogs(car);
                    }}
                    className={`flex-1 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                      currentCar === car
                        ? "border-emerald-400 bg-emerald-500 text-slate-950"
                        : "border-slate-600 bg-slate-900/60 text-slate-200 hover:border-emerald-400/60"
                    }`}
                  >
                    {car}
                  </button>
                ))}
              </div>

              {/* 입력 폼 */}
              <form onSubmit={submitCarLog} className="space-y-3">
                <input
                  type="text"
                  placeholder="키로수 (예: 123456)"
                  value={carOdometer}
                  onChange={(e) => setCarOdometer(e.target.value)}
                  className="w-full rounded-lg bg-slate-800/80 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-1 ring-slate-700 focus:ring-2 focus:ring-emerald-400/80"
                />
                <input
                  type="text"
                  placeholder="운전자 이름"
                  value={carDriver}
                  onChange={(e) => setCarDriver(e.target.value)}
                  className="w-full rounded-lg bg-slate-800/80 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-1 ring-slate-700 focus:ring-2 focus:ring-emerald-400/80"
                />
                <input
                  type="text"
                  placeholder="경유지 / 이동 경로"
                  value={carRoute}
                  onChange={(e) => setCarRoute(e.target.value)}
                  className="w-full rounded-lg bg-slate-800/80 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-1 ring-slate-700 focus:ring-2 focus:ring-emerald-400/80"
                />
                <textarea
                  placeholder="최근 수리 내용 (정비소, 교체한 부품 등)"
                  value={carService}
                  onChange={(e) => setCarService(e.target.value)}
                  className="min-h-[70px] w-full resize-none rounded-lg bg-slate-800/80 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-1 ring-slate-700 focus:ring-2 focus:ring-emerald-400/80"
                />

                <div className="mt-1 flex gap-2">
                  <button
                    type="submit"
                    disabled={isCarSubmitting}
                    className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                  >
                    {isCarSubmitting
                      ? carEditId
                        ? "수정 중..."
                        : "저장 중..."
                      : carEditId
                      ? "수정 완료"
                      : "기록 추가"}
                  </button>
                  {carEditId !== null && (
                    <button
                      type="button"
                      onClick={clearCarForm}
                      className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-slate-100 hover:bg-slate-600"
                    >
                      수정 취소
                    </button>
                  )}
                </div>
              </form>

              {/* 로그 목록 */}
              <p className="mt-6 text-xs text-slate-500">
                {currentCar} — 총 {carLogs.length}개의 운행 기록
              </p>

              <div className="mt-3 space-y-3">
                {carLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-2xl bg-slate-900/80 px-4 py-3 text-sm ring-1 ring-slate-800"
                  >
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold">
                          키로수:{" "}
                          {typeof log.odometer === "number"
                            ? `${log.odometer.toLocaleString("ko-KR")} km`
                            : "-"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          운전자: {log.driver || "-"}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-[11px] text-slate-500">
                        <span>
                          {new Date(log.created_at).toLocaleString("ko-KR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => startEditCarLog(log)}
                            className="rounded-full bg-slate-700 px-2 py-0.5 hover:bg-emerald-500 hover:text-slate-950"
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCarLog(log.id)}
                            className="rounded-full bg-slate-800 px-2 py-0.5 hover:bg-red-500 hover:text-white"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                    {log.route && (
                      <p className="mt-1 whitespace-pre-wrap text-xs text-slate-200">
                        경유지: {log.route}
                      </p>
                    )}
                    {log.service && (
                      <p className="mt-1 whitespace-pre-wrap text-xs text-slate-200">
                        최근 수리: {log.service}
                      </p>
                    )}
                  </div>
                ))}
                {carLogs.length === 0 && (
                  <p className="mt-4 text-center text-xs text-slate-500">
                    아직 기록이 없습니다.
                  </p>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}