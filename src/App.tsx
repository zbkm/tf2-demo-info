import React, { useState, useCallback } from 'react';
import { Upload, FileText, Users, MessageSquare, Crosshair, Map as MapIcon, Clock, ChevronRight } from 'lucide-react';
import { useDemoParser } from './hooks/useDemoParser';
import type { DemoData } from './types/demo';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const { data, loading, error, parseDemo, reset } = useDemoParser();
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'chat' | 'kills'>('overview');

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
      {/* Header */}
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
        {/* Navigation */}
        <div className="flex gap-2 p-1 bg-slate-900 rounded-xl mb-8 w-fit border border-slate-800">
          {[
            { id: 'overview', icon: FileText, label: 'Overview' },
            { id: 'players', icon: Users, label: 'Players' },
            { id: 'kills', icon: Crosshair, label: 'Killfeed' },
            { id: 'chat', icon: MessageSquare, label: 'Chat' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
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

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {activeTab === 'overview' && <Overview data={data} />}
          {activeTab === 'players' && <Players data={data} />}
          {activeTab === 'kills' && <Killfeed data={data} />}
          {activeTab === 'chat' && <Chat data={data} />}
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

      <div className="md:col-span-2 lg:col-span-4 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-lg">Server Info</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
          <InfoRow label="Server Name" value={data.header.server} />
          <InfoRow label="Protocol" value={data.header.protocol.toString()} />
          <InfoRow label="Recorder" value={data.header.nick} />
          <InfoRow label="Game" value={data.header.game} />
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {users.sort((a, b) => a.team.localeCompare(b.team)).map((user) => (
        <div key={user.userId} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
          <div className={cn(
            "h-2",
            user.team === 'red' ? "bg-red-500" : user.team === 'blue' ? "bg-blue-500" : "bg-slate-500"
          )} />
          <div className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{user.name}</h3>
                <p className="text-xs font-mono text-slate-500">{user.steamId}</p>
              </div>
              <span className={cn(
                "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                user.team === 'red' ? "bg-red-500/10 text-red-500" : user.team === 'blue' ? "bg-blue-500/10 text-blue-500" : "bg-slate-800 text-slate-400"
              )}>
                {user.team}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.entries(user.classes).map(([classId, count]) => (
                count > 0 && (
                  <div key={classId} className="bg-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-slate-700/50">
                    <span className="text-xs font-medium text-slate-300">{getClassName(parseInt(classId))}</span>
                    <span className="text-xs font-bold text-orange-500">{count}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Killfeed({ data }: { data: DemoData }) {
  return (
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
            {data.deaths.slice(0, 100).map((death, i) => {
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
                    <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700 font-mono">
                      {death.weapon}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {data.deaths.length > 100 && (
        <div className="p-4 text-center border-t border-slate-800 text-slate-500 text-sm italic">
          Showing first 100 of {data.deaths.length} events
        </div>
      )}
    </div>
  );
}

function Chat({ data }: { data: DemoData }) {
  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col gap-4 max-w-4xl mx-auto shadow-2xl">
      <div className="flex items-center gap-3 mb-4 text-slate-400 border-b border-slate-800 pb-4">
        <MessageSquare size={20} />
        <h2 className="font-bold">Chat Log</h2>
        <span className="ml-auto text-xs font-medium tabular-nums px-2 py-1 bg-slate-800 rounded">{data.chat.length} messages</span>
      </div>
      <div className="space-y-4">
        {data.chat.map((msg, i) => (
          <div key={i} className="flex gap-4 items-start group">
            <span className="text-[10px] font-mono text-slate-600 mt-1 first-letter:tabular-nums w-12 shrink-0">
              {formatTick(msg.tick, data.intervalPerTick)}
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-slate-300">{msg.from}</span>
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{msg.kind.replace('TF_Chat_', '')}</span>
              </div>
              <p className="bg-slate-800/80 px-4 py-2 rounded-2xl rounded-tl-none border border-slate-700/50 text-slate-200 text-sm max-w-lg group-hover:border-slate-500/30 transition-colors">
                {msg.text}
              </p>
            </div>
          </div>
        ))}
      </div>
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
