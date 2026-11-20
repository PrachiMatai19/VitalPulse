import React, { useState } from 'react';
import { ShieldCheck, Search, Clock, Building2, User, FileText } from 'lucide-react';
import { AccessLog } from '../../types';

interface AccessLogsTableProps {
  logs: AccessLog[];
}

export const AccessLogsTable: React.FC<AccessLogsTableProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(
    (log) =>
      log.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.requestId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Donor Privacy & Access Audit Logs
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic access logs (Section 6 & 7): records which verified hospital unlocked and viewed a matched donor's contact information.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search hospital or donor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Table */}
      {filteredLogs.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-xs">
          No access logs matching your filter criteria.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Hospital (Viewer)</th>
                <th className="px-5 py-3">Donor Accessed</th>
                <th className="px-5 py-3">Associated Request</th>
                <th className="px-5 py-3 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.map((log) => {
                const date = new Date(log.viewedAt);
                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{date.toLocaleDateString()} {date.toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-red-500" />
                        <span className="font-bold text-slate-900">{log.hospitalName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {log.hospitalId}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-bold text-slate-900">{log.donorName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {log.donorId}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-[11px]">
                        {log.requestId}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Verified Legitimate
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
