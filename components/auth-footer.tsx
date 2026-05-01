import Link from "next/link";

interface AuthFooterProps {
  actionText?: string;
}

export default function AuthFooter({
  actionText = "Iniciar sessão",
}: AuthFooterProps) {
  return (
    <div
      data-testid="auth-footer"
      className="mt-6 text-center text-[11px] leading-relaxed text-gray-500"
    >
      <p
        data-testid="auth-footer-text"
        className="mx-auto max-w-full px-2"
      >
        Ao clicar em {actionText} acima, você reconhece que leu e entendeu, e
        concorda com os nossos{" "}
        <Link
          data-testid="auth-footer-link-terms"
          href="/termos"
          className="text-gray-400 underline hover:text-gray-300"
        >
          Termos e Condições
        </Link>{" "}
        e a{" "}
        <Link
          data-testid="auth-footer-link-privacy"
          href="/privacidade"
          className="text-gray-400 underline hover:text-gray-300"
        >
          Política de Privacidade
        </Link>
        .
      </p>
    </div>
  );
}
