import React from "react";

const Helpline = () => {
  return (
    <div>
      <div className="bg-slate-900 text-white rounded shadow-lg border border-slate-700">
              <div className="flex items-center p-4">
          <div className="flex-none w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">2401 Homestead Rd.</h3>
              <span className="text-sm text-gray-400">12:08</span>
            </div>
            <p className="text-sm text-gray-400">Santa Clara, CA 95050</p>
            <div className="mt-2 flex items-center">
              <span className="px-2 py-1 bg-red-900/50 text-red-400 text-xs rounded">
                Commercial Fire
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>  
  );
};

export default Helpline;
