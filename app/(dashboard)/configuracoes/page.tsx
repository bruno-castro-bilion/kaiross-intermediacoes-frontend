"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, Bell, Palette, Check, Eye, EyeOff } from "lucide-react";

/* ─── Shared ─────────────────────────────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 40,
  padding: "0 12px",
  border: "1px solid var(--ink-200)",
  borderRadius: "var(--r-md)",
  fontSize: 14,
  fontFamily: "inherit",
  background: "var(--ink-0)",
  color: "var(--ink-900)",
  outline: "none",
};

type SectionKey = "conta" | "senha" | "notificacoes" | "preferencias";

const SECTIONS: { key: SectionKey; label: string; icon: React.ElementType }[] = [
  { key: "conta",          label: "Dados da conta",     icon: User },
  { key: "senha",          label: "Senha",              icon: Lock },
  { key: "notificacoes",   label: "Notificações",       icon: Bell },
  { key: "preferencias",   label: "Preferências",       icon: Palette },
];

/* ─── Sections ───────────────────────────────────────────────────────────────── */
function Conta() {
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ padding: 24, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Informações pessoais</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Nome completo", val: "Bruno Raphael Castro" },
            { label: "E-mail", val: "castroeditor18@gmail.com" },
            { label: "Telefone", val: "(11) 9 8765-4321" },
            { label: "Username", val: "brunocastro" },
          ].map((f) => (
            <div key={f.label}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-600)", display: "block", marginBottom: 5 }}>{f.label}</label>
              <input style={inputStyle} defaultValue={f.val} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-600)", display: "block", marginBottom: 5 }}>Bio / Descrição</label>
          <textarea
            defaultValue="Vendedor Kaiross desde 2024. Focado em produtos de bem-estar e eletrônicos."
            style={{ ...inputStyle, height: 80, padding: "10px 12px", resize: "vertical", lineHeight: 1.5 }}
          />
        </div>
        <div style={{ marginTop: 16 }}>
          <button
            onClick={save}
            style={{ height: 38, padding: "0 20px", borderRadius: "var(--r-md)", border: 0, background: saved ? "var(--kai-success)" : "var(--kai-orange)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, transition: "all .2s" }}
          >
            {saved ? <><Check size={14} /> Salvo!</> : "Salvar alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Senha() {
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  return (
    <div style={{ padding: 24, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)" }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Alterar senha</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 420 }}>
        {(["current", "new", "confirm"] as const).map((key) => {
          const labels: Record<string, string> = { current: "Senha atual", new: "Nova senha", confirm: "Confirmar nova senha" };
          return (
            <div key={key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-600)", display: "block", marginBottom: 5 }}>{labels[key]}</label>
              <div style={{ position: "relative" }}>
                <input
                  type={show[key] ? "text" : "password"}
                  style={{ ...inputStyle, paddingRight: 44 }}
                  placeholder="••••••••"
                />
                <button
                  onClick={() => setShow((s) => ({ ...s, [key]: !s[key] }))}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--ink-500)", cursor: "pointer", display: "flex", alignItems: "center" }}
                >
                  {show[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          );
        })}
        <button style={{ height: 38, padding: "0 20px", borderRadius: "var(--r-md)", border: 0, background: "var(--kai-orange)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", width: "fit-content" }}>
          Atualizar senha
        </button>
      </div>
    </div>
  );
}

function Notificacoes() {
  const [prefs, setPrefs] = useState({
    newOrder:   true,
    delivered:  true,
    chargeback: true,
    lowStock:   false,
    marketing:  false,
    weekReport: true,
  });
  const toggle = (k: keyof typeof prefs) => setPrefs((p) => ({ ...p, [k]: !p[k] }));

  const items = [
    { key: "newOrder"   as const, label: "Novo pedido",              desc: "Notificação a cada venda realizada" },
    { key: "delivered"  as const, label: "Pedido entregue",          desc: "Quando o cliente recebe o produto" },
    { key: "chargeback" as const, label: "Estorno / chargeback",     desc: "Quando há solicitação de estorno" },
    { key: "lowStock"   as const, label: "Estoque baixo",            desc: "Quando o estoque ficar abaixo do limite" },
    { key: "marketing"  as const, label: "Novidades e promoções",    desc: "Comunicados da plataforma Kaiross" },
    { key: "weekReport" as const, label: "Relatório semanal",        desc: "Resumo de performance toda segunda-feira" },
  ];

  return (
    <div style={{ padding: 24, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)" }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Preferências de notificação</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {items.map((item, i) => (
          <div
            key={item.key}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: i < items.length - 1 ? "1px solid var(--ink-100)" : "none" }}
          >
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{item.label}</p>
              <p style={{ fontSize: 12, color: "var(--ink-500)" }}>{item.desc}</p>
            </div>
            {/* Toggle */}
            <div
              onClick={() => toggle(item.key)}
              style={{
                width: 44,
                height: 24,
                borderRadius: 999,
                background: prefs[item.key] ? "var(--kai-orange)" : "var(--ink-200)",
                position: "relative",
                cursor: "pointer",
                transition: "background .2s",
                flexShrink: 0,
              }}
            >
              <div style={{
                position: "absolute",
                top: 3,
                left: prefs[item.key] ? 22 : 3,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "white",
                transition: "left .2s",
                boxShadow: "0 1px 3px rgba(0,0,0,.2)",
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Preferencias() {
  const [density, setDensity] = useState("normal");
  const [lang, setLang] = useState("pt-BR");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ padding: 24, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Densidade visual</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { value: "compact", label: "Compacto",  desc: "Mais informação por tela" },
            { value: "normal",  label: "Normal",    desc: "Balanceado" },
            { value: "comfy",   label: "Confortável", desc: "Mais espaço entre elementos" },
          ].map((o) => (
            <div
              key={o.value}
              onClick={() => setDensity(o.value)}
              style={{ padding: 16, borderRadius: "var(--r-md)", border: `1.5px solid ${density === o.value ? "var(--kai-orange)" : "var(--ink-200)"}`, background: density === o.value ? "var(--kai-orange-50)" : "var(--ink-0)", cursor: "pointer", transition: "all .15s" }}
            >
              <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 3, color: density === o.value ? "var(--kai-orange-600)" : "var(--ink-900)" }}>{o.label}</p>
              <p style={{ fontSize: 11, color: "var(--ink-500)" }}>{o.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: 24, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Idioma</h3>
        <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ ...inputStyle, maxWidth: 260 }}>
          <option value="pt-BR">Português (Brasil)</option>
          <option value="en-US">English (US)</option>
          <option value="es-ES">Español</option>
        </select>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */
export default function Configuracoes() {
  const [section, setSection] = useState<SectionKey>("conta");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ padding: "32px", maxWidth: 1100, margin: "0 auto", width: "100%" }}
    >
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Configurações</h1>
        <p style={{ fontSize: 15, color: "var(--ink-600)" }}>Gerencie sua conta, senha e preferências da plataforma.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 24, alignItems: "start" }}>
        {/* Side nav */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: 8, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)" }}>
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: "var(--r-md)",
                border: 0,
                background: section === s.key ? "var(--kai-orange)" : "transparent",
                color: section === s.key ? "white" : "var(--ink-700)",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                transition: "all .15s",
              }}
            >
              <s.icon size={16} style={{ color: section === s.key ? "white" : "var(--ink-500)" }} />
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {section === "conta"        && <Conta />}
          {section === "senha"        && <Senha />}
          {section === "notificacoes" && <Notificacoes />}
          {section === "preferencias" && <Preferencias />}
        </div>
      </div>
    </motion.div>
  );
}
