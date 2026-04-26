/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Página inicial com links de navegação.
 */

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold">Deullam Challenge</h1>
        <p className="text-sm text-gray-600">Base do frontend pronta. Próximos commits adicionam UI completa.</p>
        <div className="flex gap-3">
          <Link className="underline" href="/login">
            Login
          </Link>
          <Link className="underline" href="/dashboard">
            Dashboard
          </Link>
          <Link className="underline" href="/chat">
            Chat
          </Link>
        </div>
      </div>
    </main>
  );
}

