import { useRef, useState, type MouseEvent } from "react";

export function SDMini() {
  return (
    <span className="sd-mini" aria-hidden="true">
      <span className="sd-mini-core">SD</span>
    </span>
  );
}

export function SDMasterpiece({
  chipLive = "LIVE · ۳ پروژه",
  chipEn = "REACT · UI/UX",
  chipFa = "ساخته‌ی رسول بابایی",
}: {
  chipLive?: string;
  chipEn?: string;
  chipFa?: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState("rotateX(0deg) rotateY(0deg)");

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt(`rotateX(${(-py * 18).toFixed(1)}deg) rotateY(${(px * 22).toFixed(1)}deg)`);
  }

  function handleLeave() {
    setTilt("rotateX(0deg) rotateY(0deg)");
  }

  return (
    <div
      className="emblem-stage"
      ref={stageRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div className="emblem-tilt" style={{ transform: tilt }}>
        <div className="emblem" role="img" aria-label="لوگوی SD">
          <span className="emblem-halo" />
          <span className="emblem-ring ring-a" />
          <span className="emblem-ring ring-b" />
          <span className="emblem-ring ring-c" />
          <span className="orbit o1">
            <i />
          </span>
          <span className="orbit o2">
            <i />
          </span>
          <span className="orbit o3">
            <i />
          </span>
          <span className="emblem-core" />
          <span className="emblem-sd" dir="ltr">
            <b className="sd-s">S</b>
            <b className="sd-d">D</b>
          </span>
          <span className="emblem-shine" />
          <span className="spark s1" />
          <span className="spark s2" />
          <span className="spark s3" />
          <span className="spark s4" />
          <span className="spark s5" />
        </div>
      </div>
      <span className="emblem-shadow" />
      <div className="emblem-chips">
        <span className="echip chip-live">
          <i />
          {chipLive}
        </span>
        <span className="echip" dir="ltr">
          {chipEn}
        </span>
        <span className="echip chip-fa">{chipFa}</span>
      </div>
    </div>
  );
}
