import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full bg-white/80 flex flex-col gap-4 justify-center items-center overflow-hidden z-50">
      <div className="animate-spin rounded-full border-solid border-4 border-t-red-500 border-black w-12 h-12" />
      <span>Loading</span>
    </div>
  );
};

export default LoadingSpinner;
