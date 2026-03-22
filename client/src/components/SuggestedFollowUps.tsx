type SuggestedFollowUpsProps = {
  query: string;
  onSend: (text: string) => void;
};

export function SuggestedFollowUps({ query, onSend }: SuggestedFollowUpsProps) {
  const suggestions = [
    `What are the biggest complaints about ${query}?`,
    `Is ${query} worth the money?`,
    `What are the alternatives to ${query}?`,
    `Tell me the worst thing about ${query}`,
  ];

  return (
    <div className="px-4 py-2 flex gap-2 overflow-x-auto">
      {suggestions.map((s) => (
        <button
          key={s}
          onClick={() => onSend(s)}
          className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-300 dark:hover:border-red-500/30 hover:text-red-600 dark:hover:text-red-400 transition-all active:scale-95"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
