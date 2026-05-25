"use client";

import { useEffect, useState } from "react";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
} from "chart.js";

import { Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

// FORMAT TANGGAL
const formatDate = (dateString: string) => {

  const date = new Date(dateString);

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export default function DashboardPage() {

  const [data, setData] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);

  // FETCH DASHBOARD
  useEffect(() => {

    const fetchDashboard = async () => {

      try {

        const res = await fetch("/api/Admin/getDashboard", {
          method: "GET",

          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (!res.ok) {
          throw new Error("Gagal mengambil dashboard");
        }

        const json = await res.json();

        console.log(json);

        setData(json);

      } catch (error) {

        console.error(error);

      } finally {

        setIsLoading(false);
      }
    };

    fetchDashboard();

  }, []);

  // LOADING
  if (isLoading) {
    return (
      <div className="p-6 text-gray-500">
        Memuat dashboard...
      </div>
    );
  }

  // ERROR
  if (!data) {
    return (
      <div className="p-6 text-red-500">
        Gagal memuat dashboard
      </div>
    );
  }

  // ==========================
  // DONUT CHART REALTIME
  // ==========================

  // MAPPING STATUS
  const shipmentMap: any = {

    Pending: {
      label: "Belum Dikirim",
      color: "#F59E0B"
    },

    Approved: {
      label: "Dalam Perjalanan",
      color: "#17836C"
    },

    Delivered: {
      label: "Tiba Di Lokasi",
      color: "#2563EB"
    },

  };

  // TOTAL SHIPMENT
  const totalShipment =
    data?.shipmentStatus?.reduce(
      (acc: number, curr: any) =>
        acc + curr._count.status,
      0
    ) || 0;

  // DATA CHART
  const shipmentChartData = {

    labels:
      data?.shipmentStatus?.map(
        (item: any) =>
          shipmentMap[item.status]?.label
      ) || [],

    datasets: [
      {
        data:
          data?.shipmentStatus?.map(
            (item: any) =>
              item._count.status
          ) || [],

        backgroundColor:
          data?.shipmentStatus?.map(
            (item: any) =>
              shipmentMap[item.status]?.color
          ) || [],

        borderWidth: 0,

        cutout: "75%"
      }
    ]
  };

  return (

    <div className="flex-1 bg-[#F6F8F7] p-6 overflow-y-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">

        <div>

          <h1 className="text-3xl font-bold text-gray-800">
            Ringkasan Dashboard
          </h1>

          <p className="text-gray-500 mt-1">

            Operasional per:{" "}

            <span className="font-semibold text-[#17836C]">
              Hari Ini
            </span>

          </p>

        </div>

      </div>

      {/* ========================== */}
      {/* SUMMARY CARDS */}
      {/* ========================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 mb-6">

        {/* TOTAL ITEM */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">

          <div className="w-14 h-14 rounded-xl bg-[#DDF5EF] flex items-center justify-center text-[#17836C] text-2xl">
            📦
          </div>

          <div className="mt-6">

            <p className="text-gray-500 text-sm">
              Total Donasi
            </p>

            <h1 className="text-3xl font-bold text-gray-800 mt-1">
              {data?.totalItem}
            </h1>

          </div>

        </div>

        {/* PENDING */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">

          <div className="w-14 h-14 rounded-xl bg-[#FDECEC] flex items-center justify-center text-red-500 text-2xl">
            ⏳
          </div>

          <div className="mt-6">

            <p className="text-gray-500 text-sm">
              Verifikasi Barang
            </p>

            <h1 className="text-3xl font-bold text-gray-800 mt-1">
              {data?.pendingItem}
            </h1>

          </div>

        </div>

        {/* PENDING PAYMENT */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">

          <div className="w-14 h-14 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 text-2xl font-bold">
            💳
          </div>

          <div className="mt-6">

            <p className="text-gray-500 text-sm">
              Verifikasi Pembayaran
            </p>

            <h1 className="text-3xl font-bold text-gray-800 mt-1">
              {data?.pendingPaymentCount || 0}
            </h1>

          </div>

        </div>

        {/* DIAMBIL */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">

          <div className="w-14 h-14 rounded-xl bg-[#DDF5EF] flex items-center justify-center text-[#17836C] text-2xl">
            🚚
          </div>

          <div className="mt-6">

            <p className="text-gray-500 text-sm">
              Pengiriman Selesai
            </p>

            <h1 className="text-3xl font-bold text-gray-800 mt-1">
              {data?.totalDiambil}
            </h1>

          </div>

        </div>

        {/* TERSEDIA */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">

          <div className="w-14 h-14 rounded-xl bg-[#DDF5EF] flex items-center justify-center text-[#17836C] text-2xl">
            🏷️
          </div>

          <div className="mt-6">

            <p className="text-gray-500 text-sm">
              Barang Tersedia
            </p>

            <h1 className="text-3xl font-bold text-gray-800 mt-1">
              {data?.totalTersedia}
            </h1>

          </div>

        </div>

      </div>

      {/* ========================== */}
      {/* CHART SECTION */}
      {/* ========================== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">

        {/* LEFT COLUMN: PENDING LISTS STACK */}
        <div className="xl:col-span-2 space-y-6">

          {/* PERSETUJUAN TERTUNDA (BARANG) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Persetujuan Tertunda
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Barang yang menunggu verifikasi admin
                </p>
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8FAF9]">
                  <tr className="text-left text-sm text-gray-500">
                    <th className="px-6 py-4">ITEM</th>
                    <th className="px-6 py-4">PENGIRIM</th>
                    <th className="px-6 py-4">WAKTU</th>
                    <th className="px-6 py-4">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.pendingList && data.pendingList.length > 0 ? (
                    data.pendingList.map((item: any) => (
                      <tr key={item.id} className="border-t border-gray-100">
                        {/* ITEM */}
                        <td className="px-6 py-5">
                          <div>
                            <h1 className="font-semibold text-gray-800">{item.name}</h1>
                            <p className="text-sm text-gray-500">{item.category}</p>
                          </div>
                        </td>
                        {/* USER */}
                        <td className="px-6 py-5 text-gray-700">{item.user?.name || "Anonim"}</td>
                        {/* WAKTU */}
                        <td className="px-6 py-5 text-gray-700">{formatDate(item.createdAt)}</td>
                        {/* STATUS */}
                        <td className="px-6 py-5">
                          <span className="px-3 py-1 rounded-full bg-red-100 text-red-500 text-sm font-semibold">
                            Pending
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-400 text-sm">
                        Tidak ada persetujuan barang tertunda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

          {/* PERSETUJUAN PEMBAYARAN TERTUNDA */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Persetujuan Pembayaran Tertunda
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Pembayaran yang menunggu verifikasi admin
                </p>
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8FAF9]">
                  <tr className="text-left text-sm text-gray-500">
                    <th className="px-6 py-4">ITEM</th>
                    <th className="px-6 py-4">PENGIRIM</th>
                    <th className="px-6 py-4">WAKTU UPLOAD</th>
                    <th className="px-6 py-4">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.pendingPaymentList && data.pendingPaymentList.length > 0 ? (
                    data.pendingPaymentList.map((payment: any) => (
                      <tr key={payment.id} className="border-t border-gray-100">
                        {/* ITEM */}
                        <td className="px-6 py-5">
                          <div>
                            <h1 className="font-semibold text-gray-800">
                              {payment.item?.name || "Barang"}
                            </h1>
                            <p className="text-sm text-gray-500">
                              {payment.item?.category || "-"}
                            </p>
                          </div>
                        </td>
                        {/* USER */}
                        <td className="px-6 py-5 text-gray-700">{payment.user?.name || "Anonim"}</td>
                        {/* WAKTU */}
                        <td className="px-6 py-5 text-gray-700">
                          {payment.transferProofUploadedAt ? formatDate(payment.transferProofUploadedAt) : "-"}
                        </td>
                        {/* STATUS */}
                        <td className="px-6 py-5">
                          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-600 text-xs font-semibold whitespace-nowrap">
                            Waiting Verification
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-400 text-sm">
                        Tidak ada pembayaran tertunda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>

        {/* DONUT CHART */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">

          <h1 className="text-xl font-bold text-gray-800 mb-6">
            Status Shipment
          </h1>

          {/* CHART */}
          <div className="relative flex justify-center items-center">

            <div className="w-[250px] h-[250px]">

              <Doughnut
                data={shipmentChartData}

                options={{

                  responsive: true,

                  maintainAspectRatio: false,

                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }}
              />

            </div>

            {/* TOTAL DI TENGAH */}
            <div className="absolute flex flex-col items-center">

              <h1 className="text-4xl font-bold text-gray-800">
                {totalShipment}
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                TOTAL SHIPMENT
              </p>

            </div>

          </div>

          {/* LEGEND */}
          <div className="mt-8 space-y-4">

            {data?.shipmentStatus?.map((item: any) => {

              const total =
                item._count.status;

              const percentage =
                totalShipment > 0
                  ? ((total / totalShipment) * 100).toFixed(0)
                  : 0;

              return (

                <div
                  key={item.status}
                  className="flex items-center justify-between"
                >

                  {/* LEFT */}
                  <div className="flex items-center gap-3">

                    {/* DOT */}
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          shipmentMap[item.status]?.color
                      }}
                    />

                    {/* LABEL */}
                    <p className="text-gray-700">
                      {shipmentMap[item.status]?.label}
                    </p>

                  </div>

                  {/* PERCENT */}
                  <span className="font-semibold text-gray-800">
                    {percentage}%
                  </span>

                </div>
              );
            })}

          </div>

        </div>

      </div>

      

    </div>
  );
}