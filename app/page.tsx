import { Hero } from "./components/Hero";
import { Method } from "./components/Method";
import { LongIndexCase } from "./components/LongIndexCase";
import { About } from "./components/About";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Method />
      <LongIndexCase />
      <About />
    </main>
  );
}
