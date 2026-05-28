"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mailbox, AlertCircle } from "lucide-react";

type ShipmentStatus = "Pending" | "Approved" | "Rejected" | "Delivered";
type PaymentStatus = "Unpaid" | "WaitingVerification" | "Paid" | "Failed";
type ItemQuality = "SangatBaik" | "Baik" | "CukupBaik" | "Layak" | "CukupLayak";

interface Place {
  id: number;
  name: string;
  address?: string;
  operationalJam?: string;
}

interface ItemUser {
  id: number;
  name: string;
  email: string;
}

interface Item {
  id: number;
  name: string;
  category: string;
  description: string;
  createdAt: string;
  userId: number;
  placeId: number;
  imageData?: string | null;
  imageType?: string | null;
  status: string;
  quality?: ItemQuality | null;
  weight?: number | null;
  user: ItemUser;
  place?: Place;
}

interface Shipment {
  id: number;
  itemId: number;
  userId: number;
  type: string;
  claimType?: string | null;
  receivedAt?: string | null;
  receiverAddress?: string | null;
  isAutoApproved: boolean;
  status: ShipmentStatus;
  createdAt: string;
  deliveredDate?: string | null;
  shipmentCost?: number | null;
  paymentStatus?: PaymentStatus | null;
  paymentTotal?: number | null;
  paymentInvoice?: string | null;
  distance?: number | null;
  item: Item;
}

type TabKey = "Semua" | "Pilih" | "Perjalanan" | "AmbilSendiri" | "Selesai";

const TABS: { key: TabKey; label: string }[] = [
  { key: "Semua", label: "Semua" },
  { key: "Pilih", label: "Pilih Pengiriman" },
  { key: "Perjalanan", label: "Dalam Perjalanan" },
  { key: "AmbilSendiri", label: "Ambil Sendiri" },
  { key: "Selesai", label: "Selesai" },
];

const TAB_TO_ACTION: Record<TabKey, string> = {
  Semua: "Semua",
  Pilih: "Pilih",
  Perjalanan: "Perjalanan",
  AmbilSendiri: "Perjalanan",
  Selesai: "Selesai",
};

const QUALITY_LABEL: Record<ItemQuality, string> = {
  SangatBaik: "Sangat Baik",
  Baik: "Baik",
  CukupBaik: "Cukup Baik",
  Layak: "Layak",
  CukupLayak: "Cukup Layak",
};

const CATEGORY_EMOJI: Record<string, string> = {
  Elektronik: "💻",
  Pakaian: "👕",
  Furnitur: "🪑",
  Buku: "📚",
  Mainan: "🧸",
  Olahraga: "⚽",
  Dapur: "🍳",
  Kesehatan: "💊",
  Pendidikan: "📖",
};

const EMPTY_MSG: Record<TabKey, string> = {
  Semua: "Kamu belum mengambil barang donasi apapun.",
  Pilih: "Tidak ada barang yang menunggu pilihan pengiriman.",
  Perjalanan: "Tidak ada barang yang sedang dalam perjalanan.",
  AmbilSendiri: "Tidak ada barang yang menunggu diambil sendiri.",
  Selesai: "Belum ada barang yang selesai diterima.",
};

function formatCurrency(value?: number | null) {
  if (value == null) return "Belum ditetapkan";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function getStatusBadge(status: ShipmentStatus, type?: string, paymentStatus?: PaymentStatus | null) {
  if (status === "Approved") {
    if (type === "pickup") {
      return { label: "Menunggu Diambil", cls: "bg-blue-50 text-blue-700" };
    }
    if (type === "delivery") {
      if (paymentStatus === "Paid") return { label: "Sedang Diantar", cls: "bg-teal-50 text-teal-700" };
      if (paymentStatus === "Unpaid") return { label: "Menunggu Pembayaran", cls: "bg-amber-50 text-amber-700" };
      if (paymentStatus === "WaitingVerification") return { label: "Menunggu Verifikasi", cls: "bg-amber-50 text-amber-700" };
      if (paymentStatus === "Failed") return { label: "Pembayaran Ditolak", cls: "bg-red-50 text-red-600" };
    }
  }

  return {
    Pending: { label: "Pilih Pengiriman", cls: "bg-amber-50 text-amber-700" },
    Approved: { label: "Disetujui", cls: "bg-green-50 text-green-700" },
    Rejected: { label: "Ditolak", cls: "bg-red-50 text-red-600" },
    Delivered: { label: "Selesai", cls: "bg-green-50 text-green-700" },
  }[status];
}

function getClaimTypeDisplay(claimType?: string | null) {
  if (!claimType) return { label: "Belum Ditentukan", isUnset: true };
  if (claimType === "delivery") return { label: "Kurir Eksternal", isUnset: false };
  if (claimType === "pickup") return { label: "Pick-up Relawan", isUnset: false };
  return { label: claimType, isUnset: false };
}

function getDeliveryPaymentLabel(paymentStatus?: PaymentStatus | null) {
  if (paymentStatus === "Unpaid") return "Menunggu Pembayaran";
  if (paymentStatus === "WaitingVerification") return "Verifikasi Pembayaran";
  if (paymentStatus === "Failed") return "Pembayaran Ditolak";
  if (paymentStatus === "Paid") return "Pembayaran Berhasil";
  return "Biaya Pengiriman";
}

function getCtaConfig(status: ShipmentStatus, claimType?: string | null, paymentStatus?: PaymentStatus | null) {
  if (status === "Delivered") {
    return { label: "Selesai Diterima", cls: "bg-green-700 text-white", href: null as string | null };
  }

  if (status === "Pending") {
    return { label: "Pilih Jenis Pengiriman", cls: "bg-amber-500 text-white", href: null as string | null };
  }

  if (status === "Approved" && claimType === "delivery") {
    if (paymentStatus === "Unpaid" || paymentStatus === "Failed") {
      return {
        label: paymentStatus === "Failed" ? "Upload Ulang Bukti Transfer" : "Upload Bukti Transfer",
        cls: paymentStatus === "Failed" ? "bg-red-600 text-white" : "bg-amber-500 text-white",
        href: "payment",
      };
    }

    if (paymentStatus === "WaitingVerification") {
      return {
        label: "Menunggu Verifikasi Pembayaran",
        cls: "border border-amber-200 bg-amber-50 text-amber-700",
        href: null as string | null,
      };
    }

    return { label: "Sedang Diantar", cls: "bg-teal-700 text-white", href: null as string | null };
  }

  if (status === "Approved" && claimType === "pickup") {
    return {
      label: "Menunggu diambil",
      cls: "bg-blue-600 text-white",
      href: null as string | null,
    };
  }

  return { label: "Lihat Detail", cls: "bg-slate-100 text-slate-700", href: null as string | null };
}

function filterByTab(shipments: Shipment[], tab: TabKey): Shipment[] {
  if (tab === "Perjalanan") {
    return shipments.filter((shipment) => shipment.status === "Approved" && shipment.claimType === "delivery");
  }

  if (tab === "AmbilSendiri") {
    return shipments.filter((shipment) => shipment.status === "Approved" && shipment.claimType === "pickup");
  }

  return shipments;
}

function ItemImage({
  item,
  badgeLabel,
  badgeCls,
}: {
  item: Item;
  badgeLabel: string;
  badgeCls: string;
}) {
  const imgSrc = item.imageData && item.imageType ? `/api/Barang/getImage/${item.id}` : null;

  return (
    <div className="relative w-full aspect-[16/10] rounded-t-2xl overflow-hidden bg-slate-100">
      {imgSrc ? (
        <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 via-slate-50 to-slate-100">
          <span className="text-5xl">{CATEGORY_EMOJI[item.category] ?? "📦"}</span>
          <span className="text-xs text-slate-400 mt-2">{item.category}</span>
        </div>
      )}
      <span className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full ${badgeCls}`}>
        {badgeLabel}
      </span>
    </div>
  );
}

function ShipmentCard({ shipment }: { shipment: Shipment }) {
  const { item, status, claimType, id, itemId, paymentStatus, paymentTotal, paymentInvoice, shipmentCost } = shipment;
  const badge = getStatusBadge(status, claimType ?? undefined, paymentStatus);
  const claimDisplay = getClaimTypeDisplay(claimType);
  const cta = getCtaConfig(status, claimType, paymentStatus);
  const deliveryAmount = paymentTotal ?? shipmentCost;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
      <ItemImage item={item} badgeLabel={badge.label} badgeCls={badge.cls} />

      <div className="p-5 flex flex-col gap-4 flex-1">
        <h3 className="font-bold text-slate-900 text-[15px] leading-snug">{item.name}</h3>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Kategori</p>
            <p className="text-sm text-slate-700">{item.category}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Kualitas</p>
            <p className="text-sm text-slate-700">{item.quality ? QUALITY_LABEL[item.quality] : "-"}</p>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-2">Pengambilan &amp; Kurir</p>
          <div className="flex flex-col gap-1.5">
            {item.place && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-slate-600">{item.place.name}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              {claimDisplay.isUnset ? (
                <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="1" y="3" width="15" height="13" rx="2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8h4l3 5v4h-7V8z" />
                  <circle cx="5.5" cy="18.5" r="1.5" strokeWidth={2} />
                  <circle cx="18.5" cy="18.5" r="1.5" strokeWidth={2} />
                </svg>
              )}
              <span className={`text-sm ${claimDisplay.isUnset ? "text-red-500" : "text-slate-600"}`}>
                {claimDisplay.label}
              </span>
            </div>
          </div>
        </div>

        {status === "Approved" && claimType === "delivery" && (
          <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-50 border border-teal-100">
            <svg className="w-4 h-4 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-teal-500">
                {getDeliveryPaymentLabel(paymentStatus)}
              </p>
              <p className="text-sm font-semibold text-teal-800">{formatCurrency(deliveryAmount)}</p>
              {paymentInvoice && <p className="text-[10px] text-teal-600 mt-0.5">{paymentInvoice}</p>}
            </div>
          </div>
        )}

        {status === "Approved" && claimType === "pickup" && (
          <div className="mt-2 flex flex-col gap-2 p-3.5 rounded-xl bg-amber-50/50 border border-amber-100/80">
            <div className="flex items-start gap-2.5">
              <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <div className="text-xs text-amber-900">
                <p className="font-bold text-[10px] uppercase tracking-widest text-amber-700">Detail Pengambilan</p>
                {item.place ? (
                  <div className="mt-1 space-y-1">
                    <p className="font-bold text-slate-800">{item.place.name}</p>
                    <p className="text-slate-600 leading-relaxed"><span className="font-medium text-amber-800">Alamat:</span> {item.place.address}</p>
                    <p className="text-slate-600"><span className="font-medium text-amber-800">Jam Operasional:</span> {item.place.operationalJam}</p>
                  </div>
                ) : (
                  <p className="mt-1 text-slate-500">Detail gudang tidak tersedia.</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1" />

        {status === "Pending" ? (
          <Link
            href={`form/pilihPengiriman?shipmentId=${id}&itemId=${itemId}&placeId=${item.placeId}&from=barangSaya`}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-opacity hover:opacity-90 active:opacity-75 ${cta.cls}`}
          >
            {cta.label}
          </Link>
        ) : cta.href === "payment" ? (
          <Link
            href={`form/uploadBuktiTransfer?shipmentId=${id}`}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-opacity hover:opacity-90 active:opacity-75 ${cta.cls}`}
          >
            {cta.label}
          </Link>
        ) : (
          <div className={`w-full py-2.5 rounded-xl text-sm font-semibold text-center ${cta.cls}`}>
            {cta.label}
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
      <div className="w-full aspect-[16/10] bg-slate-100" />
      <div className="p-5 space-y-4">
        <div className="h-5 bg-slate-100 rounded w-3/4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="h-3 bg-slate-100 rounded w-1/2" />
            <div className="h-4 bg-slate-100 rounded w-3/4" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 bg-slate-100 rounded w-1/2" />
            <div className="h-4 bg-slate-100 rounded w-3/4" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="h-3 bg-slate-100 rounded w-1/3" />
          <div className="h-4 bg-slate-100 rounded w-1/2" />
          <div className="h-4 bg-slate-100 rounded w-2/3" />
        </div>
        <div className="h-10 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}

function EmptyState({ tab }: { tab: TabKey }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <Mailbox size={48} className="text-gray-400 mb-4" />
      <p className="text-slate-400 text-sm max-w-xs">{EMPTY_MSG[tab]}</p>
    </div>
  );
}

export default function BarangSayaPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("Semua");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [totalBarang, setTotalBarang] = useState(0);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/Pengguna", {
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();

        if (!res.ok || !data.id) {
          router.replace("/login");
          return;
        }

        setUserId(data.id);
      } catch {
        router.replace("/login");
      }
    }

    checkSession();
  }, [router]);

  useEffect(() => {
    if (userId === null) return;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const action = TAB_TO_ACTION[activeTab];
        const res = await fetch(`/api/Barang/getMyBarang?action=${action}`, {
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.message ?? "Gagal memuat data");
        }

        const body = await res.json();
        const data: Shipment[] = body.data ?? [];

        setShipments(data);
        if (activeTab === "Semua") {
          setTotalBarang(data.length);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [activeTab, userId]);

  const displayed = filterByTab(shipments, activeTab);

  return (
    <main className="min-h-screen bg-[#F4F6F5] font-sans">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-screen-2xl mx-auto px-6 pt-6 pb-0">
          <div className="flex items-center gap-2 mb-5">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke Dashboard
            </Link>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Barang Saya</h1>
            {totalBarang > 0 && (
              <div className="flex items-center gap-3 bg-[#0F7B5F] text-white px-5 py-3 rounded-xl shadow-sm">
                <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                </svg>
                <div>
                  <p className="font-bold text-lg leading-none">{totalBarang} Barang</p>
                  <p className="text-[10px] uppercase tracking-widest opacity-75 mt-0.5">Total Kontribusi</p>
                </div>
              </div>
            )}
          </div>

          <nav className="flex gap-0 overflow-x-auto -mb-px">
            {TABS.map(({ key, label }) => {
              const isActive = key === activeTab;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-5 pb-3 pt-1 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${isActive
                    ? "border-teal-600 text-teal-700"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <p className="text-slate-700 font-semibold mb-1">Terjadi Kesalahan</p>
            <p className="text-slate-400 text-sm mb-5">{error}</p>
            <button
              onClick={() => {
                const currentTab = activeTab;
                setActiveTab("Semua");
                setTimeout(() => setActiveTab(currentTab), 10);
              }}
              className="px-5 py-2 bg-teal-700 text-white rounded-xl text-sm font-medium hover:bg-teal-800 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!error && !loading && displayed.length === 0 && (
          <EmptyState tab={activeTab} />
        )}

        {!error && (
          <div className="max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} />)
            ) : (
              displayed.map((shipment) => <ShipmentCard key={shipment.id} shipment={shipment} />)
            )}
          </div>
        )}
      </div>
    </main>
  );
}
