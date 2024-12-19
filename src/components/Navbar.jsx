import React from "react";

const Navbar = () => {
  return (
    <div className="className=h-12 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-blue-400 text-xl font-bold">PEREPARED</h1>
        <span className="text-slate-400 text-sm">Tools</span>
      </div>
    </div>
  );
};

export default Navbar;
