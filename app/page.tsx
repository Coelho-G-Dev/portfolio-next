import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Method from "@/components/Method";
import About from "@/components/About";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main-content">
        <Hero />
        <Projects />
        <Method />
        <About />
        <Contact />
      </main>
    </>
  );
}
