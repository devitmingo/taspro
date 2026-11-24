"use client";

import Image from "next/image";
import { useState } from "react";

type Blog = {
  date: string;
  title?: string;
  description?: string;
  image?: string;
};

type BlogDetailProps = {
  blog: Blog | null;
  onBack: () => void;
};

export default function BlogDetail({ blog, onBack }: BlogDetailProps) {
  if (!blog) return null;
  const [likes, setLikes] = useState(335);
  const [dislikes, setDislikes] = useState(30);

  const handleLike = () => {
    setLikes((prev) => prev + 1);
  };

  const handleDislike = () => {
    setDislikes((prev) => prev + 1);
  };

  return (
    <div className="mx-auto px-4">
      <p className="text-orange-500 text-sm font-semibold uppercase">Learn</p>

      <h1 className="text-[32px] font-semibold mt-2">
        Remote Collaboration: Best Practices, Challenges, and Tools
      </h1>

      <div className="flex gap-10 mt-4">
        <span className="flex gap-2 items-center whitespace-nowrap">
          <Image src="/pen.png" alt="Author" width={16} height={16} />
          By Admin
        </span>
        <span className="flex gap-2 items-center whitespace-nowrap">
          <Image src="/Calendar.png" alt="Date" width={16} height={16} />
          {blog.date}
        </span>
      </div>

      <div className="mt-6 space-y-4 text-[16px] text-gray-700 leading-relaxed">
        <p>
          Keeping your home appliances in peak operating condition requires regular maintenance and timely inspections. Preventative care not only helps avoid costly emergency repairs, but also reduces monthly electricity costs and ensures your equipment lasts for years to come.
        </p>

        <Image
          src="/img/girlworking.png"
          alt="Technician maintaining appliances"
          width={700}
          height={400}
          className="w-full h-auto rounded-md"
        />

        <p>
          From periodic AC filter washing and refrigerant level checks to cleaning washing machine lint traps and inspecting refrigerator condenser coils, simple seasonal checkups keep your household running smoothly without unexpected breakdowns.
        </p>

        <p>
          When you book certified professionals through TASpro, you receive background-verified technicians who use genuine spare parts, transparent standard rate cards, and comprehensive warranty coverage on all completed services.
        </p>
      </div>

      <div className="flex items-center gap-6 bg-white p-4 mt-6">
        <div
          onClick={handleLike}
          className="flex items-center gap-2 text-lg font-medium text-gray-700 cursor-pointer"
        >
          <Image src="/like.png" alt="Like" width={20} height={20} />
          <span>{likes} Likes</span>
        </div>

        <div
          onClick={handleDislike}
          className="flex items-center gap-2 text-lg font-medium text-gray-700 cursor-pointer"
        >
          <Image src="/unlike.png" alt="Dislike" width={20} height={20} />
          <span>{dislikes} Dislikes</span>
        </div>

        <div className="flex items-center gap-2 text-lg font-medium text-gray-700">
          <Image src="/comment.png" alt="Comments" width={20} height={20} />
          <span>10 Comments</span>
        </div>
      </div>

      <button onClick={onBack} className="mt-8 text-orange-500 underline">
        ← Back to Blogs
      </button>
    </div>
  );
}
