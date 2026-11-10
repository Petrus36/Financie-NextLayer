export function AppBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(145deg,#141422_0%,#1a1a2e_38%,#0e0e18_72%,#12121c_100%)]" />
      <div className="absolute -left-[12%] -top-[18%] h-[min(560px,70vw)] w-[min(560px,70vw)] rounded-full bg-[#baff57]/35 blur-[90px]" />
      <div className="absolute right-[-8%] top-[5%] h-[min(480px,55vw)] w-[min(480px,55vw)] rounded-full bg-sky-400/25 blur-[80px]" />
      <div className="absolute bottom-[-15%] left-[35%] h-[min(520px,60vw)] w-[min(520px,60vw)] rounded-full bg-violet-500/20 blur-[95px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.35)_100%)]" />
    </div>
  );
}
