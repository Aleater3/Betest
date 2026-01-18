
import React, { useState, useCallback } from 'react';
import { AuditStage, AuditResult } from './types';
import { QUESTIONS, B12_PAYMENT_URL } from './constants';

const NOTION_LINK = "https://www.notion.so/SCALE-PROTOCOL-FORENSIC-DIAGNOSIS-1315099dddd54db1babf54fb71180417?source=copy_link";
const ZOHO_WEBHOOK_URL = "https://flow.zoho.com/your_org/webhook/scale_protocol_sync";

const App: React.FC = () => {
  const [stage, setStage] = useState<AuditStage>(AuditStage.INTRO);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<AuditResult | null>(null);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAdminVault, setShowAdminVault] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);

  const saveLeadLocally = useCallback((finalResult: AuditResult) => {
    try {
      const existingLeads = JSON.parse(localStorage.getItem('b12_audit_leads') || '[]');
      const newLead = {
        email,
        score: finalResult.percentage,
        tier: finalResult.tier,
        timestamp: new Date().toLocaleString(),
      };
      const updatedLeads = [newLead, ...existingLeads].slice(0, 100); // Keep last 100
      localStorage.setItem('b12_audit_leads', JSON.stringify(updatedLeads));
      console.log("Lead persisted locally.");
    } catch (e) {
      console.error("Local storage failure:", e);
    }
  }, [email]);

  const syncWithZoho = useCallback(async (finalResult: AuditResult) => {
    setIsSyncing(true);
    // Persist to local storage immediately
    saveLeadLocally(finalResult);
    
    try {
      await fetch(ZOHO_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          execution_iq: finalResult.percentage,
          tier: finalResult.tier,
          timestamp: new Date().toISOString()
        })
      });
    } catch (e) {
      console.error("Cloud sync interrupted, local copy preserved.");
    } finally {
      setIsSyncing(false);
    }
  }, [email, saveLeadLocally]);

  const calculateResult = useCallback(() => {
    const total = scores.reduce((a, b) => a + b, 0);
    const percentage = Math.round((total / (QUESTIONS.length * 10)) * 100);
    
    let tier, color, description;
    if (percentage <= 40) {
      tier = "STRUCTURAL COLLAPSE"; color = "text-red-500";
      description = "Your business is failing because you are addicted to starting. High idea volume, zero completion velocity.";
    } else if (percentage <= 75) {
      tier = "THE GROWTH TRAP"; color = "text-yellow-500";
      description = "You have motion, but zero momentum. You are the bottleneck. Working harder is no longer producing revenue.";
    } else {
      tier = "ELITE OPTIMIZATION"; color = "text-green-500";
      description = "Your systems are sound. You don't need coaching; you need leverage. To go higher, move from operator to owner.";
    }

    const res = { percentage, tier, color, dossierTitle: "SCALE PROTOCOL", description };
    setResult(res);
    return res;
  }, [scores]);

  const handleNext = () => {
    if (selectedScore !== null) {
      setScores(prev => [...prev, selectedScore]);
      setSelectedScore(null);
      if (currentIndex < QUESTIONS.length - 1) setCurrentIndex(prev => prev + 1);
      else setStage(AuditStage.CAPTURE);
    }
  };

  const handleUnlock = () => {
    if (!email.includes('@')) return alert("Valid corporate email required.");
    setStage(AuditStage.CALCULATING);
    const res = calculateResult();
    syncWithZoho(res);
    setTimeout(() => setStage(AuditStage.RESULT), 2500);
  };

  const handleAdminTrigger = () => {
    setAdminClickCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setShowAdminVault(true);
        return 0;
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-black selection:bg-[#D4AF37] selection:text-black">
      <header className="w-full p-6 flex justify-between items-center max-w-2xl">
        <div className="text-xl font-bold mono uppercase italic text-white">BE <span className="text-[#D4AF37]">EXTRAORDINARY</span></div>
        <div 
          onClick={handleAdminTrigger} 
          className="text-[9px] text-gray-700 mono cursor-pointer hover:text-gray-500 uppercase tracking-widest text-right select-none"
        >
          B12_SYS.AUDIT_V6.1<br/>{isSyncing ? "VAULTING_DATA..." : "SYSTEM_ACTIVE"}
        </div>
      </header>

      <main className="w-full max-w-2xl bg-[#0a0a0a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden relative flex flex-col min-h-[600px]">
        {stage === AuditStage.INTRO && (
          <div className="flex-1 flex flex-col justify-center items-center p-8 text-center animate-slide-up">
            <div className="mb-4 px-3 py-1 border border-gray-800 rounded-full text-[9px] mono text-gray-500 font-bold uppercase tracking-[0.3em]">Institutional Grade Audit</div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 text-white leading-none tracking-tighter">THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-600">EXECUTION</span> GAP</h1>
            <p className="text-gray-400 mb-10 max-w-sm italic font-light text-sm">Quantify the distance between your ambition and your reality.</p>
            <button onClick={() => setStage(AuditStage.QUIZ)} className="w-full max-w-xs py-4 bg-[#D4AF37] hover:bg-white text-black font-black rounded uppercase tracking-widest transition-all duration-300">Start Extraction</button>
          </div>
        )}

        {stage === AuditStage.QUIZ && (
          <div className="flex-1 flex flex-col p-8">
            <div className="w-full h-1 bg-gray-900 absolute top-0 left-0"><div className="h-full bg-[#D4AF37] transition-all duration-500" style={{ width: `${(currentIndex / QUESTIONS.length) * 100}%` }}></div></div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="mb-4 text-[#D4AF37] text-[10px] mono font-bold uppercase tracking-widest">Pillar: {QUESTIONS[currentIndex].pillar}</div>
              <h2 className="text-2xl font-bold mb-8 text-white tracking-tight leading-tight">{QUESTIONS[currentIndex].text}</h2>
              <div className="space-y-3">
                {QUESTIONS[currentIndex].options.map((o, i) => (
                  <button key={i} onClick={() => setSelectedScore(o.score)} className={`w-full text-left p-5 border rounded-xl transition-all ${selectedScore === o.score ? 'border-[#D4AF37] bg-[#D4AF37]/5 ring-1 ring-[#D4AF37]' : 'border-gray-800 bg-gray-900/30 hover:border-gray-600'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded-full border ${selectedScore === o.score ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-gray-600'}`}></div>
                      <span className="text-gray-300 font-medium text-sm">{o.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-900">
              <span className="text-gray-600 mono text-xs">{currentIndex + 1} OF {QUESTIONS.length}</span>
              <button onClick={handleNext} disabled={selectedScore === null} className="px-8 py-3 bg-white text-black font-black rounded uppercase text-[10px] tracking-widest disabled:opacity-20 transition-all">Continue →</button>
            </div>
          </div>
        )}

        {stage === AuditStage.CAPTURE && (
          <div className="flex-1 flex flex-col justify-center items-center p-12 text-center animate-fadeIn">
            <div className="w-20 h-20 border-2 border-[#D4AF37] rounded-full flex items-center justify-center mb-8 animate-pulse shadow-2xl shadow-yellow-900/20">
              <svg className="w-10 h-10 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h2 className="text-3xl font-black mb-4 uppercase italic text-white">Audit Complete</h2>
            <p className="text-gray-500 mb-8 max-w-sm text-sm">The Forensic Protocol is ready. Identification required for cloud-vault access.</p>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="founder@corporate.com" className="w-full max-w-xs bg-black border border-gray-800 text-white p-5 rounded-xl mb-4 focus:border-[#D4AF37] outline-none transition-all" />
            <button onClick={handleUnlock} className="w-full max-w-xs py-5 bg-white text-black font-black rounded-xl uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl">Unlock Diagnosis</button>
          </div>
        )}

        {stage === AuditStage.CALCULATING && (
          <div className="flex-1 flex flex-col justify-center items-center p-8 bg-black">
            <div className="mono text-[#D4AF37] text-xl mb-6 animate-blink uppercase font-black">Encrypting Data...</div>
            <div className="w-64 h-1 bg-gray-900 rounded-full overflow-hidden">
              <div className="h-full bg-[#D4AF37] animate-[progressBar_2.5s_ease-in-out_forwards]" style={{ width: '0%' }}></div>
            </div>
          </div>
        )}

        {stage === AuditStage.RESULT && result && (
          <div className="flex-1 flex flex-col bg-black animate-fadeIn overflow-y-auto">
            <div className="p-10 border-b border-gray-900 text-center bg-gray-900/10">
              <div className="mono text-gray-600 text-[10px] mb-2 uppercase tracking-widest">Execution IQ Result</div>
              <div className="text-8xl font-black italic text-white mb-2 leading-none">{result.percentage}%</div>
              <div className={`text-xl font-bold mono uppercase ${result.color} tracking-tighter`}>{result.tier}</div>
            </div>
            <div className="p-10 space-y-8">
              <div>
                <h3 className="mono text-[#D4AF37] text-[10px] font-bold mb-3 uppercase tracking-widest">Forensic Extraction</h3>
                <p className="text-gray-300 text-base italic leading-relaxed">{result.description}</p>
              </div>
              
              <div className="bg-gray-900/40 p-8 border border-gray-800 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4"><div className="text-[8px] mono text-green-500 bg-green-950/20 px-3 py-1 rounded-full border border-green-900/30 uppercase">Authorized</div></div>
                <h3 className="mono text-white text-[11px] font-black mb-6 uppercase tracking-widest">PROTOCOL ACCESS: 1-PAGE SCALE</h3>
                
                <div className="space-y-4">
                  <a 
                    href={NOTION_LINK} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center gap-3 w-full py-6 bg-white hover:bg-gray-100 text-black font-black rounded-xl uppercase tracking-widest text-xs transition-all shadow-xl hover:translate-y-[-2px] active:translate-y-[0px]"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4.662 4.414c.212-.132.483-.162.72-.08l13.52 4.545c.34.114.54.48.45.82-.09.34-.456.54-.796.426L5.036 5.58l-.374 13.974 14.282-4.81c.34-.114.706.086.796.426.09.34-.11.706-.45.82l-15.54 5.234a.715.715 0 01-.73-.08.71.71 0 01-.25-.664l.512-19.062c.01-.334.21-.634.5-.766z"/></svg>
                    View Your Scale Protocol
                  </a>

                  <div className="relative py-4 flex items-center gap-4">
                    <div className="flex-1 h-px bg-gray-800"></div>
                    <span className="mono text-[8px] text-gray-700 uppercase tracking-widest font-bold">B12 Secure Gateway</span>
                    <div className="flex-1 h-px bg-gray-800"></div>
                  </div>

                  <a 
                    href={B12_PAYMENT_URL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full py-5 bg-[#D4AF37] hover:bg-[#c4a132] text-black font-black rounded-xl uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-yellow-900/10 hover:translate-y-[-2px] active:translate-y-[0px]"
                  >
                    Authorize Full Forensic Diagnosis
                  </a>
                </div>
                <p className="mt-8 text-[8px] text-gray-700 text-center mono uppercase tracking-[0.4em]">Direct B12 Connection Verified</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {showAdminVault && (
        <div className="fixed inset-0 z-50 bg-black/95 p-6 md:p-12 overflow-y-auto animate-fadeIn backdrop-blur-md">
          <div className="max-w-4xl mx-auto mono text-green-500 text-xs">
            <div className="flex justify-between items-end mb-12 border-b border-green-900 pb-4">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">B12_LEAD_VAULT</h2>
                <div className="text-[10px] opacity-50">INTERNAL STORAGE // {JSON.parse(localStorage.getItem('b12_audit_leads') || '[]').length} RECORDS</div>
              </div>
              <button 
                onClick={() => setShowAdminVault(false)} 
                className="px-6 py-2 border border-green-500 hover:bg-green-500 hover:text-black transition-all font-bold"
              >
                TERMINAL_EXIT
              </button>
            </div>
            <div className="space-y-4">
              {JSON.parse(localStorage.getItem('b12_audit_leads') || '[]').map((l: any, i: number) => (
                <div key={i} className="flex flex-col md:flex-row gap-4 md:gap-8 p-4 border border-green-900/30 hover:bg-green-950/10 transition-colors">
                  <span className="opacity-30">[{i}]</span>
                  <span className="w-48 opacity-50">{l.timestamp}</span>
                  <span className="flex-1 text-white font-bold">{l.email}</span>
                  <div className="flex gap-4 items-center">
                    <span className="w-12 text-right">{l.score}%</span>
                    <span className="italic opacity-60 text-right text-[10px]">{l.tier}</span>
                  </div>
                </div>
              ))}
              {JSON.parse(localStorage.getItem('b12_audit_leads') || '[]').length === 0 && (
                <div className="text-center py-20 opacity-20">NO LOCAL RECORDS FOUND</div>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="mt-10 text-gray-800 text-[9px] mono uppercase tracking-[0.5em] font-bold">
        Secure Extraction Active • Extraordinarily Built
      </footer>

      <style>{`
        @keyframes progressBar { 
          from { width: 0%; } 
          to { width: 100%; } 
        }
      `}</style>
    </div>
  );
};

export default App;
