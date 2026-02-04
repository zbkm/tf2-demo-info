import React, { useState, useCallback, useMemo } from 'react';
import { Upload, FileText, Users, MessageSquare, Crosshair, Map as MapIcon, Clock, ChevronRight, ExternalLink, ChevronLeft, Trophy, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { useDemoParser } from './hooks/useDemoParser';
import type { DemoData, PlayerSummary } from './types/demo';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type SortConfig = {
  key: keyof PlayerSummary | 'name' | 'points' | 'kd' | 'hsPct';
  direction: 'asc' | 'desc';
} | null;

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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xl font-medium animate-pulse">Parsing demo file...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans text-center">
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
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">TF2 Demo Viewer</h1>
          <p className="text-slate-400 text-lg">Drag and drop your <code className="text-orange-400">.dem</code> file here</p>
          <p className="text-slate-500 mt-4 text-sm font-medium uppercase tracking-widest group-hover:text-slate-300">Click to browse files</p>
          {error && <p className="mt-8 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20 font-medium">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-orange-500 selection:text-white font-sans">
      <header className="bg-slate-900/50 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.png" className="h-8 w-auto cursor-pointer" alt="TF2 Logo" onClick={reset} />
            <h1 className="font-bold text-lg tracking-tight text-white hidden sm:block">Demo Viewer</h1>
          </div>
          <button
            onClick={reset}
            className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-2"
          >
            <Upload size={14} />
            Parse Another
          </button>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 py-8">
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
                "flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-orange-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="animate-in fade-in duration-300">
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
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-orange-500">
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">{stat.label}</p>
                <p className="text-xl font-bold text-slate-100">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Section title="Server Intel">
          <InfoRow label="IP Address" value={data.header.server} />
          <InfoRow label="Protocol" value={data.header.protocol.toString()} />
          <InfoRow label="Recorded By" value={data.header.nick} />
          <InfoRow label="Game" value={data.header.game} />
        </Section>

        <Section title="Match Stats">
          <InfoRow label="Rounds Played" value={data.rounds.length.toString()} />
          <InfoRow label="Total Kills" value={data.deaths.length.toString()} />
          <InfoRow label="Messages Sent" value={data.chat.length.toString()} />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/20">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{title}</h2>
      </div>
      <div className="p-6 space-y-1">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-slate-800/30 last:border-0 hover:bg-slate-800/10 transition-colors px-2 rounded-md">
      <span className="text-slate-500 text-xs font-medium">{label}</span>
      <span className="text-slate-200 font-mono text-sm tracking-tight font-medium tabular-nums">{value}</span>
    </div>
  );
}

function Players({ data }: { data: DemoData }) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'points', direction: 'desc' });

  const users = Object.values(data.users);

  const handleSort = (key: Exclude<SortConfig, null>['key']) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'desc' ? 'asc' : 'desc' };
      }
      return { key, direction: 'desc' };
    });
  };

  const sortedUsers = useMemo(() => {
    const list = [...users];
    if (!sortConfig) return list;

    return list.sort((a, b) => {
      const statsA = data.playerSummary?.player_summaries[a.userId.toString()];
      const statsB = data.playerSummary?.player_summaries[b.userId.toString()];

      let valA: any = 0;
      let valB: any = 0;

      switch(sortConfig.key) {
        case 'name':
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case 'points':
          valA = statsA?.points || 0;
          valB = statsB?.points || 0;
          break;
        case 'kd':
          valA = statsA ? (statsA.deaths === 0 ? statsA.kills : statsA.kills / statsA.deaths) : 0;
          valB = statsB ? (statsB.deaths === 0 ? statsB.kills : statsB.kills / statsB.deaths) : 0;
          break;
        case 'hsPct':
          valA = statsA ? (statsA.kills === 0 ? 0 : statsA.headshots / statsA.kills) : 0;
          valB = statsB ? (statsB.kills === 0 ? 0 : statsB.headshots / statsB.kills) : 0;
          break;
        default:
          valA = (statsA as any)?.[sortConfig.key] || 0;
          valB = (statsB as any)?.[sortConfig.key] || 0;
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, data.playerSummary, sortConfig]);

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr className="bg-slate-950/50 border-b border-slate-800">
              <SortHeader label="Player" sortKey="name" current={sortConfig} onSort={handleSort} className="px-6" />
              <th className="px-3 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Classes</th>
              <SortHeader label="Score" sortKey="points" current={sortConfig} onSort={handleSort} center />
              <SortHeader label="K" sortKey="kills" current={sortConfig} onSort={handleSort} center />
              <SortHeader label="A" sortKey="assists" current={sortConfig} onSort={handleSort} center />
              <SortHeader label="D" sortKey="deaths" current={sortConfig} onSort={handleSort} center />
              <SortHeader label="K/D" sortKey="kd" current={sortConfig} onSort={handleSort} center />
              <SortHeader label="DMG" sortKey="damage_dealt" current={sortConfig} onSort={handleSort} right />
              <SortHeader label="HEAL" sortKey="healing" current={sortConfig} onSort={handleSort} center />
              <SortHeader label="CAP" sortKey="captures" current={sortConfig} onSort={handleSort} center />
              <SortHeader label="DEF" sortKey="defenses" current={sortConfig} onSort={handleSort} center />
              <SortHeader label="HS" sortKey="headshots" current={sortConfig} onSort={handleSort} center />
              <SortHeader label="HS%" sortKey="hsPct" current={sortConfig} onSort={handleSort} center />
              <SortHeader label="UB" sortKey="ubercharges" current={sortConfig} onSort={handleSort} center />
              <SortHeader label="BS" sortKey="backstabs" current={sortConfig} onSort={handleSort} center />
              <SortHeader label="BD" sortKey="buildings_destroyed" current={sortConfig} onSort={handleSort} center />
              <SortHeader label="SUP" sortKey="support" current={sortConfig} onSort={handleSort} center />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {sortedUsers.map((user) => {
              const stats = data.playerSummary?.player_summaries[user.userId.toString()];
              const kd = stats ? (stats.deaths === 0 ? stats.kills.toFixed(1) : (stats.kills / stats.deaths).toFixed(2)) : '-';
              const hsPct = stats ? (stats.kills === 0 ? 0 : Math.round((stats.headshots / stats.kills) * 100)) : 0;

              return (
                <tr key={user.userId} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4 min-w-[200px]">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn(
                          "font-bold text-sm",
                          user.team === 'red' ? "text-red-400" : user.team === 'blue' ? "text-blue-400" : "text-slate-400"
                        )}>
                          {user.name}
                        </span>
                        <a
                          href={`https://steamcommunity.com/profiles/${user.steamId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-700 hover:text-orange-500 transition-colors"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                      <span className="text-[10px] font-mono text-slate-600 tabular-nums">{user.steamId}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center justify-center gap-1 flex-wrap max-w-[100px] mx-auto">
                      {Object.entries(user.classes)
                        .sort((a, b) => b[1] - a[1])
                        .map(([classId, count]) => (
                          count > 0 && (
                            <img
                              key={classId}
                              src={getClassIcon(parseInt(classId), user.team)}
                              className="w-5 h-5 drop-shadow-md"
                              alt={getClassName(parseInt(classId))}
                              title={`${getClassName(parseInt(classId))}: ${count}`}
                            />
                          )
                        ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center font-bold text-orange-500 tabular-nums text-sm">{stats?.points ?? '-'}</td>
                  <td className="px-2 py-4 text-center text-slate-200 tabular-nums text-sm">{stats?.kills ?? '-'}</td>
                  <td className="px-2 py-4 text-center text-slate-500 tabular-nums text-sm">{stats?.assists ?? '-'}</td>
                  <td className="px-2 py-4 text-center text-slate-600 tabular-nums text-sm">{stats?.deaths ?? '-'}</td>
                  <td className="px-2 py-4 text-center tabular-nums text-[11px] font-mono font-bold text-slate-400">{kd}</td>
                  <td className="px-4 py-4 text-right text-slate-300 tabular-nums font-mono text-sm">{stats?.damage_dealt.toLocaleString() ?? '-'}</td>
                  <td className="px-2 py-4 text-center text-green-700/60 tabular-nums text-xs font-bold">{stats?.healing ? stats.healing.toLocaleString() : '-'}</td>
                  <td className="px-2 py-4 text-center text-slate-400 tabular-nums text-sm">{stats?.captures || '-'}</td>
                  <td className="px-2 py-4 text-center text-slate-400 tabular-nums text-sm">{stats?.defenses || '-'}</td>
                  <td className="px-2 py-4 text-center text-slate-400 tabular-nums text-sm">{stats?.headshots || '-'}</td>
                  <td className="px-2 py-4 text-center text-orange-600/60 tabular-nums font-bold text-[11px]">{hsPct > 0 ? `${hsPct}%` : '-'}</td>
                  <td className="px-2 py-4 text-center text-blue-500/70 tabular-nums text-sm">{stats?.ubercharges || '-'}</td>
                  <td className="px-2 py-4 text-center text-purple-600/60 tabular-nums text-sm">{stats?.backstabs || '-'}</td>
                  <td className="px-2 py-4 text-center text-slate-500 tabular-nums text-sm">{stats?.buildings_destroyed || '-'}</td>
                  <td className="px-2 py-4 text-center text-slate-600 tabular-nums text-xs">{stats?.support || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortHeader({ label, sortKey, current, onSort, className, center, right }: { label: string, sortKey: Exclude<SortConfig, null>['key'], current: SortConfig, onSort: (k: any) => void, className?: string, center?: boolean, right?: boolean }) {
  const active = current?.key === sortKey;
  return (
    <th
      className={cn(
        "py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 cursor-pointer hover:text-slate-300 transition-colors group",
        center && "text-center",
        right && "text-right",
        className
      )}
      onClick={() => onSort(sortKey)}
    >
      <div className={cn("flex items-center gap-1", center && "justify-center", right && "justify-end")}>
        {label}
        {active ? (
          current.direction === 'desc' ? <ChevronDown size={12} className="text-orange-500" /> : <ChevronUp size={12} className="text-orange-500" />
        ) : (
          <ArrowUpDown size={10} className="opacity-0 group-hover:opacity-30 transition-opacity" />
        )}
      </div>
    </th>
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
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden text-sm shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/30 border-b border-slate-800">
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Time</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Killer</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Action</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Victim</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Weapon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {displayedDeaths.map((death, i) => {
                const killer = data.users[death.killer] || { name: 'Unknown', team: 'other' };
                const victim = data.users[death.victim] || { name: 'Unknown', team: 'other' };
                const time = formatTick(death.tick, data.intervalPerTick);

                return (
                  <tr key={i} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="px-8 py-3.5 font-mono text-slate-600 font-medium tabular-nums text-xs">{time}</td>
                    <td className="px-8 py-3.5 text-right">
                      <span className={cn(
                        "font-bold",
                        killer.team === 'red' ? "text-red-400" : killer.team === 'blue' ? "text-blue-400" : "text-slate-400"
                      )}>
                        {killer.name}
                      </span>
                    </td>
                    <td className="px-8 py-3.5 text-center">
                      <ChevronRight className="inline-block text-slate-800 group-hover:translate-x-1 transition-transform" size={14} />
                    </td>
                    <td className="px-8 py-3.5">
                      <span className={cn(
                        "font-bold",
                        victim.team === 'red' ? "text-red-400" : victim.team === 'blue' ? "text-blue-400" : "text-slate-400"
                      )}>
                        {victim.name}
                      </span>
                    </td>
                    <td className="px-8 py-3.5">
                      <span className="text-[10px] bg-slate-950/80 text-slate-500 px-2.5 py-1 rounded-md border border-slate-800 font-mono">
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

      <div className="flex items-center justify-between px-4">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          {page * ITEMS_PER_PAGE + 1} - {Math.min((page + 1) * ITEMS_PER_PAGE, data.deaths.length)} / {data.deaths.length}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 disabled:opacity-20 hover:text-white transition-colors shadow-lg"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center px-4 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-300">
            {page + 1} / {totalPages}
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 disabled:opacity-20 hover:text-white transition-colors shadow-lg"
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
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      <div className="px-8 py-5 border-b border-slate-800 bg-slate-950/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="text-orange-500" size={18} />
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Communication Terminal</h2>
        </div>
        <span className="text-[9px] font-bold text-slate-600 bg-slate-850 px-2.5 py-1 rounded border border-slate-800">{data.chat.length} SIGNALS</span>
      </div>
      <div className="p-6 font-mono text-xs leading-loose space-y-0.5 bg-black/10">
        {data.chat.map((msg, i) => {
          const team = getTeamByName(msg.from);
          return (
            <div key={i} className="flex gap-6 group hover:bg-slate-800/10 rounded px-2 -mx-2 transition-colors">
              <span className="text-[10px] text-slate-700 w-12 tabular-nums group-hover:text-slate-500 transition-colors shrink-0">
                {formatTick(msg.tick, data.intervalPerTick)}
              </span>
              <p className="break-words">
                <span className={cn(
                  "font-bold",
                  team === 'red' ? "text-red-400" : team === 'blue' ? "text-blue-400" : "text-slate-500"
                )}>
                  {msg.from}
                </span>
                {msg.kind === 'TF_Chat_Team' && <span className="text-slate-600 ml-1.5 text-[9px] font-bold uppercase">(TEAM)</span>}
                <span className="text-slate-700 font-bold mx-1 opacity-50">:</span>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {data.rounds.map((round, i) => (
        <div key={i} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col group shadow-lg">
          <div className={cn(
            "h-1",
            round.winner === 'red' ? "bg-red-500" : "bg-blue-500"
          )} />
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-orange-500 border border-slate-800">
                  <Trophy size={22} />
                </div>
                <h3 className="font-bold text-lg tracking-tight uppercase">Round {i + 1}</h3>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800/50">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Victor</span>
                <span className={cn(
                  "font-bold capitalize",
                  round.winner === 'red' ? "text-red-400" : "text-blue-400"
                )}>{round.winner}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Time</span>
                <span className="text-slate-300 font-mono tracking-tight">{Math.floor(round.length / 60)}m {Math.floor(round.length % 60)}s</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Terminal tick</span>
                <span className="text-slate-400 font-mono tracking-tight">{round.end_tick.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function getClassName(id: number): string {
  const classes = ['Scout', 'Soldier', 'Pyro', 'Demoman', 'Heavy', 'Engineer', 'Medic', 'Sniper', 'Spy', 'Other'];
  return classes[id] || 'Other';
}

function getClassIcon(id: number, team: 'red' | 'blue' | 'other'): string {
  if (team === 'other') return '/logo.png';
  const classNames = ['scout', 'soldier', 'pyro', 'demoman', 'heavy', 'engineer', 'medic', 'sniper', 'spy'];
  const name = classNames[id] || 'scout';
  const teamName = team === 'blue' ? 'Blu' : 'Red';
  return `/icons/classes/${name}${teamName}.png`;
}

function formatTick(tick: number, interval?: number): string {
  if (!interval) return tick.toString();
  const totalSeconds = tick * interval;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
