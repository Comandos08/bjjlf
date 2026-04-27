import { createFileRoute } from "@tanstack/react-router";

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

function TermsPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-6 prose prose-neutral">
        <h1 className="font-heading uppercase tracking-wide text-3xl text-gray-900">Termos de Uso</h1>
        <div className="h-1 w-12 bg-[#C8211A] rounded mt-3 mb-8" />
        <p>Última atualização: Abril de 2026.</p>

        <h2>1. Aceitação</h2>
        <p>Ao acessar e usar a plataforma BJJLF, você concorda com estes Termos de Uso e com a nossa Política de Privacidade.</p>

        <h2>2. Cadastro de atletas e academias</h2>
        <p>Você se compromete a fornecer informações verdadeiras. Cadastros com dados falsos podem ser suspensos sem aviso prévio. A carteirinha do atleta é pessoal e intransferível.</p>

        <h2>3. Pagamentos e inscrições</h2>
        <p>Inscrições em eventos e emissão de alvarás de academia podem envolver pagamento. Os valores são informados antes da confirmação. Reembolsos seguem a política específica de cada evento.</p>

        <h2>4. Conduta</h2>
        <p>É proibido usar a plataforma para atividades ilegais, discurso de ódio ou qualquer conduta que viole o regulamento técnico e o código de ética da federação.</p>

        <h2>5. Limitação de responsabilidade</h2>
        <p>A BJJLF não se responsabiliza por danos decorrentes de uso indevido da plataforma. Em eventos presenciais, regras de responsabilidade do organizador prevalecem.</p>

        <h2>6. Alterações</h2>
        <p>Estes Termos podem ser atualizados a qualquer momento. A versão vigente está sempre disponível nesta página.</p>

        <p className="mt-12 text-sm text-gray-500">© 2026 BJJLF — Brazilian Jiu-Jitsu Legends Federation.</p>
      </div>
    </div>
  );
}
