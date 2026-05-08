import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — BJJLF" },
      { name: "description", content: "Política de Privacidade da Brazilian Jiu-Jitsu Legends Federation." },
      { property: "og:title", content: "Política de Privacidade — BJJLF" },
      { property: "og:description", content: "Como tratamos seus dados pessoais na BJJLF." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-6 prose prose-neutral">
        <h1 className="font-heading uppercase tracking-wide text-3xl text-gray-900">Política de Privacidade</h1>
        <div className="h-1 w-12 bg-[#C8211A] rounded mt-3 mb-8" />
        <p>Última atualização: Abril de 2026.</p>

        <h2>1. Quais dados coletamos</h2>
        <p>
          Coletamos apenas os dados necessários para emitir sua carteirinha, processar inscrições em eventos e
          manter o registro oficial de atletas e academias filiadas: nome completo, email, telefone, foto,
          academia, faixa, grau, data de nascimento e país.
        </p>

        <h2>2. Como usamos seus dados</h2>
        <ul>
          <li>Emissão e renovação da carteirinha digital.</li>
          <li>Inscrição em eventos e comunicações relacionadas.</li>
          <li>Verificação pública via QR Code (apenas dados não sensíveis).</li>
          <li>Comunicações oficiais da federação.</li>
        </ul>

        <h2>3. Compartilhamento</h2>
        <p>
          Não vendemos nem cedemos seus dados. Compartilhamos apenas com provedores de pagamento
          (quando aplicável) e quando exigido por lei.
        </p>

        <h2>4. Seus direitos</h2>
        <p>
          Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento através da nossa{" "}
          <a className="text-[#C8211A]" href="/contact">página de contato</a>.
        </p>

        <h2>5. Cookies</h2>
        <p>Usamos cookies essenciais para autenticação e preferência de idioma. Não usamos cookies de rastreamento de terceiros.</p>

        <p className="mt-12 text-sm text-gray-500">© 2026 BJJLF — Brazilian Jiu-Jitsu Legends Federation.</p>
      </div>
    </div>
  );
}
