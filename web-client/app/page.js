"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className=" p-2 m-auto mt-10 rounded-lg border border-solid bottom-2 border-purple-400 w-fit cursor-pointer"
      onClick={() => {
        router.push('/room1');
      }}
    >Join Room</div>
  );
}
