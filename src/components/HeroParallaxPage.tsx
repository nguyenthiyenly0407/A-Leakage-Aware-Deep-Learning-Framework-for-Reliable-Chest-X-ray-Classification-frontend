"use client";
import React from "react";
import { HeroParallax } from "@/components/ui/hero-parallax";

export function HeroParallaxPage() {
  return <HeroParallax products={products} />;
}
export const products = [
  {
    title: "Bye-bye, spreadsheets",
    link: "",
    thumbnail: "/images/landingpage/byebye.png",
  },
  {
    title: "Board",
    link: "",
    thumbnail: "/images/landingpage/Sofware.png",
  },

  {
    title: "Timeline",
    link: "",
    thumbnail: "/images/landingpage/timeline.png",
  },
  {
    title: "Customize",
    link: "",
    thumbnail: "/images/landingpage/customize.png",
  },
  {
    title: "Stay on track",
    link: "",
    thumbnail: "/images/landingpage/stayontrack.png",
  },

  {
    title: "Goals",
    link: "",
    thumbnail: "/images/landingpage/goals.png",
  },
  {
    title: "Easily see",
    link: "",
    thumbnail: "/images/landingpage/easilysee.png",
  },
  {
    title: "Replace",
    link: "",
    thumbnail: "/images/landingpage/replace.png",
  },
  {
    title: "Chart",
    link: "",
    thumbnail: "/images/landingpage/chart.png",
  },
  {
    title: "Renderwork Studio",
    link: "",
    thumbnail: "/images/landingpage/timeline.png",
  },
];
