import React, { ReactNode } from "react";
import { IoIosArrowForward } from "@react-icons/all-files/io/IoIosArrowForward";
import Link from "next/link";

const DetailBox = ({
  icon,
  info,
  title,
  idUser,
}: {
  title: string;
  info?: {
    title: string;
    value: string;
  }[];
  icon: ReactNode;
  idUser: string;
}) => {
  return (
    <Link
      href={`/category/${title
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()}/${idUser}`}
    >
      <div className="bg-white w-full flex flex-col gap-y-10 p-4 border-4 border-transparent hover:border-red-800 transition-all cursor-pointer">
        <div className="w-full flex justify-between items-center">
          <div className="flex justify-start items-center gap-x-4">
            {icon}
            <h3 className="text-black text-lg font-medium">{title}</h3>
          </div>
          <IoIosArrowForward className="w-8 h-8 text-red-800" />
        </div>
        <div className="flex justify-between items-center">
          {info?.map((item, idx) => {
            return (
              <h4
                className="text-sm md:text-base font-light text-gray-500"
                key={idx}
              >
                {item.title}:{" "}
                <span className="font-semibold text-black text-sm md:text-base">
                  {item.value}
                </span>
              </h4>
            );
          })}
        </div>
      </div>
    </Link>
  );
};

export default DetailBox;
