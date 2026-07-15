import { Hero } from "@/components/hero/Hero";
import { Work } from "@/components/sections/Work";
import { About } from "@/components/sections/About";
import { Capabilities } from "@/components/sections/Capabilities";
import { Experience } from "@/components/sections/Experience";
import { Contact } from "@/components/sections/Contact";
import { Marquee } from "@/components/motion/Marquee";

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <Marquee text="BUILD — TEST — SHIP" />
      <Work />
      <About />
      <Capabilities />
      <Experience />
      <Marquee text="OPEN TO WORK" />
      <Contact />
    </main>
  );
}
