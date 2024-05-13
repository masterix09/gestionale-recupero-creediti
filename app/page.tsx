import FormLogin from "@/components/Home/FormLogin";
import FormRicerca from "@/components/Home/FormRicerca";
import { auth } from "@/lib/auth";

export default async function Home() {
  const sessions = await auth();

  if (sessions && sessions.user) {
    return (
      <div className="w-full lg:w-[80%] mx-auto h-full px-3">
        <FormRicerca />
      </div>
    );
  } else {
    return <FormLogin />;
  }
}
