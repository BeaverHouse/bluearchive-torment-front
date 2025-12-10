"use client";

import React from "react";

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
      <p>Loading...</p>
    </div>
  );
};

export default Loading;
