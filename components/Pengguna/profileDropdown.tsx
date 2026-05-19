import { LogOut, User, Box } from "lucide-react";
import Link from "next/link";

type ProfileDropdownProps = {
  namapengguna: string;
  onLogout?: () => void;
  onProfile: () => void;
};

export default function ProfileDropdown({
  namapengguna,
  onLogout,
  onProfile
}: ProfileDropdownProps) {

  return (

    <div className="absolute bg-white w-60 h-49 top-10 right-0 px-2 rounded-md shadow-lg text-sm text-white">

      {/* HEADER */}
      <div className="flex pb-2 px-4 pt-3 items-center border-b border-b-slate-300">

        <img
          src="/api/Pengguna/photoProfile"
          alt={namapengguna}
          onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(namapengguna)}&background=0D8ABC&color=fff`; }}
          className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm mr-3"
        />

        <span className="text-md font-semibold text-slate-600">
          {namapengguna}
        </span>

      </div>

      {/* MENU */}
      <div className="flex flex-col px-3 py-2">

        {/* PROFILE */}
        <button
          onClick={onProfile}
          className="w-full flex px-3 py-2.5 gap-3 rounded-xl cursor-pointer text-gray-400 border border-transparent transition-all duration-200
                     hover:bg-[#007582]/10 hover:text-[#007582] hover:border-[#007582]"
        >

          <span className="shrink-0 w-4.5 flex items-center justify-center">
            <User size={16} />
          </span>

          Profile

        </button>

        {/* BARANG SAYA */}
        <Link href="/dashboard/barangSaya">

          <div
            className="w-full flex px-3 py-2.5 gap-3 rounded-xl cursor-pointer text-gray-400 border border-transparent transition-all duration-200
                       hover:bg-[#007582]/10 hover:text-[#007582] hover:border-[#007582]"
          >

            <span className="shrink-0 w-4.5 flex items-center justify-center">
              <Box size={16} />
            </span>

            Barang Saya

          </div>

        </Link>

        {/* LOGOUT */}
        <button
          onClick={onLogout}
          className="w-full"
        >

          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
                       text-gray-400 border border-transparent transition-all duration-200
                       hover:bg-red-50 hover:text-red-500 hover:border-red-100"
          >

            <span className="shrink-0 w-4.5 flex items-center justify-center">
              <LogOut size={16} />
            </span>

            <span className="text-sm font-medium whitespace-nowrap">
              Keluar
            </span>

          </div>

        </button>

      </div>

    </div>
  );
}	