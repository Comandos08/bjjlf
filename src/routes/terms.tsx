import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — BJJLF" },
      { name: "description", content: "Termos de Uso da Brazilian Jiu-Jitsu Legends Federation." },
      { property: "og:title", content: "Termos de Uso — BJJLF" },
      { property: "og:description", content: "Termos e condições para uso da plataforma BJJLF." },
    ],
  }),
  component: TermsPage,
});

type Section = { title: string; body: React.ReactNode };

function TermsPage() {
  const { lang } = useI18n();
  const isPt = lang !== "en";

  const title = isPt ? "Termos de Uso" : "Terms of Use";
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
    title: "Aceitação dos Termos",
    body: (
      <p>
        Ao acessar e utilizar o site da Brazilian Jiu-Jitsu Legends Federation (BJJLF), você concorda com
        estes Termos de Uso. Caso não concorde, não utilize nossos serviços.
      </p>
    ),
  },
  {
    title: "Sobre a BJJLF",
    body: (
      <p>
        A BJJLF é uma federação esportiva dedicada à organização, regulamentação e promoção do Brazilian
        Jiu-Jitsu, preservando os princípios técnicos, filosóficos e disciplinares da arte suave.
      </p>
    ),
  },
  {
    title: "Cadastro de Atletas e Academias",
    body: (
      <ul className="list-disc pl-6 space-y-1.5">
        <li>O cadastro deve ser realizado com informações verdadeiras e atualizadas.</li>
        <li>É vedado o cadastro em nome de terceiros sem autorização.</li>
        <li>A BJJLF reserva-se o direito de suspender cadastros com informações falsas ou inconsistentes.</li>
        <li>A filiação está sujeita à aprovação da federação e ao pagamento das taxas vigentes.</li>
      </ul>
    ),
  },
  {
    title: "Carteirinha Digital",
    body: (
      <ul className="list-disc pl-6 space-y-1.5">
        <li>A carteirinha digital é de uso pessoal e intransferível.</li>
        <li>É proibido compartilhar credenciais de acesso com terceiros.</li>
        <li>A carteirinha é válida pelo período indicado e deve ser renovada anualmente.</li>
        <li>A BJJLF pode cancelar a carteirinha em caso de violação das regras da federação.</li>
      </ul>
    ),
  },
  {
    title: "Regras de Competição",
    body: (
      <p>
        Todos os atletas filiados devem respeitar o Regulamento Oficial da BJJLF disponível em{" "}
        <a href="/rules" className="text-[#C41E3A] underline">bjjlf.lovable.app/rules</a>. O não cumprimento
        pode resultar em desclassificação, suspensão ou cancelamento da filiação.
      </p>
    ),
  },
  {
    title: "Propriedade Intelectual",
    body: (
      <p>
        Todo o conteúdo do site — logotipos, textos, imagens, rankings e dados — é de propriedade da BJJLF ou
        de seus licenciantes. É proibida a reprodução sem autorização expressa.
      </p>
    ),
  },
  {
    title: "Conduta do Usuário",
    body: (
      <>
        <p>É proibido:</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Utilizar o site para fins ilegais ou não autorizados.</li>
          <li>Tentar acessar áreas restritas do sistema.</li>
          <li>Publicar informações falsas ou difamatórias.</li>
          <li>Interferir no funcionamento do site.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Limitação de Responsabilidade",
    body: (
      <p>
        A BJJLF não se responsabiliza por danos decorrentes do uso indevido do site, interrupções técnicas
        ou informações desatualizadas fornecidas por terceiros.
      </p>
    ),
  },
  {
    title: "Foro",
    body: (
      <p>
        Estes termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca do Rio de Janeiro —
        RJ para dirimir quaisquer controvérsias.
      </p>
    ),
  },
  {
    title: "Contato",
    body: (
      <p>
        Dúvidas sobre estes termos:{" "}
        <a href="/contact" className="text-[#C41E3A] underline">bjjlf.org/contact</a>
      </p>
    ),
  },
];

const EN_SECTIONS: Section[] = [
  {
    title: "Acceptance of Terms",
    body: (
      <p>
        By accessing and using the Brazilian Jiu-Jitsu Legends Federation (BJJLF) website, you agree to
        these Terms of Use. If you do not agree, please do not use our services.
      </p>
    ),
  },
  {
    title: "About BJJLF",
    body: (
      <p>
        BJJLF is a sports federation dedicated to the organization, regulation and promotion of Brazilian
        Jiu-Jitsu, preserving the technical, philosophical and disciplinary principles of the gentle art.
      </p>
    ),
  },
  {
    title: "Athlete and Academy Registration",
    body: (
      <ul className="list-disc pl-6 space-y-1.5">
        <li>Registration must be carried out with true and up-to-date information.</li>
        <li>Registration on behalf of third parties without authorization is prohibited.</li>
        <li>BJJLF reserves the right to suspend registrations with false or inconsistent information.</li>
        <li>Affiliation is subject to federation approval and payment of applicable fees.</li>
      </ul>
    ),
  },
  {
    title: "Digital ID Card",
    body: (
      <ul className="list-disc pl-6 space-y-1.5">
        <li>The digital ID card is for personal use and non-transferable.</li>
        <li>Sharing access credentials with third parties is prohibited.</li>
        <li>The card is valid for the indicated period and must be renewed annually.</li>
        <li>BJJLF may cancel the card in case of violation of federation rules.</li>
      </ul>
    ),
  },
  {
    title: "Competition Rules",
    body: (
      <p>
        All affiliated athletes must respect the Official BJJLF Rulebook available at{" "}
        <a href="/rules" className="text-[#C41E3A] underline">bjjlf.lovable.app/rules</a>. Non-compliance may
        result in disqualification, suspension or cancellation of affiliation.
      </p>
    ),
  },
  {
    title: "Intellectual Property",
    body: (
      <p>
        All site content — logos, texts, images, rankings and data — is the property of BJJLF or its
        licensors. Reproduction without express authorization is prohibited.
      </p>
    ),
  },
  {
    title: "User Conduct",
    body: (
      <>
        <p>The following is prohibited:</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Using the site for illegal or unauthorized purposes.</li>
          <li>Attempting to access restricted areas of the system.</li>
          <li>Publishing false or defamatory information.</li>
          <li>Interfering with the operation of the site.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Limitation of Liability",
    body: (
      <p>
        BJJLF is not liable for damages arising from misuse of the site, technical interruptions or outdated
        information provided by third parties.
      </p>
    ),
  },
  {
    title: "Jurisdiction",
    body: (
      <p>
        These terms are governed by Brazilian law. The court of the district of Rio de Janeiro — RJ is
        elected to resolve any disputes.
      </p>
    ),
  },
  {
    title: "Contact",
    body: (
      <p>
        Questions about these terms:{" "}
        <a href="/contact" className="text-[#C41E3A] underline">bjjlf.org/contact</a>
      </p>
    ),
  },
];
