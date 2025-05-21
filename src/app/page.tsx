import React from "react";
import Hero from "@/components/Home/Hero";
import Companies from "@/components/Home/hospitals";
import Courses from "@/components/Home/Services";
import Mentor from "@/components/Home/Mentor";
import { Metadata } from "next";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
export const metadata: Metadata = {
  title: "healthcare",
};

export default function Home() {
  return (
    <main>
      <Header/>
      <Hero />
      <Companies />
      <Courses />
      <Mentor />
      <Footer/>
    </main>
  );
}