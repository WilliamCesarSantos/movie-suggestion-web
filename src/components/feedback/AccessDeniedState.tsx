export function AccessDeniedState() {
  return (
    <section className="mx-auto my-12 max-w-xl rounded-[var(--ms-radius-lg)] border border-[color:var(--ms-border)] bg-[color:var(--ms-surface)] p-8 text-center shadow-[var(--ms-shadow)]">
      <div className="mb-4 text-4xl" aria-hidden="true">
        ⛔
      </div>
      <h2 className="text-2xl font-semibold text-[color:var(--ms-text)]">Acesso negado</h2>
      <p className="mt-3 text-[color:var(--ms-text-muted)]">
        Você não possui permissão para visualizar este conteúdo.
      </p>
    </section>
  );
}
