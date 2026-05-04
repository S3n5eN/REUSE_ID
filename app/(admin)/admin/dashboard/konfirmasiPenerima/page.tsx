"use client";
import { useEffect, useState } from "react";

type UserProfile = {
  namaLengkap: string;
  phone: string;
  pekerjaan: string;
  usia: number;
  gender: string;
};

type Shipment = {
  id: number;
  status: string;
  type: string;
  claimType?: string;
  deliveredDate?: string;
  userProfile?: UserProfile;
  item?: { name: string };
};

export default function KonfirmasiPenerimaPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(false);

  // Ambil data shipment claim yang approved tapi belum delivered
  useEffect(() => {
    fetch("/api/Pengguna/getPenerimaApprove")
      .then(res => res.json())
      .then(data => {
        console.log("Data shipments:", data);
        setShipments(data.data); // ambil array di field data
      })
      .catch(err => console.error("Error fetch shipments:", err));
  }, []);

  // Handler konfirmasi
  const handleConfirm = async (shipmentId: number) => {
    try {
      setLoading(true);
      const res = await fetch("/api/Admin/konfirmasiTerima", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipmentId }),
      });

      const data = await res.json();
      console.log("Response konfirmasi:", data);

      if (!res.ok) {
        alert("Error: " + data.message);
        return;
      }

      alert(`${data.message} | Poin diberikan: ${data.poinDiberikan}`);
      // Hapus shipment dari list setelah konfirmasi
      setShipments(shipments.filter((s) => s.id !== shipmentId));
    } catch (err) {
      console.error("Error konfirmasi:", err);
      alert("Terjadi error di frontend");
    } finally {
      setLoading(false);
    }
  };

  // Handler tolak
  const handleReject = async (shipmentId: number) => {
    try {
      setLoading(true);
      const res = await fetch("/api/rejectShipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipmentId }),
      });

      const data = await res.json();
      console.log("Response tolak:", data);

      if (!res.ok) {
        alert("Error: " + data.message);
        return;
      }

      alert(data.message);
      setShipments(shipments.filter((s) => s.id !== shipmentId));
    } catch (err) {
      console.error("Error tolak:", err);
      alert("Terjadi error di frontend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Konfirmasi Penerima Barang</h1>
      {loading && <p className="text-blue-500">Memproses...</p>}

      <div className="space-y-4">
        {shipments.length === 0 && (
          <p className="text-gray-500">Belum ada penerima untuk dikonfirmasi.</p>
        )}

        {shipments.map((s) => (
          <div key={s.id} className="border rounded-lg p-4 shadow-sm bg-white">
            <h2 className="font-semibold text-lg">{s.userProfile?.namaLengkap}</h2>
            <p>📞 Phone: {s.userProfile?.phone}</p>
            <p>💼 Pekerjaan: {s.userProfile?.pekerjaan}</p>
            <p>🎂 Usia: {s.userProfile?.usia}</p>
            <p>🚻 Gender: {s.userProfile?.gender}</p>
            <p>📦 Barang: {s.item?.name}</p>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleConfirm(s.id)}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Konfirmasi
              </button>
              <button
                onClick={() => handleReject(s.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Tolak
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
