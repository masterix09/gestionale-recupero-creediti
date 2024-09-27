import { FaAddressCard } from "@react-icons/all-files/fa/FaAddressCard";
import { FaBuilding } from "@react-icons/all-files/fa/FaBuilding";
import { MdWork } from "@react-icons/all-files/md/MdWork";
import { AiOutlineTeam } from "@react-icons/all-files/ai/AiOutlineTeam";
import { FaPhone } from "@react-icons/all-files/fa/FaPhone";
import DetailBox from "@/components/detail/DetailBox";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { checkUserPackage } from "@/actions/getUserFromDB";

export default async function Page({ params }: { params: { id: string } }) {
  const sessions = await auth();

  if (sessions && sessions.user) {
    const packageType = await checkUserPackage(sessions.user.email ?? "");
    return (
      <div className="w-[90%] md:w-[90%] mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 ">
        <DetailBox
          icon={<FaAddressCard className="w-8 h-8 text-red-800" />}
          title="Anagrafica"
          idUser={params.id}
        />

        {packageType?.packageType === "premium" && (
          <DetailBox
            icon={<MdWork className="w-8 h-8 text-red-800" />}
            title="Lavoro"
            idUser={params.id}
          />
        )}
        {packageType?.packageType === "gold" && (
          <DetailBox
            icon={<MdWork className="w-8 h-8 text-red-800" />}
            title="Lavoro"
            idUser={params.id}
          />
        )}

        {packageType?.packageType === "premium" && (
          <DetailBox
            icon={<AiOutlineTeam className="w-8 h-8 text-red-800" />}
            title="Ultime SCP"
            idUser={params.id}
          />
        )}
        {packageType?.packageType === "gold" && (
          <DetailBox
            icon={<AiOutlineTeam className="w-8 h-8 text-red-800" />}
            title="Ultime SCP"
            idUser={params.id}
          />
        )}

        {packageType?.packageType === "gold" && (
          <DetailBox
            icon={<FaPhone className="w-8 h-8 text-red-800" />}
            title="Telefono"
            idUser={params.id}
          />
        )}
        {packageType?.packageType === "gold" && (
          <DetailBox
            icon={<FaPhone className="w-8 h-8 text-red-800" />}
            title="ABICAB"
            idUser={params.id}
          />
        )}
      </div>
    );
  } else {
    redirect("/");
  }
}
