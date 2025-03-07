import { signIn } from "@/lib/auth";
import ButtonLoading from "../common/ButtonLoading";

const FormLogin = () => {
  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-black">
      <div className="w-full lg:w-[60%] mx-auto flex justify-center items-center">
        <div className="w-[50%] mx-auto bg-slate-200 rounded-xl">
          <h2 className="text-black py-3 text-center text-3xl font-semibold">
            Accedi
          </h2>
          <form
            action={async (formData) => {
              "use server";
              try {
                await signIn("credentials", {
                  redirectTo: "/",
                  values: formData,
                });
              } catch (error) {
                // console.log(error);
              }
            }}
            className="w-full flex flex-col gap-y-4 p-3"
          >
            <input
              name="email"
              type="email"
              className="w-full px-3 border-2 border-black rounded-xl py-2"
              placeholder="email"
            />
            <input
              name="password"
              type="password"
              className="w-full px-3 border-2 border-black rounded-xl py-2"
              placeholder="password"
            />
            <ButtonLoading title="LOGIN" />
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormLogin;
