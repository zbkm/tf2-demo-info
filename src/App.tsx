import React, { useState, useCallback, useMemo } from 'react';
import { Upload, FileText, Users, MessageSquare, Crosshair, Map as MapIcon, Clock, ChevronRight, ExternalLink, ChevronLeft, Trophy } from 'lucide-react';
import { useDemoParser } from './hooks/useDemoParser';
import type { DemoData, PlayerSummary } from './types/demo';
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
          <h1 className="text-3xl font-bold text-white mb-2 font-mono tracking-tighter uppercase italic">TF2 DEMO VIEWER</h1>
          <p className="text-slate-400 text-lg">Drag and drop your <code className="text-orange-400">.dem</code> file here</p>
          <p className="text-slate-500 mt-4 text-sm font-medium tracking-tight">OR CLICK TO BROWSE FILES</p>
          {error && <p className="mt-8 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-orange-500 selection:text-white">
      <header className="bg-slate-900/50 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.png" className="h-8 w-auto hover:scale-105 transition-transform cursor-pointer" alt="TF2 Logo" onClick={reset} />
            <h1 className="font-extrabold text-xl tracking-tighter italic uppercase text-slate-100 hidden sm:block">Demo Viewer</h1>
          </div>
          <button
            onClick={reset}
            className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-2 group"
          >
            <Upload size={14} className="group-hover:-translate-y-0.5 transition-transform" />
            Upload another
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-2 p-1 bg-slate-900 rounded-xl mb-8 w-fit border border-slate-800 shadow-2xl">
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
                "flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20"
                  : "text-slate-500 hover:text-slate-200 hover:bg-slate-800"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
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
          <div key={i} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center gap-6 shadow-xl">
            <div className="w-14 h-14 bg-slate-950 rounded-xl flex items-center justify-center text-orange-500 border border-slate-800 outline outline-4 outline-slate-900/50">
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-white tracking-tighter">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Server Details">
           <div className="space-y-3">
            <InfoRow label="Server IP" value={data.header.server} />
            <InfoRow label="Protocol" value={data.header.protocol.toString()} />
            <InfoRow label="Recorder" value={data.header.nick} />
            <InfoRow label="Game" value={data.header.game} />
          </div>
        </Card>

        <Card title="Match Activity">
           <div className="space-y-3">
            <InfoRow label="Rounds" value={data.rounds.length.toString()} />
            <InfoRow label="Kills" value={data.deaths.length.toString()} />
            <InfoRow label="Chat Logs" value={data.chat.length.toString()} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/30">
        <h2 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-500">{title}</h2>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-slate-800/40 last:border-0 hover:bg-slate-800/10 transition-colors">
      <span className="text-slate-500 text-xs font-bold uppercase tracking-tight">{label}</span>
      <span className="text-slate-200 font-mono text-sm font-medium tracking-tight tabular-nums">{value}</span>
    </div>
  );
}

function Players({ data }: { data: DemoData }) {
  const users = Object.values(data.users);
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      if (a.team !== b.team) {
        if (a.team === 'red') return -1;
        if (b.team === 'red') return 1;
        if (a.team === 'blue') return -1;
        if (b.team === 'blue') return 1;
      }
      const scoreA = data.playerSummary?.player_summaries[a.userId.toString()]?.points || 0;
      const scoreB = data.playerSummary?.player_summaries[b.userId.toString()]?.points || 0;
      return scoreB - scoreA;
    });
  }, [users, data.playerSummary]);

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr className="bg-slate-950/50 border-b border-slate-800">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Player</th>
              <th className="px-3 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 text-center">Class</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 text-center">Score</th>
              <th className="px-2 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 text-center">K</th>
              <th className="px-2 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 text-center">A</th>
              <th className="px-2 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 text-center">D</th>
              <th className="px-2 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 text-center">K/D</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 text-right">DMG</th>
              <th className="px-2 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 text-center">HEAL</th>
              <th className="px-2 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 text-center" title="Ubers">UB</th>
              <th className="px-2 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 text-center" title="Headshot %">HS%</th>
              <th className="px-2 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 text-center" title="Backstabs">BS</th>
              <th className="px-2 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 text-center" title="Buildings Destroyed">BD</th>
              <th className="px-2 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 text-center" title="Support">SUP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {sortedUsers.map((user) => {
              const stats = data.playerSummary?.player_summaries[user.userId.toString()];
              const kd = stats ? (stats.deaths === 0 ? stats.kills : (stats.kills / stats.deaths).toFixed(2)) : '-';
              const hsPct = stats ? (stats.kills === 0 ? 0 : Math.round((stats.headshots / stats.kills) * 100)) : 0;

              // Find most played class
              const topClassId = Object.entries(user.classes).reduce((a, b) => b[1] > a[1] ? b : a, ['0', 0])[0];

              return (
                <tr key={user.userId} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="px-6 py-3 min-w-[200px]">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn(
                          "font-black text-sm uppercase tracking-tight",
                          user.team === 'red' ? "text-red-400" : user.team === 'blue' ? "text-blue-400" : "text-slate-400"
                        )}>
                          {user.name}
                        </span>
                        <a
                          href={`https://steamcommunity.com/profiles/${user.steamId.replace('[', '').replace(']', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-700 hover:text-orange-500 transition-colors"
                        >
                          <ExternalLink size={10} />
                        </a>
                      </div>
                      <span className="text-[9px] font-mono text-slate-600 tabular-nums font-bold tracking-tighter opacity-50">{user.steamId}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <img
                      src={getClassIcon(parseInt(topClassId), user.team)}
                      className="w-6 h-6 mx-auto drop-shadow-[0_0_2px_rgba(0,0,0,0.5)] bg-slate-800/50 rounded p-0.5 border border-slate-700/50"
                      alt={getClassName(parseInt(topClassId))}
                      title={Object.entries(user.classes).map(([id, count]) => count > 0 ? `${getClassName(parseInt(id))}: ${count}` : '').filter(Boolean).join('\n')}
                    />
                  </td>
                  <td className="px-4 py-3 text-center font-black text-orange-500 tabular-nums text-sm">
                    {stats?.points ?? '-'}
                  </td>
                  <td className="px-2 py-3 text-center text-slate-200 tabular-nums font-bold text-xs">{stats?.kills ?? '-'}</td>
                  <td className="px-2 py-3 text-center text-slate-500 tabular-nums text-xs">{stats?.assists ?? '-'}</td>
                  <td className="px-2 py-3 text-center text-slate-600 tabular-nums text-xs">{stats?.deaths ?? '-'}</td>
                  <td className="px-2 py-3 text-center tabular-nums text-[11px] font-mono font-bold text-slate-400">{kd}</td>
                  <td className="px-4 py-3 text-right text-slate-300 tabular-nums font-mono font-bold text-xs">
                    {stats?.damage_dealt.toLocaleString() ?? '-'}
                  </td>
                  <td className="px-2 py-3 text-center text-green-600/70 tabular-nums text-[11px] font-bold">{stats?.healing ? stats.healing.toLocaleString() : '-'}</td>
                  <td className="px-2 py-3 text-center text-blue-400 tabular-nums text-xs font-bold">{stats?.ubercharges || '-'}</td>
                  <td className="px-2 py-3 text-center text-orange-400/80 tabular-nums text-[11px] font-bold">{hsPct > 0 ? `${hsPct}%` : '-'}</td>
                  <td className="px-2 py-3 text-center text-purple-400 tabular-nums text-xs">{stats?.backstabs || '-'}</td>
                  <td className="px-2 py-3 text-center text-slate-300 tabular-nums text-xs">{stats?.buildings_destroyed || '-'}</td>
                  <td className="px-2 py-3 text-center text-slate-500 tabular-nums text-[10px] font-bold">{stats?.support || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden text-sm shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Time</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Killer</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Action</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Victim</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Weapon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {displayedDeaths.map((death, i) => {
                const killer = data.users[death.killer] || { name: 'Unknown', team: 'other' };
                const victim = data.users[death.victim] || { name: 'Unknown', team: 'other' };
                const time = formatTick(death.tick, data.intervalPerTick);

                return (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-3.5 text-[11px] font-mono text-slate-600 font-bold tracking-tight">{time}</td>
                    <td className="px-6 py-3.5 text-right">
                      <span className={cn(
                        "font-black uppercase tracking-tight text-xs",
                        killer.team === 'red' ? "text-red-400/90" : killer.team === 'blue' ? "text-blue-400/90" : "text-slate-400"
                      )}>
                        {killer.name}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <ChevronRight className="inline-block text-slate-700 group-hover:translate-x-1 transition-transform" size={12} />
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={cn(
                        "font-black uppercase tracking-tight text-xs",
                        victim.team === 'red' ? "text-red-400/90" : victim.team === 'blue' ? "text-blue-400/90" : "text-slate-400"
                      )}>
                        {victim.name}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-[10px] bg-slate-950 text-slate-500 px-2.5 py-1 rounded border border-slate-800 font-mono uppercase font-black italic tracking-tighter">
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
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">
          {page * ITEMS_PER_PAGE + 1}-{Math.min((page + 1) * ITEMS_PER_PAGE, data.deaths.length)} / {data.deaths.length}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-600 disabled:opacity-20 hover:text-white transition-colors shadow-lg"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center px-4 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-black text-orange-500/80 tracking-widest italic">
            {page + 1} / {totalPages}
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-600 disabled:opacity-20 hover:text-white transition-colors shadow-lg"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Chat({ data }: { data: DemoData }) {
  const getTeamByName = (name: string) => {
    const user = Object.values(data.users).find(u => u.name === name);
    return user?.team || 'other';
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden max-w-5xl mx-auto shadow-2xl relative">
      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-red-500/50 via-slate-800 to-blue-500/50"></div>
      <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/20">
        <div className="flex items-center gap-3">
          <MessageSquare className="text-orange-500" size={20} />
          <h2 className="font-black uppercase tracking-[0.2em] italic text-xs">Chat Communications</h2>
        </div>
        <span className="text-[9px] font-black text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">{data.chat.length} SIGNALS</span>
      </div>
      <div className="p-4 font-mono text-[11px] leading-relaxed max-h-[600px] overflow-y-auto custom-scrollbar bg-black/20">
        {data.chat.map((msg, i) => {
          const team = getTeamByName(msg.from);
          return (
            <div key={i} className="py-1 px-4 hover:bg-slate-800/30 rounded flex gap-4 transition-colors group">
              <span className="text-[9px] text-slate-700 shrink-0 w-12 tabular-nums pt-0.5 font-bold group-hover:text-slate-500 transition-colors tracking-tighter">
                {formatTick(msg.tick, data.intervalPerTick)}
              </span>
              <p className="break-words">
                <span className={cn(
                  "font-black tracking-tight uppercase",
                  team === 'red' ? "text-red-400" : team === 'blue' ? "text-blue-400" : "text-slate-500"
                )}>
                  {msg.from}
                </span>
                {msg.kind === 'TF_Chat_Team' && <span className="text-slate-600 ml-1.5 font-black text-[9px]">(TEAM)</span>}
                <span className="text-slate-700 font-black mx-1 opacity-50">:</span>
                <span className="text-slate-300 font-medium">{msg.text}</span>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {data.rounds.map((round, i) => (
        <div key={i} className="bg-slate-900 rounded-3xl border-2 border-slate-800 overflow-hidden flex flex-col group shadow-2xl relative">
           <div className={cn(
            "absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity",
            round.winner === 'red' ? "text-red-500" : "text-blue-500"
          )}>
            <Trophy size={120} />
          </div>
          <div className={cn(
            "h-2",
            round.winner === 'red' ? "bg-red-500" : "bg-blue-500"
          )} />
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-orange-500 border-2 border-slate-800 shadow-inner group-hover:rotate-6 transition-transform">
                  <Trophy size={28} />
                </div>
                <h3 className="font-black text-2xl italic tracking-tighter uppercase">ROUND {i + 1}</h3>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800/50">
              <RoundInfoRow label="Dominance" value={round.winner} winner={round.winner} />
              <RoundInfoRow label="Time Active" value={`${Math.floor(round.length / 60)}m ${Math.floor(round.length % 60)}s`} />
              <RoundInfoRow label="Final Tick" value={round.end_tick.toLocaleString()} />
            </div>

            <div className={cn(
              "mt-8 py-2 px-4 rounded-xl text-center text-[10px] font-black uppercase tracking-[0.3em] font-mono",
              round.winner === 'red' ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
            )}>
              {round.winner} VICTORY ACHIEVED
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RoundInfoRow({ label, value, winner }: { label: string, value: string, winner?: string }) {
  return (
    <div className="flex justify-between items-center bg-slate-950/30 p-3 rounded-xl border border-slate-800/10 hover:border-slate-700/30 transition-all">
      <span className="text-slate-600 font-black text-[9px] uppercase tracking-widest">{label}</span>
      <span className={cn(
        "font-black uppercase text-xs tabular-nums tracking-tighter",
        winner === 'red' ? "text-red-400" : winner === 'blue' ? "text-blue-400" : "text-slate-400"
      )}>{value}</span>
    </div>
  );
}

function getClassName(id: number): string {
  const classes = ['Scout', 'Soldier', 'Pyro', 'Demoman', 'Heavy', 'Engineer', 'Medic', 'Sniper', 'Spy', 'Other'];
  return classes[id] || 'Other';
}

function getClassIcon(id: number, team: 'red' | 'blue' | 'other'): string {
  if (team === 'other') return '/logo.png';
  const classNames = ['Scout', 'Soldier', 'Pyro', 'Demoman', 'Heavy', 'Engineer', 'Medic', 'Sniper', 'Spy'];
  const name = classNames[id] || 'Scout';
  return `/icons/classes/120px-${name}_emblem_${team.toUpperCase()}.png`;
}

function formatTick(tick: number, interval?: number): string {
  if (!interval) return tick.toString();
  const totalSeconds = tick * interval;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
