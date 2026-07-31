import React, { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Flame, Trophy, Sparkles, Droplet, Footprints, Moon, RotateCcw, Camera } from "lucide-react";

const INDIGO = "#2B3A67";
const CREAM = "#F5EEDD";
const CLAY = "#B5502D";
const RICE = "#5C7A4E";
const GOLD = "#D9A441";
const CHAR = "#2B2420";

const TIPS = [
  { title: "สลับข้าวเหนียวเป็นข้าวกล้อง", body: "ลองสลับข้าวเหนียว 1 มื้อ เป็นข้าวกล้องหรือข้าวไรซ์เบอร์รี่ ช่วยลดน้ำตาลในเลือดพุ่งหลังมื้ออาหาร แต่ยังได้ความอิ่มแบบคนอีสาน" },
  { title: "ส้มตำสูตรเบาไขมัน", body: "ตำถาดโปรดของคุณ ลดน้ำตาลปี๊บลงครึ่งหนึ่ง เพิ่มมะเขือเทศกับถั่วฝักยาว ความอร่อยไม่เปลี่ยนแต่แคลอรี่เบาลงเยอะ" },
  { title: "ลาบ-ก้อย เน้นเนื้อ ลดข้าวคั่ว", body: "ข้าวคั่วอร่อยแต่แป้งเยอะ ลองลดลงครึ่งช้อน แล้วเพิ่มผักสดแนมแทน อิ่มนานขึ้นโดยไม่ง่วงหลังมื้อเที่ยง" },
  { title: "น้ำเปล่าก่อนมื้ออาหาร", body: "ดื่มน้ำเปล่า 1 แก้วก่อนมื้ออาหาร 15 นาที ช่วยให้กินได้พอดีขึ้น ไม่ต้องอดทน แค่ปรับจังหวะ" },
  { title: "เดินรอบหมู่บ้านตอนเย็น", body: "อากาศเย็นตอนเย็นเหมาะกับการเดิน 15-20 นาที ชวนคนในบ้านไปด้วยกัน ได้ทั้งสุขภาพและเวลาคุณภาพ" },
  { title: "นอนให้ครบ อย่ามองข้าม", body: "นอนน้อยกว่า 6 ชั่วโมงทำให้ฮอร์โมนหิวรวน กินเท่าไหร่ก็ไม่อิ่ม ลองเข้านอนเร็วขึ้น 30 นาทีคืนนี้" },
  { title: "ป่นปลาแทนของทอด", body: "ของกินเล่นตอนบ่าย ลองเปลี่ยนจากของทอดเป็นป่นปลาหรือไข่ต้ม โปรตีนสูง อิ่มนาน ไม่ง่วงบ่าย" },
  { title: "แกงหน่อไม้ใยเยอะ กินก่อนข้าว", body: "กินแกงหรือผักที่มีใยอาหารก่อน แล้วค่อยกินข้าว ช่วยให้อิ่มไวขึ้นโดยไม่ต้องลดปริมาณข้าวทันที" },
  { title: "พักสายตาจากจอตอนเย็น", body: "ความเครียดสะสมทำให้ร่างกายหลั่งฮอร์โมนที่กระตุ้นความอยากอาหาร ลองพัก 10 นาทีจากจอก่อนนอน" },
  { title: "ชวนคนในทีมมาเช็กอินด้วยกัน", body: "คนอีสานเราเก่งเรื่องความเป็นชุมชน ชวนเพื่อนในทีมมาส่งผลชั่งน้ำหนักพร้อมกันทุกเช้าวันจันทร์ ได้กำลังใจซึ่งกันและกัน" },
  { title: "ปลาร้าได้ แต่ระวังโซเดียม", body: "ปลาร้ามีรสชาติที่ทดแทนไม่ได้ ใส่แต่พอดี แล้วลดการเติมเกลือหรือน้ำปลาส่วนอื่นในมื้อเดียวกันลง" },
  { title: "ให้รางวัลตัวเองแบบไม่ใช่อาหาร", body: "ครบสัปดาห์นี้แล้ว ลองให้รางวัลตัวเองด้วยสิ่งที่ไม่ใช่ของกิน เช่น ผ้าถุงลายใหม่ หรือเวลาพักผ่อนที่ตั้งใจไว้" },
];

function dayKey(d) {
  return d.toISOString().slice(0, 10);
}
function todayKey() {
  return dayKey(new Date());
}
function tipForToday() {
  const start = new Date(2026, 0, 1);
  const diff = Math.floor((new Date() - start) / 86400000);
  return TIPS[((diff % TIPS.length) + TIPS.length) % TIPS.length];
}

function computeStreak(checkins) {
  const dates = new Set(checkins.map((c) => c.date));
  let streak = 0;
  let cursor = new Date();
  while (dates.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default function App() {
  const [profile, setProfile] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flipped, setFlipped] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [form, setForm] = useState({ weight: "", waist: "", energy: 3 });
  const [onboard, setOnboard] = useState({ name: "", startWeight: "", goalWeight: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const p = await window.storage.get("profile");
        if (p && p.value) setProfile(JSON.parse(p.value));
      } catch (e) {}
      try {
        const c = await window.storage.get("checkins");
        if (c && c.value) setCheckins(JSON.parse(c.value));
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  const streak = useMemo(() => computeStreak(checkins), [checkins]);
  const tip = useMemo(() => tipForToday(), []);
  const sortedCheckins = useMemo(
    () => [...checkins].sort((a, b) => a.date.localeCompare(b.date)),
    [checkins]
  );
  const latest = sortedCheckins[sortedCheckins.length - 1];
  const startWeight = profile ? Number(profile.startWeight) : null;
  const currentWeight = latest ? Number(latest.weight) : startWeight;
  const weightLost = startWeight != null && currentWeight != null ? +(startWeight - currentWeight).toFixed(1) : 0;
  const goalWeight = profile ? Number(profile.goalWeight) : null;
  const totalToLose = startWeight != null && goalWeight != null ? +(startWeight - goalWeight).toFixed(1) : null;
  const progressPct =
    totalToLose && totalToLose > 0 ? Math.max(0, Math.min(100, Math.round((weightLost / totalToLose) * 100))) : 0;

  const badges = useMemo(() => {
    const list = [];
    if (checkins.length >= 1) list.push({ id: "first", label: "เริ่มต้นแล้ว", icon: Sparkles });
    if (streak >= 3) list.push({ id: "s3", label: "สาย 3 วัน", icon: Flame });
    if (streak >= 7) list.push({ id: "s7", label: "สาย 7 วัน", icon: Flame });
    if (streak >= 14) list.push({ id: "s14", label: "สาย 14 วัน", icon: Flame });
    if (weightLost >= 1) list.push({ id: "w1", label: "ลดได้ 1 กก.", icon: Trophy });
    if (weightLost >= 3) list.push({ id: "w3", label: "ลดได้ 3 กก.", icon: Trophy });
    if (weightLost >= 5) list.push({ id: "w5", label: "ลดได้ 5 กก.", icon: Trophy });
    if (progressPct >= 50) list.push({ id: "half", label: "ครึ่งทางแล้ว", icon: Trophy });
    return list;
  }, [checkins, streak, weightLost, progressPct]);

  async function saveProfile() {
    const p = {
      name: onboard.name || "คุณ",
      startWeight: Number(onboard.startWeight),
      goalWeight: Number(onboard.goalWeight),
      startDate: todayKey(),
    };
    setProfile(p);
    try {
      await window.storage.set("profile", JSON.stringify(p));
    } catch (e) {}
  }

  async function submitCheckin() {
    if (!form.weight) return;
    const entry = { date: todayKey(), weight: Number(form.weight), waist: form.waist ? Number(form.waist) : null, energy: form.energy };
    const next = [...checkins.filter((c) => c.date !== entry.date), entry];
    setCheckins(next);
    try {
      await window.storage.set("checkins", JSON.stringify(next));
    } catch (e) {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) return null;

  if (!profile) {
    return (
      <div style={{ ...page, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 480 }}>
        <div style={{ ...card, maxWidth: 380, width: "100%" }}>
          <p style={{ ...eyebrow, color: CLAY }}>เริ่มต้นเส้นทางของคุณ</p>
          <h1 style={heading}>สวัสดีค่ะ ยินดีต้อนรับ</h1>
          <p style={{ color: "#6b5f52", fontSize: 14, marginBottom: 20 }}>
            กรอกข้อมูลเริ่มต้นเพื่อให้เราติดตามความคืบหน้าไปด้วยกัน
          </p>
          <label style={label}>ชื่อเล่นของคุณ</label>
          <input style={input} placeholder="เช่น พี่แนน" value={onboard.name} onChange={(e) => setOnboard({ ...onboard, name: e.target.value })} />
          <label style={label}>น้ำหนักตั้งต้น (กก.)</label>
          <input style={input} type="number" placeholder="70" value={onboard.startWeight} onChange={(e) => setOnboard({ ...onboard, startWeight: e.target.value })} />
          <label style={label}>น้ำหนักเป้าหมาย (กก.)</label>
          <input style={input} type="number" placeholder="62" value={onboard.goalWeight} onChange={(e) => setOnboard({ ...onboard, goalWeight: e.target.value })} />
          <button
            style={{ ...btnPrimary, marginTop: 16, opacity: onboard.startWeight && onboard.goalWeight ? 1 : 0.5 }}
            disabled={!onboard.startWeight || !onboard.goalWeight}
            onClick={saveProfile}
          >
            เริ่มเลย
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={page}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "28px 18px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <p style={{ ...eyebrow, color: CLAY }}>สวัสดี {profile.name}</p>
          <button style={resetBtn} onClick={() => { setProfile(null); setOnboard({ name: "", startWeight: "", goalWeight: "" }); }}>
            <RotateCcw size={13} style={{ marginRight: 4, verticalAlign: -2 }} />
            เริ่มใหม่
          </button>
        </div>
        <h1 style={heading}>เส้นทางสุขภาพของคุณ</h1>

        {/* signature ikat streak band */}
        <div style={{ background: INDIGO, borderRadius: 14, padding: "16px 18px", marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ color: CREAM, fontSize: 13, fontFamily: monoFont, letterSpacing: 0.5 }}>สายต่อเนื่อง</span>
            <span style={{ color: GOLD, fontFamily: monoFont, fontSize: 20, fontWeight: 700 }}>{streak} วัน</span>
          </div>
          <IkatBand streak={streak} />
        </div>

        {/* today's checkin */}
        <div style={{ ...card, marginTop: 18 }}>
          <p style={sectionTitle}>เช็กอินวันนี้</p>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={label}>น้ำหนัก (กก.)</label>
              <input style={input} type="number" placeholder={currentWeight ? String(currentWeight) : "70"} value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>รอบเอว (ซม.) - ไม่บังคับ</label>
              <input style={input} type="number" placeholder="80" value={form.waist} onChange={(e) => setForm({ ...form, waist: e.target.value })} />
            </div>
          </div>
          <label style={{ ...label, marginTop: 10 }}>พลังงานวันนี้: {["แย่มาก", "แย่", "ปกติ", "ดี", "ดีมาก"][form.energy - 1]}</label>
          <input
            style={{ width: "100%" }}
            type="range"
            min="1"
            max="5"
            step="1"
            value={form.energy}
            onChange={(e) => setForm({ ...form, energy: Number(e.target.value) })}
          />
          <button style={{ ...btnPrimary, marginTop: 12 }} onClick={submitCheckin}>
            {saved ? "บันทึกแล้ว ✓" : "บันทึกวันนี้"}
          </button>
        </div>

        {/* progress chart */}
        {sortedCheckins.length > 1 && (
          <div style={{ ...card, marginTop: 18 }}>
            <p style={sectionTitle}>กราฟน้ำหนัก</p>
            <div style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sortedCheckins.map((c) => ({ date: c.date.slice(5), weight: c.weight }))}>
                  <CartesianGrid stroke="#e7ded0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8a7c6a" }} axisLine={false} tickLine={false} />
                  <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fontSize: 10, fill: "#8a7c6a" }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Line type="monotone" dataKey="weight" stroke={CLAY} strokeWidth={2.5} dot={{ r: 3, fill: CLAY }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: monoFont, fontSize: 13 }}>
              <span>ลดไปแล้ว {weightLost > 0 ? weightLost : 0} กก.</span>
              {totalToLose && <span style={{ color: RICE }}>{progressPct}% ถึงเป้าหมาย</span>}
            </div>
          </div>
        )}

        {/* daily tip flip card */}
        <div style={{ marginTop: 18 }}>
          <p style={sectionTitle}>เคล็ดลับประจำวัน</p>
          <div
            onClick={() => setFlipped(!flipped)}
            style={{
              cursor: "pointer",
              perspective: 1000,
              height: 130,
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                transition: "transform 0.5s",
                transformStyle: "preserve-3d",
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              <div style={{ ...flipFace, background: RICE }}>
                <Sparkles color={CREAM} size={22} />
                <p style={{ color: CREAM, fontFamily: monoFont, fontSize: 12, marginTop: 8 }}>แตะเพื่อดูเคล็ดลับวันนี้</p>
              </div>
              <div style={{ ...flipFace, background: CREAM, border: `1px solid #e7ded0`, transform: "rotateY(180deg)" }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: CHAR, marginBottom: 6 }}>{tip.title}</p>
                <p style={{ fontSize: 12.5, color: "#5c5245", lineHeight: 1.5 }}>{tip.body}</p>
              </div>
            </div>
          </div>
        </div>

        {/* badges */}
        {badges.length > 0 && (
          <div style={{ ...card, marginTop: 18 }}>
            <p style={sectionTitle}>เหรียญที่ได้รับ</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {badges.map((b) => (
                <div key={b.id} style={badgePill}>
                  <b.icon size={13} style={{ marginRight: 5, verticalAlign: -2 }} />
                  {b.label}
                </div>
              ))}
            </div>
          </div>
        )}

        <button style={{ ...btnSecondary, marginTop: 18 }} onClick={() => setShowReport(true)}>
          <Camera size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
          สร้างการ์ดความคืบหน้า
        </button>
      </div>

      {showReport && (
        <div style={overlay} onClick={() => setShowReport(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 340, width: "100%" }}>
            <ReportCard profile={profile} weightLost={weightLost} streak={streak} progressPct={progressPct} badgeCount={badges.length} />
            <p style={{ textAlign: "center", color: CREAM, fontSize: 12.5, marginTop: 12 }}>
              แคปหน้าจอเพื่อแชร์ในไอจีของคุณ แล้วแตะที่ว่างเพื่อปิด
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function IkatBand({ streak }) {
  const max = 14;
  const filled = Math.min(streak, max);
  const items = Array.from({ length: max });
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {items.map((_, i) => (
        <svg key={i} width="20" height="20" viewBox="0 0 20 20">
          <rect
            x="3"
            y="3"
            width="14"
            height="14"
            transform="rotate(45 10 10)"
            fill={i < filled ? GOLD : "none"}
            stroke={i < filled ? GOLD : "rgba(245,238,221,0.35)"}
            strokeWidth="1.5"
          />
        </svg>
      ))}
    </div>
  );
}

function ReportCard({ profile, weightLost, streak, progressPct, badgeCount }) {
  return (
    <div style={{ background: INDIGO, borderRadius: 18, padding: 26 }}>
      <p style={{ color: GOLD, fontFamily: monoFont, fontSize: 11, letterSpacing: 1.5 }}>OPTIMAL HEALTH JOURNEY</p>
      <p style={{ color: CREAM, fontSize: 20, fontWeight: 700, marginTop: 4 }}>{profile.name}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 20 }}>
        <Stat label="ลดน้ำหนัก" value={`${weightLost > 0 ? weightLost : 0} กก.`} />
        <Stat label="สายต่อเนื่อง" value={`${streak} วัน`} />
        <Stat label="ถึงเป้าหมาย" value={`${progressPct}%`} />
        <Stat label="เหรียญ" value={`${badgeCount}`} />
      </div>
      <div style={{ marginTop: 20 }}>
        <IkatBand streak={streak} />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p style={{ color: "rgba(245,238,221,0.65)", fontSize: 11, marginBottom: 3 }}>{label}</p>
      <p style={{ color: CREAM, fontFamily: monoFont, fontSize: 22, fontWeight: 700 }}>{value}</p>
    </div>
  );
}

const monoFont = "'Space Mono', 'Courier New', monospace";

const page = { background: CREAM, minHeight: "100vh", fontFamily: "'Noto Sans Thai','Segoe UI',sans-serif", color: CHAR };
const card = { background: "#fff", borderRadius: 14, padding: 18, border: "1px solid #eee2d0" };
const eyebrow = { fontSize: 12, letterSpacing: 1, fontWeight: 700, margin: 0, textTransform: "uppercase" };
const heading = { fontFamily: "'Noto Serif Thai', serif", fontSize: 24, fontWeight: 700, margin: "4px 0 0" };
const sectionTitle = { fontSize: 13, fontWeight: 700, color: "#6b5f52", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 };
const label = { fontSize: 12, color: "#8a7c6a", display: "block", marginBottom: 4, marginTop: 8 };
const input = { width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #e0d5c2", fontSize: 14, boxSizing: "border-box", background: "#fdfaf3" };
const btnPrimary = { width: "100%", padding: "11px", borderRadius: 10, border: "none", background: CLAY, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" };
const btnSecondary = { width: "100%", padding: "11px", borderRadius: 10, border: `1.5px solid ${INDIGO}`, background: "transparent", color: INDIGO, fontWeight: 700, fontSize: 13.5, cursor: "pointer" };
const resetBtn = { background: "none", border: "none", color: "#a99a86", fontSize: 11.5, cursor: "pointer", padding: 0 };
const badgePill = { background: "#f3ead8", color: CLAY, fontSize: 12, fontWeight: 700, padding: "6px 11px", borderRadius: 999, border: `1px solid ${GOLD}55` };
const flipFace = { position: "absolute", width: "100%", height: "100%", borderRadius: 14, backfaceVisibility: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 16, boxSizing: "border-box" };
const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 50 };
