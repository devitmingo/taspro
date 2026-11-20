import Image from "next/image";
import GradientButton from "@/components/ui/GradientButton";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";

export default function ProfileCard({ profile }: { profile: any }) {
  const router = useRouter();

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    profile?.name ||
    (profile?.mobile ? `+91 ${profile.mobile}` : "User");

  return (
    <div className="flex flex-col mb-10 items-center lg:items-start text-center lg:text-left">
      {profile?.profile_url ? (
        <Image
          src={profile.profile_url}
          alt="profile"
          width={100}
          height={100}
          className="w-[100px] h-[100px] rounded-full object-cover overflow-hidden mb-3"
        />
      ) : (
        <div className="w-[100px] h-[100px] rounded-full bg-orange-100 text-[#FF6A00] flex items-center justify-center font-bold text-3xl border-2 border-orange-200 mb-3">
          {displayName && displayName !== "User" && !displayName.startsWith("+91") ? (
            <span>{displayName.charAt(0).toUpperCase()}</span>
          ) : (
            <User className="w-12 h-12 text-[#FF6A00]" />
          )}
        </div>
      )}

      <h4 className="font-semibold text-[#0A0F0D] dark:text-white text-[16px]">
        {displayName}
      </h4>

      <p className="text-[#808080] text-[14px] dark:text-gray-200">
        {profile?.email || "No email added"}
      </p>

      <div className="flex gap-2 md:gap-3 mt-5">
        <GradientButton
          text="My Bookings"
          width="w-[150px] md:w-[185px]"
          height="h-[35px]"
          textClassName="text-[16px]"
          onClick={() => router.push("/my-booking")}
        />

        <GradientButton
          text="Help Center"
          width="w-[150px] md:w-[185px]"
          height="h-[35px]"
          textClassName="text-[16px]"
          onClick={() => router.push("/contact-us")}
        />
      </div>
    </div>
  );
}
