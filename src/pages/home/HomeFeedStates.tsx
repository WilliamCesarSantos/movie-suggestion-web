export function HomeFeedStates({ kind, message }: { kind: 'loading' | 'error' | 'empty'; message?: string }) {
  if (kind === 'loading') return <p className="p-6 text-slate-300">Carregando filmes...</p>;
  if (kind === 'error') return <p className="p-6 text-red-400">{message ?? 'Não foi possível carregar a lista.'}</p>;
  return <p className="p-6 text-slate-300">Nenhum filme encontrado.</p>;
}
