import { FaAddressCard } from "@react-icons/all-files/fa/FaAddressCard";
import { FaBuilding } from "@react-icons/all-files/fa/FaBuilding";
import { HiLocationMarker } from "@react-icons/all-files/hi/HiLocationMarker";
import { AiOutlineTeam } from "@react-icons/all-files/ai/AiOutlineTeam";
import { RiGovernmentFill } from "@react-icons/all-files/ri/RiGovernmentFill";
import { MdThumbDown } from "@react-icons/all-files/md/MdThumbDown";
import { FaRegCalendar } from "@react-icons/all-files/fa/FaRegCalendar";
import DetailBox from "@/components/detail/DetailBox";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
  const sessions = await auth();

  if (sessions && sessions.user) {
    return (
      <div className="w-[90%] md:w-[90%] mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 ">
        <DetailBox
          icon={<FaAddressCard className="w-8 h-8 text-red-800" />}
          info={[
            { title: "Capitale di rete", value: "3.47" },
            {
              title: "Luogo di nascita",
              value: "Napoli, NA",
            },
            {
              title: "Data di nascita",
              value: "06/10/1999",
            },
          ]}
          title="Anagrafica"
          idUser={params.id}
        />

        {sessions && sessions.user.role === "admin" && (
          <DetailBox
            icon={<FaBuilding className="w-8 h-8 text-red-800" />}
            info={[{ title: "Partecipazioni", value: "1" }]}
            title="Proprietà"
            idUser={params.id}
          />
        )}

        <DetailBox
          icon={<HiLocationMarker className="w-8 h-8 text-red-800" />}
          info={[{ title: "indirizzi", value: "2" }]}
          title="Indirizzi"
          idUser={params.id}
        />
        <DetailBox
          icon={<AiOutlineTeam className="w-8 h-8 text-red-800" />}
          info={[{ title: "Imprese con incarichi", value: "4" }]}
          title="Controllo"
          idUser={params.id}
        />
        <DetailBox
          icon={<RiGovernmentFill className="w-8 h-8 text-red-800" />}
          info={[{ title: "Cariche ricoperte", value: "4" }]}
          title="Cariche pubbliche"
          idUser={params.id}
        />
        <DetailBox
          icon={<MdThumbDown className="w-8 h-8 text-red-800" />}
          info={[{ title: "Cariche ricoperte", value: "4" }]}
          title="Negatività"
          idUser={params.id}
        />
        <DetailBox
          icon={<FaRegCalendar className="w-8 h-8 text-red-800" />}
          info={[{ title: "Precedenti incarichi", value: "1" }]}
          title="Storia"
          idUser={params.id}
        />
      </div>
    );
  } else {
    redirect("/");
  }
}
