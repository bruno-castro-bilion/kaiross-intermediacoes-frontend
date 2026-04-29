"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  CreditCard,
  Percent,
  FileText,
  Download,
  CheckCircle,
  Pencil,
  ChevronDown,
  Building,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────────── */
type Section = "carteira" | "bancarios" | "taxas" | "dados";
type AccountType = "PF" | "PJ";

const BANCOS = [
  "001 - Banco do Brasil S.A.",
  "033 - Santander Brasil S.A.",
  "104 - Caixa Econômica Federal",
  "237 - Banco Bradesco S.A.",
  "341 - Itaú Unibanco S.A.",
  "260 - Nu Pagamentos S.A. (Nubank)",
  "077 - Banco Inter S.A.",
  "212 - Banco Original S.A.",
  "336 - Banco C6 S.A.",
  "380 - PicPay Servicos S.A.",
];

const ESTADOS_UF = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

/* ─── FinField ───────────────────────────────────────────────────────────────── */
function FinField({ label, required, optional, children }: {
  label: string; required?: boolean; optional?: boolean; children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-600)" }}>
        {label}
        {required && <span style={{ color: "var(--kai-danger)", marginLeft: 2 }}>*</span>}
        {optional && <span style={{ color: "var(--ink-400)", marginLeft: 4 }}>(opcional)</span>}
      </label>
      {children}
    </div>
  );
}

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

/* ─── Carteira ──────────────────────────────────────────────────────────────── */
function Carteira() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Saldo disponível */}
        <div style={{ padding: 24, background: "var(--ink-900)", borderRadius: "var(--r-lg)", color: "white" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
            Saldo disponível
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}>R$ 0,00</span>
            <button
              disabled
              style={{ display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 12px", borderRadius: "var(--r-md)", border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.5)", fontSize: 13, fontWeight: 600, cursor: "not-allowed", fontFamily: "inherit" }}
            >
              <Download size={14} /> Efetuar saque
            </button>
          </div>
        </div>

        {/* Saldo pendente */}
        <div style={{ padding: 24, background: "var(--ink-800)", borderRadius: "var(--r-lg)", color: "white" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
            Saldo pendente
          </div>
          <span style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}>R$ 0,00</span>
        </div>
      </div>

      {/* Meus saques */}
      <div style={{ padding: 24, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Meus saques</h3>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "40px 20px", color: "var(--ink-400)" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--ink-50)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Building size={28} style={{ color: "var(--ink-300)" }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-700)", marginBottom: 4 }}>Nenhum saque encontrado</p>
            <p style={{ fontSize: 13, color: "var(--ink-500)" }}>Não foi efetuado nenhum saque até o momento</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Dados bancários ────────────────────────────────────────────────────────── */
function DadosBancarios() {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div style={{ padding: 24, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Alterar dados bancários</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FinField label="Banco" required>
            <select style={inputStyle} defaultValue="001 - Banco do Brasil S.A.">
              {BANCOS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </FinField>
          <FinField label="Tipo de conta" required>
            <select style={inputStyle} defaultValue="Conta corrente">
              <option>Conta corrente</option>
              <option>Conta poupança</option>
            </select>
          </FinField>
          <FinField label="Agência" required>
            <input style={inputStyle} defaultValue="1231-9" />
          </FinField>
          <FinField label="Conta com dígito" required>
            <input style={inputStyle} defaultValue="4234234234234-3" />
          </FinField>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button onClick={() => setEditing(false)} style={{ height: 38, padding: "0 16px", borderRadius: "var(--r-md)", border: "1px solid var(--ink-200)", background: "var(--ink-0)", color: "var(--ink-700)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Cancelar
          </button>
          <button onClick={() => setEditing(false)} style={{ height: 38, padding: "0 16px", borderRadius: "var(--r-md)", border: 0, background: "var(--kai-orange)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Salvar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)" }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Dados bancários</h3>
      <div style={{ height: 1, background: "var(--ink-200)", marginBottom: 16 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <strong style={{ fontSize: 14 }}>Conta bancária</strong>
        <button onClick={() => setEditing(true)} style={{ background: "transparent", border: "none", color: "var(--kai-orange-600)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
          Alterar
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "8px 16px", fontSize: 14 }}>
        <span style={{ color: "var(--ink-500)" }}>Banco:</span>
        <span style={{ fontWeight: 500 }}>001 - Banco do Brasil S.A.</span>
        <span style={{ color: "var(--ink-500)" }}>Tipo:</span>
        <span style={{ fontWeight: 500 }}>Conta corrente</span>
        <span style={{ color: "var(--ink-500)" }}>Agência:</span>
        <span style={{ fontWeight: 500 }}>1231-9</span>
        <span style={{ color: "var(--ink-500)" }}>Conta:</span>
        <span style={{ fontWeight: 500 }}>4234234234234-3</span>
      </div>
    </div>
  );
}

/* ─── Taxas ──────────────────────────────────────────────────────────────────── */
function Taxas() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ padding: 24, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Taxas</h3>
        <p style={{ fontSize: 14, color: "var(--ink-700)", marginBottom: 16 }}>
          Suas taxas (produtor):{" "}
          <strong style={{ color: "var(--ink-900)" }}>R$ 2,50</strong>{" "}
          (Custo de operação) +{" "}
          <strong style={{ color: "var(--ink-900)" }}>5,90%</strong>{" "}
          por venda aprovada
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { label: "Pix", value: "2 dias", color: "var(--kai-orange)" },
            { label: "Boleto", value: "3 dias", color: "var(--kai-info)" },
            { label: "Cartão", value: "15 dias", color: "var(--kai-success)" },
          ].map((item) => (
            <div key={item.label} style={{ padding: 16, background: "var(--ink-50)", borderRadius: "var(--r-md)", borderTop: `3px solid ${item.color}` }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>
                {item.label}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--ink-900)" }}>
                {item.value}
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-500)", marginTop: 2 }}>prazo de recebimento</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Dados gerais ───────────────────────────────────────────────────────────── */
function DadosGerais({ accountType }: { accountType: AccountType }) {
  const [editing, setEditing] = useState(false);
  const [openSec, setOpenSec] = useState({ pessoais: true, endereco: true, banco: true, empresa: true, admin: true });
  const toggle = (k: keyof typeof openSec) => setOpenSec((p) => ({ ...p, [k]: !p[k] }));

  function Section({ icon: Icon, title, open, onToggle, children }: {
    icon: React.ElementType; title: string; open: boolean; onToggle: () => void; children: React.ReactNode;
  }) {
    return (
      <div style={{ background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
        <button
          onClick={onToggle}
          style={{ width: "100%", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: 0, cursor: "pointer", fontFamily: "inherit" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon size={16} style={{ color: "var(--kai-orange)" }} />
            <strong style={{ fontSize: 14 }}>{title}</strong>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Pencil size={13} style={{ color: "var(--ink-500)" }} />
            <ChevronDown size={14} style={{ color: "var(--ink-500)", transform: open ? "none" : "rotate(-90deg)", transition: "transform .2s" }} />
          </div>
        </button>
        {open && (
          <div style={{ padding: "0 20px 20px", display: "grid", gridTemplateColumns: "140px 1fr", gap: "8px 16px", fontSize: 14 }}>
            {children}
          </div>
        )}
      </div>
    );
  }

  function KV({ k, v }: { k: string; v: string }) {
    return (
      <>
        <span style={{ color: "var(--ink-500)", paddingTop: 2 }}>{k}</span>
        <span style={{ fontWeight: 500 }}>{v}</span>
      </>
    );
  }

  if (!editing) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ padding: 20, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--kai-success)" }}>
              <CheckCircle size={18} />
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Conta verificada</h3>
            </div>
            <button onClick={() => setEditing(true)} style={{ display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 12px", borderRadius: "var(--r-md)", border: "1px solid var(--ink-200)", background: "var(--ink-0)", color: "var(--ink-700)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              <Pencil size={13} /> Editar cadastro
            </button>
          </div>
          <div style={{ padding: 14, background: "var(--kai-info-bg)", borderRadius: "var(--r-md)", fontSize: 13, color: "var(--kai-info)" }}>
            <strong>Revise suas informações</strong> — Confirme os dados antes de efetuar um saque.
          </div>
        </div>

        {accountType === "PF" && (
          <>
            <Section icon={FileText} title="Dados pessoais" open={openSec.pessoais} onToggle={() => toggle("pessoais")}>
              <KV k="Nome completo" v="Bruno Raphael Castro" />
              <KV k="E-mail" v="castroeditor18@gmail.com" />
              <KV k="CPF" v="123.456.789-00" />
              <KV k="Data de nascimento" v="01/01/1995" />
              <KV k="Telefone" v="(11) 9 8765-4321" />
              <KV k="Renda mensal" v={fmtBRL(8500)} />
              <KV k="Profissão" v="Empresário" />
            </Section>
            <Section icon={FileText} title="Endereço" open={openSec.endereco} onToggle={() => toggle("endereco")}>
              <KV k="CEP" v="01415-002" />
              <KV k="Rua" v="Rua das Acácias, 142" />
              <KV k="Bairro" v="Jardins" />
              <KV k="Cidade / UF" v="São Paulo / SP" />
            </Section>
            <Section icon={CreditCard} title="Dados bancários" open={openSec.banco} onToggle={() => toggle("banco")}>
              <KV k="Banco" v="001 - Banco do Brasil S.A." />
              <KV k="Tipo de conta" v="Conta corrente" />
              <KV k="Agência" v="1231-9" />
              <KV k="Conta" v="4234234234234-3" />
            </Section>
          </>
        )}

        {accountType === "PJ" && (
          <>
            <Section icon={Building} title="Dados da empresa" open={openSec.empresa} onToggle={() => toggle("empresa")}>
              <KV k="Razão social" v="Castro Serviços Digitais LTDA" />
              <KV k="Nome fantasia" v="Kaiross Store" />
              <KV k="CNPJ" v="11.111.111/0001-21" />
              <KV k="E-mail" v="contato@kairos.store" />
              <KV k="Faturamento anual" v={fmtBRL(360000)} />
              <KV k="Telefone" v="(11) 3000-0000" />
            </Section>
            <Section icon={FileText} title="Dados do administrador" open={openSec.admin} onToggle={() => toggle("admin")}>
              <KV k="Nome completo" v="Bruno Raphael Castro" />
              <KV k="E-mail" v="castroeditor18@gmail.com" />
              <KV k="CPF" v="123.456.789-00" />
              <KV k="Telefone" v="(11) 9 8765-4321" />
            </Section>
            <Section icon={CreditCard} title="Dados bancários" open={openSec.banco} onToggle={() => toggle("banco")}>
              <KV k="Banco" v="001 - Banco do Brasil S.A." />
              <KV k="Tipo de conta" v="Conta corrente" />
              <KV k="Agência" v="1231-9" />
              <KV k="Conta" v="4234234234234-3" />
            </Section>
          </>
        )}
      </div>
    );
  }

  // Form mode
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ padding: 24, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Editar cadastro</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FinField label="Nome completo" required>
            <input style={inputStyle} defaultValue="Bruno Raphael Castro" />
          </FinField>
          <FinField label="E-mail" required>
            <input style={inputStyle} defaultValue="castroeditor18@gmail.com" type="email" />
          </FinField>
          <FinField label="CPF" required>
            <input style={inputStyle} defaultValue="123.456.789-00" />
          </FinField>
          <FinField label="Data de nascimento" required>
            <input style={inputStyle} defaultValue="01/01/1995" />
          </FinField>
          <FinField label="Telefone" required>
            <input style={inputStyle} defaultValue="(11) 9 8765-4321" />
          </FinField>
          <FinField label="Renda mensal" required>
            <input style={inputStyle} defaultValue="8500,00" />
          </FinField>
          <FinField label="CEP" required>
            <input style={inputStyle} defaultValue="01415-002" />
          </FinField>
          <FinField label="Estado" required>
            <select style={inputStyle} defaultValue="SP">
              {ESTADOS_UF.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </FinField>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button onClick={() => setEditing(false)} style={{ height: 38, padding: "0 16px", borderRadius: "var(--r-md)", border: "1px solid var(--ink-200)", background: "var(--ink-0)", color: "var(--ink-700)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Cancelar
          </button>
          <button onClick={() => setEditing(false)} style={{ height: 38, padding: "0 16px", borderRadius: "var(--r-md)", border: 0, background: "var(--kai-orange)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Side nav ───────────────────────────────────────────────────────────────── */
const SECTIONS: { key: Section; label: string; icon: React.ElementType }[] = [
  { key: "carteira",  label: "Carteira",        icon: Wallet },
  { key: "bancarios", label: "Dados bancários", icon: CreditCard },
  { key: "taxas",     label: "Taxas e prazos",  icon: Percent },
  { key: "dados",     label: "Dados gerais",    icon: FileText },
];

/* ─── Page ──────────────────────────────────────────────────────────────────── */
export default function Financeiro() {
  const [section, setSection] = useState<Section>("carteira");
  const [accountType, setAccountType] = useState<AccountType>("PF");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ padding: "32px", maxWidth: 1240, margin: "0 auto", width: "100%" }}
    >
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Financeiro</h1>
        <p style={{ fontSize: 15, color: "var(--ink-600)" }}>Gerencie carteira, saques, dados bancários e cadastro.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24, alignItems: "start" }}>
        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {/* Profile card */}
          <div style={{ padding: 16, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 11, fontWeight: 700, color: "var(--kai-success)", marginBottom: 10 }}>
              <CheckCircle size={12} /> Identidade verificada
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, var(--kai-orange), var(--kai-orange-600))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "white", fontSize: 14, flexShrink: 0 }}>
                BR
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                <strong style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Bruno Raphael C…</strong>
                <div style={{ display: "flex", gap: 6, fontSize: 11, color: "var(--ink-600)", alignItems: "center" }}>
                  <span>Conta {accountType}</span>
                  <button
                    onClick={() => setAccountType((v) => v === "PF" ? "PJ" : "PF")}
                    style={{ background: "none", border: "none", color: "var(--kai-orange-600)", fontWeight: 600, fontSize: 11, cursor: "pointer", padding: 0 }}
                  >
                    → {accountType === "PF" ? "PJ" : "PF"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Nav items */}
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
              <s.icon size={16} style={{ color: section === s.key ? "white" : "var(--ink-600)" }} />
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {section === "carteira"  && <Carteira />}
          {section === "bancarios" && <DadosBancarios />}
          {section === "taxas"     && <Taxas />}
          {section === "dados"     && <DadosGerais accountType={accountType} />}
        </div>
      </div>
    </motion.div>
  );
}
