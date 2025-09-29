import React from "react";
import { AiOutlineHome } from "@react-icons/all-files/ai/AiOutlineHome";
import { RiMoneyEuroCircleLine } from "@react-icons/all-files/ri/RiMoneyEuroCircleLine";
import { RiUserAddLine } from "@react-icons/all-files/ri/RiUserAddLine";
import { FiUpload } from "@react-icons/all-files/fi/FiUpload";
import { RiSettingsLine } from "@react-icons/all-files/ri/RiSettingsLine";
import SidebarItem from "./SidebarItem";

const Sidebar = () => {
  return (
    <div className="flex flex-col gap-y-3">
      <SidebarItem
        icon={
          <AiOutlineHome className="w-6 h-6 text-red-800 group-hover:text-slate-300 transition-all" />
        }
        title="Home"
        href="/"
      />
      <SidebarItem
        icon={
          <RiMoneyEuroCircleLine className="w-6 h-6 text-red-800 group-hover:text-slate-300 transition-all" />
        }
        title="Getsione plafond"
        href="/admin/plafond"
      />
      <SidebarItem
        icon={
          <RiUserAddLine className="w-6 h-6 text-red-800 group-hover:text-slate-300 transition-all" />
        }
        title="Creazione utente"
        href="/admin/add-user"
      />
      <SidebarItem
        icon={
          <FiUpload className="w-6 h-6 text-red-800 group-hover:text-slate-300 transition-all" />
        }
        title="Caricamento dati"
        href="/admin/upload"
      />
      <SidebarItem
        icon={
          <FiUpload className="w-6 h-6 text-red-800 group-hover:text-slate-300 transition-all" />
        }
        title="Modifica Utente"
        href="/admin/updateUser"
      />
      <SidebarItem
        icon={
          <RiSettingsLine className="w-6 h-6 text-red-800 group-hover:text-slate-300 transition-all" />
        }
        title="Gestione Token"
        href="/admin/token-management"
      />
    </div>
  );
};

export default Sidebar;
