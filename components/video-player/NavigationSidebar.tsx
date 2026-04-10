import { Play, Volume2, BookmarkPlus, Settings } from 'lucide-react';

export function NavigationSidebar() {
  return (
    <aside className="w-16 border-r border-white/5 bg-[#0d1117] flex flex-col items-center py-4 gap-4">
      <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/20 text-brand transition hover:bg-brand/30">
        <Play size={20} />
      </button>
      <button className="flex h-12 w-12 items-center justify-center rounded-xl text-muted transition hover:bg-white/5">
        <Volume2 size={20} />
      </button>
      <button className="flex h-12 w-12 items-center justify-center rounded-xl text-muted transition hover:bg-white/5">
        <BookmarkPlus size={20} />
      </button>
      <button className="flex h-12 w-12 items-center justify-center rounded-xl text-muted transition hover:bg-white/5">
        <Settings size={20} />
      </button>
    </aside>
  );
}
