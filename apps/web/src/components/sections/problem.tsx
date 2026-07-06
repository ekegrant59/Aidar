import { SectionHeading } from "@/components/ui/section-heading";

const PROBLEMS = [
  {
    icon: "/icons/file_check_regular.svg",
    title: "The Credential Crisis",
    body: "Due to a lack of rigorous verification for MDCN registrations or HEFAMAA accreditations on existing platforms, patients must rely on unverified listings and word-of-mouth, leaving their health to chance.",
  },
  {
    icon: "/icons/user_search_regular.svg",
    title: "Healthcare is Hidden",
    body: "Beyond the doctor shortage, the more immediate issue is the invisibility of qualified practitioners, leaving patients unable to locate neighborhood-specific specialists, view their live availability, or see fees upfront.",
  },
  {
    icon: "/icons/plugin_2_regular.svg",
    title: "Fragmented and Limited Solutions",
    body: "Because existing healthtech apps only offer fragmented solutions like teleconsultations while ignoring in-person clinic visits, secure home care, and integrated navigation, the patient journey remains broken and frustrating.",
  },
  {
    icon: "/icons/unlink_2_regular.svg",
    title: "The Disconnected Ecosystem",
    body: "This lack of digital connectivity also affects highly qualified practitioners, who face unfilled appointment slots simply because they lack a dedicated channel to reach and coordinate with patients needing their care.",
  },
];

export function Problem() {
  return (
    <section id="problem" className="section-x section-y bg-canvas">
      <div className="mx-auto max-w-[1120px]">
        <SectionHeading
          eyebrow="The Problem"
          title={
            <>
              Closing the <span className="text-spruce-900">Discovery</span> and{" "}
              <span className="text-spruce-900">Trust Gap</span> in Nigeria
              Healthcare
            </>
          }
          subtitle="Nigeria faces a massive doctor-to-patient ratio (1 per 5,000), but the deeper issue in Nigeria is a “discovery and trust gap”."
        />

        <div className="mt-12 grid gap-x-10 gap-y-12 md:grid-cols-2">
          {PROBLEMS.map((p) => (
            <div key={p.title}>
              <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-spruce-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.icon} alt="" className="size-6" />
              </div>
              <h3 className="mb-2 font-manrope text-[20px] font-semibold text-spruce-900">
                {p.title}
              </h3>
              <p className="text-[17px] leading-relaxed text-ink/90">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
