import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — BJJLF" },
      { name: "description", content: "Política de Privacidade da Brazilian Jiu-Jitsu Legends Federation, em conformidade com a LGPD." },
      { property: "og:title", content: "Política de Privacidade — BJJLF" },
      { property: "og:description", content: "Como tratamos seus dados pessoais na BJJLF — em conformidade com a LGPD." },
    ],
  }),
  component: PrivacyPage,
});

type Section = { title: string; body: React.ReactNode };

function PrivacyPage() {
  const { lang } = useI18n();
  const isPt = lang !== "en";

  const title = isPt ? "Política de Privacidade" : "Privacy Policy";
  const updated = isPt ? "Última atualização: maio de 2026" : "Last updated: May 2026";

  const sections: Section[] = isPt ? PT_SECTIONS : EN_SECTIONS;

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-6">
        <h1
          className="uppercase tracking-wide text-4xl text-gray-900"
          style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700 }}
        >
          {title}
        </h1>
        <div className="h-1 w-12 bg-[#C41E3A] rounded mt-3 mb-6" />
        <p className="text-sm text-gray-500 mb-12" style={{ fontFamily: "DM Sans, sans-serif" }}>
          {updated}
        </p>

        <div className="space-y-12" style={{ fontFamily: "DM Sans, sans-serif" }}>
          {sections.map((s, i) => (
            <section key={i}>
              <h2
                className="uppercase tracking-wider text-xl mb-4"
                style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, color: "#C41E3A" }}
              >
                {i + 1}. {s.title}
              </h2>
              <div className="text-gray-700 leading-[1.75] space-y-3">{s.body}</div>
            </section>
          ))}
        </div>

        <p className="mt-16 text-sm text-gray-500" style={{ fontFamily: "DM Sans, sans-serif" }}>
          © 2026 BJJLF — Brazilian Jiu-Jitsu Legends Federation.
        </p>
      </div>
    </div>
  );
}

const PT_SECTIONS: Section[] = [
  {
    title: "Introdução",
    body: (
      <p>
        A Brazilian Jiu-Jitsu Legends Federation (BJJLF) respeita a privacidade de seus atletas, academias e
        visitantes. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos seus
        dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
      </p>
    ),
  },
  {
    title: "Dados que Coletamos",
    body: (
      <ul className="list-disc pl-6 space-y-1.5">
        <li>Dados de identificação: nome completo, data de nascimento, nacionalidade, documento de identidade.</li>
        <li>Dados de contato: endereço de e-mail, telefone.</li>
        <li>Dados esportivos: faixa, grau, academia, professor responsável, histórico de competições e graduações.</li>
        <li>Dados de acesso: endereço IP, tipo de navegador, páginas visitadas.</li>
        <li>Fotos de perfil enviadas voluntariamente pelo atleta.</li>
      </ul>
    ),
  },
  {
    title: "Como Usamos Seus Dados",
    body: (
      <ul className="list-disc pl-6 space-y-1.5">
        <li>Emissão e gestão da carteirinha digital do atleta.</li>
        <li>Controle de filiação de academias e alvarás.</li>
        <li>Publicação de rankings e resultados de competições.</li>
        <li>Comunicações oficiais da federação.</li>
        <li>Verificação pública de credenciais (apenas dados esportivos).</li>
        <li>Cumprimento de obrigações legais e regulatórias.</li>
      </ul>
    ),
  },
  {
    title: "Compartilhamento de Dados",
    body: (
      <>
        <p>A BJJLF não vende, aluga ou comercializa dados pessoais. Podemos compartilhar dados com:</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Organizadores de eventos sancionados pela BJJLF.</li>
          <li>Autoridades competentes, quando exigido por lei.</li>
          <li>Prestadores de serviços tecnológicos (hospedagem, pagamento), sob acordos de confidencialidade.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Dados Públicos",
    body: (
      <p>
        O nome, faixa, grau, academia e número de registro do atleta são considerados dados públicos e podem
        aparecer em rankings, diretórios de faixas pretas e resultados de campeonatos disponíveis no site.
      </p>
    ),
  },
  {
    title: "Armazenamento e Segurança",
    body: (
      <p>
        Seus dados são armazenados em servidores seguros com criptografia. Adotamos medidas técnicas e
        organizacionais para proteger suas informações contra acesso não autorizado, perda ou alteração.
      </p>
    ),
  },
  {
    title: "Seus Direitos (LGPD)",
    body: (
      <>
        <p>Como titular de dados, você tem direito a:</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Confirmar a existência de tratamento de seus dados.</li>
          <li>Acessar seus dados pessoais.</li>
          <li>Corrigir dados incompletos ou desatualizados.</li>
          <li>Solicitar a eliminação de dados desnecessários.</li>
          <li>Revogar o consentimento a qualquer momento.</li>
        </ul>
        <p>
          Para exercer seus direitos, entre em contato pelo formulário em{" "}
          <a href="/contact" className="text-[#C41E3A] underline">bjjlf.org/contact</a>.
        </p>
      </>
    ),
  },
  {
    title: "Cookies",
    body: (
      <p>
        Utilizamos cookies essenciais para o funcionamento do site e cookies analíticos para melhorar a
        experiência. Você pode desativar cookies nas configurações do seu navegador.
      </p>
    ),
  },
  {
    title: "Alterações nesta Política",
    body: (
      <p>
        Reservamo-nos o direito de atualizar esta política. Alterações significativas serão comunicadas por
        e-mail ou aviso no site.
      </p>
    ),
  },
  {
    title: "Contato",
    body: (
      <>
        <p>Encarregado de Proteção de Dados (DPO): BJJLF</p>
        <p>
          Contato:{" "}
          <a href="/contact" className="text-[#C41E3A] underline">bjjlf.org/contact</a>
        </p>
      </>
    ),
  },
];

const EN_SECTIONS: Section[] = [
  {
    title: "Introduction",
    body: (
      <p>
        The Brazilian Jiu-Jitsu Legends Federation (BJJLF) respects the privacy of its athletes, academies and
        visitors. This Privacy Policy describes how we collect, use, store and protect your personal data, in
        compliance with the Brazilian General Data Protection Law (LGPD — Law no. 13,709/2018).
      </p>
    ),
  },
  {
    title: "Data We Collect",
    body: (
      <ul className="list-disc pl-6 space-y-1.5">
        <li>Identification data: full name, date of birth, nationality, identity document.</li>
        <li>Contact data: email address, phone number.</li>
        <li>Sports data: belt, degree, academy, head professor, competition and graduation history.</li>
        <li>Access data: IP address, browser type, pages visited.</li>
        <li>Profile photos voluntarily uploaded by the athlete.</li>
      </ul>
    ),
  },
  {
    title: "How We Use Your Data",
    body: (
      <ul className="list-disc pl-6 space-y-1.5">
        <li>Issuance and management of the athlete's digital ID card.</li>
        <li>Academy affiliation and permit control.</li>
        <li>Publication of rankings and competition results.</li>
        <li>Official federation communications.</li>
        <li>Public credential verification (sports data only).</li>
        <li>Compliance with legal and regulatory obligations.</li>
      </ul>
    ),
  },
  {
    title: "Data Sharing",
    body: (
      <>
        <p>BJJLF does not sell, rent or trade personal data. We may share data with:</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Organizers of BJJLF-sanctioned events.</li>
          <li>Competent authorities when required by law.</li>
          <li>Technology service providers (hosting, payments) under confidentiality agreements.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Public Data",
    body: (
      <p>
        The athlete's name, belt, degree, academy and registration number are considered public data and may
        appear in rankings, black belt directories and championship results available on the site.
      </p>
    ),
  },
  {
    title: "Storage and Security",
    body: (
      <p>
        Your data is stored on secure, encrypted servers. We adopt technical and organizational measures to
        protect your information against unauthorized access, loss or alteration.
      </p>
    ),
  },
  {
    title: "Your Rights (LGPD)",
    body: (
      <>
        <p>As a data subject, you have the right to:</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Confirm the existence of processing of your data.</li>
          <li>Access your personal data.</li>
          <li>Correct incomplete or outdated data.</li>
          <li>Request the deletion of unnecessary data.</li>
          <li>Withdraw consent at any time.</li>
        </ul>
        <p>
          To exercise your rights, contact us through the form at{" "}
          <a href="/contact" className="text-[#C41E3A] underline">bjjlf.org/contact</a>.
        </p>
      </>
    ),
  },
  {
    title: "Cookies",
    body: (
      <p>
        We use essential cookies for site functionality and analytics cookies to improve the experience. You
        can disable cookies in your browser settings.
      </p>
    ),
  },
  {
    title: "Changes to This Policy",
    body: (
      <p>
        We reserve the right to update this policy. Significant changes will be communicated by email or
        notice on the site.
      </p>
    ),
  },
  {
    title: "Contact",
    body: (
      <>
        <p>Data Protection Officer (DPO): BJJLF</p>
        <p>
          Contact:{" "}
          <a href="/contact" className="text-[#C41E3A] underline">bjjlf.org/contact</a>
        </p>
      </>
    ),
  },
];
