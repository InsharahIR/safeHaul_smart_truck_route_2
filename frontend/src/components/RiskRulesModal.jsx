import React from 'react';
import { X, ShieldAlert, Scale, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function RiskRulesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        style={{ backgroundColor: '#FFFFFF', borderColor: '#1A1D23' }}
        className="w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div style={{ backgroundColor: '#1A1D23', color: '#FFFFFF' }} className="px-6 py-4 flex items-center justify-between border-b-2 border-[#FFC400]">
          <div className="flex items-center gap-2.5">
            <div style={{ backgroundColor: '#FFC400', color: '#1A1D23' }} className="p-1.5 rounded font-black">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                SafeHaul Risk & Load Rules Specification
              </h3>
              <p style={{ color: '#9CA3AF' }} className="text-xs">
                Official Full-Stack Development Challenge Thresholds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-[#374151] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#1A1D23]">
          {/* Section 1: Weather Thresholds Table */}
          <div>
            <h4 style={{ color: '#1A1D23' }} className="text-sm font-bold mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4B6F94]"></span>
              Weather Condition Thresholds
            </h4>
            <div className="overflow-x-auto border border-[#E5E7EB] rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ backgroundColor: '#F3F4F6', color: '#1A1D23' }} className="font-bold border-b border-[#E5E7EB]">
                    <th className="p-2.5">Condition</th>
                    <th className="p-2.5 text-[#166534]">Low</th>
                    <th className="p-2.5 text-[#92400E]">Moderate</th>
                    <th className="p-2.5 text-[#9A3412]">High</th>
                    <th className="p-2.5 text-[#991B1B]">Severe</th>
                    <th className="p-2.5 text-[#7F1D1D]">No Travel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] font-mono">
                  <tr>
                    <td className="p-2.5 font-sans font-bold">💨 Wind</td>
                    <td className="p-2.5">&lt; 25 mph</td>
                    <td className="p-2.5">25–34 mph</td>
                    <td className="p-2.5">35–44 mph</td>
                    <td className="p-2.5">45–54 mph</td>
                    <td className="p-2.5 font-bold text-[#7F1D1D]">≥ 55 mph</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans font-bold">🌧️ Rain</td>
                    <td className="p-2.5">&lt; 0.10 in/hr</td>
                    <td className="p-2.5">0.10–0.25 in/hr</td>
                    <td className="p-2.5">0.25–0.50 in/hr</td>
                    <td className="p-2.5">0.50–1.00 in/hr</td>
                    <td className="p-2.5 font-bold text-[#7F1D1D]">&gt; 1.00 in/hr</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans font-bold">❄️ Snow</td>
                    <td className="p-2.5">&lt; 0.5 in/hr</td>
                    <td className="p-2.5">0.5–1.0 in/hr</td>
                    <td className="p-2.5">1.0–2.0 in/hr</td>
                    <td className="p-2.5">2.0–3.0 in/hr</td>
                    <td className="p-2.5 font-bold text-[#7F1D1D]">&gt; 3.0 in/hr</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Load Rules */}
          <div>
            <h4 style={{ color: '#1A1D23' }} className="text-sm font-bold mb-2 flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#FFC400]" />
              Truck Load Weight Escalation Rules
            </h4>
            <div style={{ backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }} className="p-3.5 rounded-lg border text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertOctagon className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#92400E]">≥ 55 mph wind</strong>
                  <span className="text-[#78350F]"> → Mandatory <strong>No Travel</strong> for any load weight.</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertOctagon className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#92400E]">45–54 mph wind + &gt;30,000 lb</strong>
                  <span className="text-[#78350F]"> → Escalates to <strong>No Travel</strong> (Truck rollover risk).</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertOctagon className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#92400E]">35–44 mph wind + &gt;40,000 lb</strong>
                  <span className="text-[#78350F]"> → Escalates from High to <strong>Severe</strong>.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Route Recommendation Preferences */}
          <div>
            <h4 style={{ color: '#1A1D23' }} className="text-sm font-bold mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              Route Recommendation Hierarchy (PDF Preference)
            </h4>
            <ol className="list-decimal list-inside space-y-1 bg-[#F9FAFB] p-3 rounded-lg border border-[#E5E7EB] font-medium text-[#4B5563]">
              <li><strong className="text-[#1A1D23]">1. Fewest Severe miles</strong> (includes No Travel segments)</li>
              <li><strong className="text-[#1A1D23]">2. Fewest High miles</strong></li>
              <li><strong className="text-[#1A1D23]">3. Lowest average risk</strong> across all route checkpoints</li>
              <li><strong className="text-[#1A1D23]">4. Shortest travel times</strong> (tie-breaker)</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div style={{ backgroundColor: '#F3F4F6' }} className="px-6 py-3 border-t border-[#E5E7EB] flex justify-end">
          <button
            onClick={onClose}
            style={{ backgroundColor: '#1A1D23', color: '#FFC400' }}
            className="px-4 py-1.5 rounded-lg font-bold text-xs hover:opacity-90 transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
