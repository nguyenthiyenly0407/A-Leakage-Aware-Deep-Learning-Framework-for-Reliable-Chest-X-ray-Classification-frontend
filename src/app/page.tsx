import Signinpage from "./(auth)/sign-in/page";
// import { isCurrentTokenValid } from "@/lib/jwt_utils";
import { redirect } from "next/navigation";

export default async function Home() {
  return (
    <div className="">
      <Signinpage />
    </div>
  );
}