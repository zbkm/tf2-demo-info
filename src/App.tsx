import React, { useState, useCallback, useMemo } from 'react';
import { Upload, FileText, Users, MessageSquare, Crosshair, Map as MapIcon, Clock, ChevronRight, ExternalLink, ChevronLeft, Trophy } from 'lucide-react';
import { useDemoParser } from './hooks/useDemoParser';
import type { DemoData } from './types/demo';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const { data, loading, error, parseDemo, reset } = useDemoParser();
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'chat' | 'kills' | 'rounds'>('overview');

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.dem')) {
      parseDemo(file);
    }
  }, [parseDemo]);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseDemo(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xl font-medium animate-pulse">Parsing demo file...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="max-w-2xl w-full aspect-video border-2 border-dashed border-slate-700 rounded-3xl flex flex-col items-center justify-center bg-slate-900/50 hover:bg-slate-900/80 hover:border-orange-500/50 transition-all group cursor-pointer relative"
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".dem"
            onChange={onFileSelect}
          />
          <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-500/10 transition-all text-slate-400 group-hover:text-orange-500">
            <Upload size={40} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">TF2 Demo Viewer</h1>
          <p className="text-slate-400 text-lg">Drag and drop your <code className="text-orange-400">.dem</code> file here</p>
          <p className="text-slate-500 mt-4 text-sm">or click to browse files</p>
          {error && <p className="mt-8 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="bg-slate-900/50 border-b border-slate-800 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">TF</div>
            <h1 className="font-bold text-xl tracking-tight">Demo Viewer</h1>
          </div>
          <button
            onClick={reset}
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Upload another
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-2 p-1 bg-slate-900 rounded-xl mb-8 w-fit border border-slate-800">
          {[
            { id: 'overview', icon: FileText, label: 'Overview' },
            { id: 'players', icon: Users, label: 'Players' },
            { id: 'kills', icon: Crosshair, label: 'Killfeed' },
            { id: 'chat', icon: MessageSquare, label: 'Chat' },
            { id: 'rounds', icon: Trophy, label: 'Rounds' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {activeTab === 'overview' && <Overview data={data} />}
          {activeTab === 'players' && <Players data={data} />}
          {activeTab === 'kills' && <Killfeed data={data} />}
          {activeTab === 'chat' && <Chat data={data} />}
          {activeTab === 'rounds' && <Rounds data={data} />}
        </div>
      </main>
    </div>
  );
}

function Overview({ data }: { data: DemoData }) {
  const stats = [
    { label: 'Map', value: data.header.map, icon: MapIcon },
    { label: 'Duration', value: `${Math.floor(data.header.duration / 60)}m ${Math.floor(data.header.duration % 60)}s`, icon: Clock },
    { label: 'Ticks', value: data.header.ticks.toLocaleString(), icon: FileText },
    { label: 'Players', value: Object.keys(data.users).length, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-orange-500">
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <p className="text-xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="font-bold text-lg">Server Info</h2>
          </div>
          <div className="p-6 space-y-4">
            <InfoRow label="Server IP" value={data.header.server} />
            <InfoRow label="Protocol" value={data.header.protocol.toString()} />
            <InfoRow label="Recorder" value={data.header.nick} />
            <InfoRow label="Game" value={data.header.game} />
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="font-bold text-lg">Match Summary</h2>
          </div>
          <div className="p-6 space-y-4">
            <InfoRow label="Total Rounds" value={data.rounds.length.toString()} />
            <InfoRow label="Total Kills" value={data.deaths.length.toString()} />
            <InfoRow label="Total Chat Msgs" value={data.chat.length.toString()} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className="text-slate-200 font-mono text-sm">{value}</span>
    </div>
  );
}

function Players({ data }: { data: DemoData }) {
  const users = Object.values(data.users);
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      // Team sort first
      if (a.team !== b.team) {
        if (a.team === 'red') return -1;
        if (b.team === 'red') return 1;
        if (a.team === 'blue') return -1;
        if (b.team === 'blue') return 1;
      }
      // Then score/points if available
      const scoreA = data.playerSummary?.player_summaries[a.userId.toString()]?.points || 0;
      const scoreB = data.playerSummary?.player_summaries[b.userId.toString()]?.points || 0;
      return scoreB - scoreA;
    });
  }, [users, data.playerSummary]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {sortedUsers.map((user) => {
        const stats = data.playerSummary?.player_summaries[user.userId.toString()];
        return (
          <div key={user.userId} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col group min-h-[180px]">
            <div className={cn(
              "h-1.5",
              user.team === 'red' ? "bg-red-500" : user.team === 'blue' ? "bg-blue-500" : "bg-slate-600"
            )} />
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className={cn(
                      "text-xl font-bold transition-colors",
                      user.team === 'red' ? "text-red-400" : user.team === 'blue' ? "text-blue-400" : "text-slate-200"
                    )}>{user.name}</h3>
                    <a
                      href={`https://steamcommunity.com/profiles/${user.steamId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:text-orange-500 transition-colors"
                      title="View Steam Profile"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                  <p className="text-[10px] font-mono text-slate-500">{user.steamId}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
                    user.team === 'red' ? "bg-red-500/10 text-red-500" : user.team === 'blue' ? "bg-blue-500/10 text-blue-500" : "bg-slate-800 text-slate-400"
                  )}>
                    {user.team}
                  </span>
                  {stats && (
                    <span className="text-orange-500 font-bold text-lg tabular-nums">
                      {stats.points} <span className="text-[10px] text-slate-500 uppercase font-bold">pts</span>
                    </span>
                  )}
                </div>
              </div>

              {stats && (
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-4 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                  <StatMini label="K" value={stats.kills} />
                  <StatMini label="A" value={stats.assists} />
                  <StatMini label="D" value={stats.deaths} />
                  <StatMini label="DMG" value={stats.damage_dealt} wide />
                  <StatMini label="UBER" value={stats.ubercharges} />
                  <StatMini label="HS" value={stats.headshots} />
                  <StatMini label="BACK" value={stats.backstabs} />
                  <StatMini label="HEAL" value={stats.healing} wide />
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-auto">
                {Object.entries(user.classes).map(([classId, count]) => (
                  count > 0 && (
                    <div key={classId} className="bg-slate-800 px-3 py-1 rounded-lg flex items-center gap-2 border border-slate-700/50 group-hover:border-slate-600 transition-colors">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{getClassName(parseInt(classId))}</span>
                      <span className="text-xs font-black text-orange-500 tabular-nums">{count}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatMini({ label, value, wide }: { label: string, value: number, wide?: boolean }) {
  return (
    <div className={cn("flex flex-col items-center", wide && "col-span-1")}>
      <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter mb-0.5">{label}</span>
      <span className="text-xs font-bold text-slate-300 tabular-nums">{value.toLocaleString()}</span>
    </div>
  );
}

const ITEMS_PER_PAGE = 50;

function Killfeed({ data }: { data: DemoData }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(data.deaths.length / ITEMS_PER_PAGE);

  const displayedDeaths = useMemo(() => {
    return data.deaths.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
  }, [data.deaths, page]);

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Time</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Killer</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Action</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Victim</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Weapon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {displayedDeaths.map((death, i) => {
                const killer = data.users[death.killer] || { name: 'Unknown', team: 'other' };
                const victim = data.users[death.victim] || { name: 'Unknown', team: 'other' };
                const time = formatTick(death.tick, data.intervalPerTick);

                return (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 text-sm font-mono text-slate-500">{time}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn(
                        "font-bold",
                        killer.team === 'red' ? "text-red-400" : killer.team === 'blue' ? "text-blue-400" : "text-slate-400"
                      )}>
                        {killer.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ChevronRight className="inline-block text-slate-600 group-hover:translate-x-1 transition-transform" size={16} />
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "font-bold",
                        victim.team === 'red' ? "text-red-400" : victim.team === 'blue' ? "text-blue-400" : "text-slate-400"
                      )}>
                        {victim.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] bg-slate-950 text-slate-500 px-2 py-1 rounded border border-slate-800 font-mono uppercase tracking-tight">
                        {death.weapon}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <p className="text-xs text-slate-500">
          Showing {page * ITEMS_PER_PAGE + 1} to {Math.min((page + 1) * ITEMS_PER_PAGE, data.deaths.length)} of {data.deaths.length}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 disabled:opacity-30 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center px-4 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-300">
            {page + 1} / {totalPages}
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 disabled:opacity-30 hover:text-white transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Chat({ data }: { data: DemoData }) {
  // Find sender by name and return team
  const getTeamByName = (name: string) => {
    const user = Object.values(data.users).find(u => u.name === name);
    return user?.team || 'other';
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden max-w-4xl mx-auto shadow-xl">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-slate-500" size={20} />
          <h2 className="font-bold">Chat Log</h2>
        </div>
        <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{data.chat.length} MSGS</span>
      </div>
      <div className="p-2 font-mono text-sm leading-relaxed max-h-[600px] overflow-y-auto custom-scrollbar">
        {data.chat.map((msg, i) => {
          const team = getTeamByName(msg.from);
          return (
            <div key={i} className="py-1 px-4 hover:bg-slate-800/50 rounded flex gap-3 transition-colors">
              <span className="text-[10px] text-slate-600 shrink-0 w-12 tabular-nums pt-0.5">
                {formatTick(msg.tick, data.intervalPerTick)}
              </span>
              <p className="break-words">
                <span className={cn(
                  "font-bold",
                  team === 'red' ? "text-red-400" : team === 'blue' ? "text-blue-400" : "text-slate-400"
                )}>
                  {msg.from}
                </span>
                <span className="text-slate-500">: </span>
                <span className="text-slate-300">{msg.text}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Rounds({ data }: { data: DemoData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.rounds.map((round, i) => (
        <div key={i} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col group">
          <div className={cn(
            "h-1.5",
            round.winner === 'red' ? "bg-red-500" : "bg-blue-500"
          )} />
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                  <Trophy size={20} />
                </div>
                <h3 className="font-bold text-lg">Round {i + 1}</h3>
              </div>
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
                round.winner === 'red' ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
              )}>
                {round.winner} victory
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Winner</span>
                <span className={cn(
                  "font-bold capitalize",
                  round.winner === 'red' ? "text-red-400" : "text-blue-400"
                )}>{round.winner}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Duration</span>
                <span className="text-slate-200 font-mono">{Math.floor(round.length / 60)}m {Math.floor(round.length % 60)}s</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">End Tick</span>
                <span className="text-slate-200 font-mono">{round.end_tick.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function getClassName(id: number): string {
  const classes = ['Scout', 'Soldier', 'Pyro', 'Demoman', 'Heavy', 'Engineer', 'Medic', 'Sniper', 'Spy', 'Unknown'];
  return classes[id] || 'Unknown';
}

function formatTick(tick: number, interval?: number): string {
  if (!interval) return tick.toString();
  const totalSeconds = tick * interval;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
