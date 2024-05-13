import Link from "next/link";
import React, { ReactNode } from "react";

const SidebarItem = ({
  icon,
  title,
  href,
}: {
  icon: ReactNode;
  title: string;
  href: string;
}) => {
  return (
    <Link
      href={href}
      className="w-full py-3 hover:bg-red-800 bg-transparent transition-all flex gap-x-3 items-center justify-start group px-3 rounded-lg"
    >
      {/* <FaHome className="w-6 h-6 text-red-800 group-hover:text-slate-300 transition-all" /> */}
      {icon}
      <span className="text-lg font-semibold text-black group-hover:text-slate-300 transition-all">
        {title}
      </span>
    </Link>
  );
};

export default SidebarItem;
