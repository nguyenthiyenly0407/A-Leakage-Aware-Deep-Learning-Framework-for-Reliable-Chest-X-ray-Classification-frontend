"use client";
import Image from "next/image";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";

export function AppleCardsCarouselDemo() {
  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));

  return (
    <div className="w-full h-3/4 py-16">
      <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
        Get to know your Navi
      </h2>
      <Carousel items={cards} />
    </div>
  );
}

interface DummyContentProps {
  text: string;
  imageSrc: string;
}

const DummyContent = ({ text, imageSrc }: DummyContentProps) => {
  return (
    <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-10">
      <div className="mb-10">
        <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
          <span className="font-bold text-neutral-700 dark:text-neutral-200 ">
            {text}
          </span>
        </p>
      </div>
      <Image
        src={imageSrc} // Sử dụng imageSrc từ props
        alt="Macbook mockup from Aceternity UI"
        height="500"
        width="500"
        className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain"
      />
    </div>
  );
};

const data = [
  {
    category: "PRODUCT AND ISSUA TRACKING",
    title: "Software Development",
    src: "/images/landingpage/deve.jpg",
    content: (
      <DummyContent
        text="Plan, track, release and support world-class software. Navi is the single source of truth for your entire development lifecycle."
        imageSrc="/images/landingpage/soft_list.png"
      />
    ),
  },
  {
    category: "PLAN AND LAUNCH CAMPAIGNS",
    title: "Marketing and Sales",
    src: "/images/landingpage/marketing.jpg",
    content: (
      <DummyContent
        text="Make launching viral marketing campaigns a breeze. Break down complex campaigns into actionable steps, easily collect requests, and stay aligned with cross-functional teams."
        imageSrc="/images/landingpage/market_list.png"
      />
    ),
  },
  {
    category: "MANAGE AND TRACK REQUESTS",
    title: "IT support services",
    src: "/images/landingpage/it.jpg",
    content: (
      <DummyContent
        text="Easily build custom forms, track requests, and fully automate your intake process. Communicate progress and collaborate directly on requests with internal stakeholders in one place."
        imageSrc="/images/landingpage/it_list.png"
      />
    ),
  },
  {
    category: "BUILD CREATIVE WORKFLOWS",
    title: "Design",
    src: "/images/landingpage/design.jpg",
    content: (
      <DummyContent
        text="Collaborate on, organize, and deliver creative requests with ease. Give real-time visibility into designs with Navi’s Figma integration and accelerate approvals."
        imageSrc="/images/landingpage/design_list.png"
      />
    ),
  },
  {
    category: "CREATE INTAKE PROCESS",
    title: "Operations",
    src: "/images/landingpage/ope.jpg",
    content: (
      <DummyContent
        text="Manage procurement, office, and new vendor requests, craft new operational processes, monitor operational risks and more. Keep your company running at maximum efficiency with Navi."
        imageSrc="/images/landingpage/ope_list.png"
      />
    ),
  },
];
