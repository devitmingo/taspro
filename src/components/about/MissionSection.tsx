import Image from "next/image";

export default function MissionSection() {
  return (
    <section className="py-4 md:py-4 px-4 md:px-6">
      <div className="max-w-[900px] mx-auto grid md:grid-cols-2 md:gap-10 items-center">
        {/* LEFT */}
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl dark:text-white font-semibold mb-6 leading-tight">
            Our Mission
          </h2>
          <p className="text-gray-600 leading-relaxed">
            At TASpro, our mission is to empower homeowners with hassle-free, trusted, and top-tier doorstep services. We combine verified expertise, transparent pricing, and standardized service procedures to make home maintenance effortless and reliable.
          </p>
        </div>

        <div className="relative flex justify-center items-center">
          <Image
            src="/mission.png"
            alt="Mission Image"
            width={400}
            height={300}
          />
        </div>
      </div>
    </section>
  );
}
