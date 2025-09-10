"use client";

import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import dynamic from "next/dynamic";

// ✅ Load Leaflet only on client
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
});

const Page = () => {
  const [input, setInput] = useState(""); // what user types
  const [search, setSearch] = useState(""); // confirmed search

  const handleSearch = () => {
    setSearch(input); // update map with submitted search
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div>
      {/* 🔍 Search Bar */}
      <div className="flex bg-gray-200 m-4 p-3 rounded-2xl gap-2 items-center">
        <FaSearch className="text-xl font-bold text-gray-400" />
        <input
          type="text"
          placeholder="Search location or hazard"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-transparent outline-none flex-1"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-3 py-1 rounded-lg"
        >
          Go
        </button>
      </div>

      {/* 🗺️ Map */}
      <div className="w-full h-[80vh]">
        <MapComponent search={search} />
      </div>
    </div>
  );
};

export default Page;
