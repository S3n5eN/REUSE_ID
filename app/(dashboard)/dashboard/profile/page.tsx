"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {

  const [profile, setProfile] =
    useState<any>(null);

  useEffect(() => {

    const fetchProfile = async () => {

      try {

        const res = await fetch(
          "/api/Pengguna/profile",
          {

            method: "GET",

            headers: {
              Authorization:
                `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        const data =
          await res.json();

        setProfile(data.data);

      } catch (error) {

        console.error(error);
      }
    };

    fetchProfile();

  }, []);

  if (!profile) {

    return (
      <div className="p-6">
        Loading...
      </div>
    );
  }

  return (

    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Profile Saya
      </h1>

      <div className="space-y-4">

        <div>
          <p className="text-gray-500">
            Nama Lengkap
          </p>

          <h2 className="font-semibold">
            {profile.namaLengkap}
          </h2>
        </div>

        <div>
          <p className="text-gray-500">
            Nomor HP
          </p>

          <h2 className="font-semibold">
            {profile.phone}
          </h2>
        </div>

        <div>
          <p className="text-gray-500">
            Alamat
          </p>

          <h2 className="font-semibold">
            {profile.address}
          </h2>
        </div>

      </div>

    </div>
  );
}