"use client";

import React from "react";

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
