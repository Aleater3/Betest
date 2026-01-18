import React, { useState, useCallback, useEffect } from 'react';
import { AuditStage, AuditResult } from './types';
import { QUESTIONS, B12_PAYMENT_URL } from './constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { 
  ChevronRight, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  ExternalLink,
  Zap,
  Activity,
  Award
} from 'lucide-react';

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
      const updatedLeads = [newLead, ...existingLeads].slice(0, 100);
      localStorage.setItem('b12_audit_leads', JSON.stringify(updatedLeads));
    } catch (e) {
      console.error("Local storage failure:", e);
    }
  }, [email]);

  const syncWithZoho = useCallback(async (finalResult: AuditResult) => {
    setIsSyncing(true);
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
      tier = "STRUCTURAL COLLAPSE"; 
      color = "text-red-500";
      description = "Your business is currently in a state of high friction. You have high idea volume but zero completion velocity. You are addicted to starting, but allergic to finishing.";
    } else if (percentage <= 75) {
      tier = "THE GROWTH TRAP"; 
      color = "text-primary";
      description = "You have motion, but zero momentum. You have become the primary bottleneck in your own company. Working harder is no longer producing revenue—it's just creating more work.";
    } else {
      tier = "ELITE OPTIMIZATION"; 
      color = "text-primary";
      description = "Your systems are sound, but your leverage is low. To go higher, you must move from operator to owner. You don't need coaching; you need institutional-grade systems.";
    }

    const res = { percentage, tier, color, dossierTitle: "SCALE PROTOCOL", description };
    setResult(res);
    return res;
  }, [scores]);

  const handleNext = () => {
    if (selectedScore !== null) {
      setScores(prev => [...prev, selectedScore]);
      setSelectedScore(null);
      if (currentIndex < QUESTIONS.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setStage(AuditStage.CAPTURE);
      }
    }
  };

  const handleUnlock = () => {
    if (!email.includes('@')) {
      toast.error("Valid corporate email required.");
      return;
    }
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
    <div className="min-h-screen flex flex-col items-center bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-sans overflow-x-hidden">
      <header className="w-full p-6 flex justify-between items-center max-w-3xl mx-auto">
        <div className="text-xl font-bold uppercase italic tracking-tighter">
          BE <span className="text-primary underline decoration-primary/30 underline-offset-4">EXTRAORDINARY</span>
        </div>
        <div 
          onClick={handleAdminTrigger} 
          className="text-[9px] text-muted-foreground mono cursor-pointer hover:text-primary uppercase tracking-widest text-right select-none transition-colors"
        >
          B12_SYS.AUDIT_V6.1<br/>{isSyncing ? "VAULTING_DATA..." : "SYSTEM_ACTIVE"}
        </div>
      </header>

      <main className="w-full max-w-2xl px-4 py-8 flex-1 flex flex-col justify-center">
        <Card className="border-border bg-card shadow-2xl overflow-hidden relative flex flex-col min-h-[550px]">
          {stage === AuditStage.INTRO && (
            <div className="flex-1 flex flex-col justify-center items-center p-10 text-center animate-slide-up">
              <Badge variant="outline" className="mb-6 px-4 py-1.5 mono text-[10px] text-primary border-primary/20 font-bold uppercase tracking-[0.3em] bg-primary/5">
                Institutional Grade Audit
              </Badge>
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-none tracking-tighter">
                THE <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">EXECUTION</span> GAP
              </h1>
              <p className="text-muted-foreground mb-12 max-w-sm italic font-light text-base leading-relaxed">
                Quantify the distance between your ambition and your reality.
              </p>
              <Button 
                onClick={() => setStage(AuditStage.QUIZ)} 
                size="lg"
                className="w-full max-w-xs h-14 bg-primary hover:bg-white text-primary-foreground hover:text-black font-black rounded-none uppercase tracking-widest transition-all duration-300 shadow-xl shadow-primary/20"
              >
                Start Extraction
              </Button>
            </div>
          )}

          {stage === AuditStage.QUIZ && (
            <div className="flex-1 flex flex-col p-8 md:p-12">
              <div className="w-full h-1 bg-secondary absolute top-0 left-0">
                <div 
                  className="h-full bg-primary transition-all duration-700 ease-in-out" 
                  style={{ width: `${(currentIndex / QUESTIONS.length) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex-1 flex flex-col justify-center">
                <div className="mb-4 flex items-center gap-2">
                  <Activity className="w-3 h-3 text-primary" />
                  <span className="text-primary text-[10px] mono font-bold uppercase tracking-widest">
                    Pillar: {QUESTIONS[currentIndex].pillar}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-10 text-white tracking-tight leading-tight">
                  {QUESTIONS[currentIndex].text}
                </h2>
                <div className="space-y-4">
                  {QUESTIONS[currentIndex].options.map((o, i) => (
                    <button 
                      key={i} 
                      onClick={() => setSelectedScore(o.score)} 
                      className={`w-full text-left p-6 border rounded-none transition-all duration-300 group relative overflow-hidden ${
                        selectedScore === o.score 
                          ? 'border-primary bg-primary/10 ring-1 ring-primary' 
                          : 'border-white/10 bg-white/5 hover:border-primary/50 hover:bg-white/10'
                      }`}
                    >
                      {selectedScore === o.score && (
                        <div className="absolute inset-y-0 left-0 w-1 bg-primary animate-pulse" />
                      )}
                      <div className="flex items-center gap-5">
                        <div className={`w-5 h-5 rounded-none border flex items-center justify-center transition-all ${
                          selectedScore === o.score 
                            ? 'bg-primary border-primary shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
                            : 'border-white/30 group-hover:border-primary/50'
                        }`}>
                          {selectedScore === o.score && <div className="w-2 h-2 bg-black" />}
                        </div>
                        <span className={`font-medium text-base transition-colors ${
                          selectedScore === o.score ? 'text-primary' : 'text-white/70 group-hover:text-white'
                        }`}>
                          {o.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mt-12 flex justify-between items-center pt-8 border-t border-border">
                <span className="text-muted-foreground mono text-xs font-bold tracking-widest">
                  {currentIndex + 1} <span className="text-primary/40">/</span> {QUESTIONS.length}
                </span>
                <Button 
                  onClick={handleNext} 
                  disabled={selectedScore === null} 
                  className="px-10 h-12 bg-white text-black hover:bg-primary hover:text-white font-black rounded-none uppercase text-[11px] tracking-widest disabled:opacity-10 transition-all shadow-lg"
                >
                  Continue <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {stage === AuditStage.CAPTURE && (
            <div className="flex-1 flex flex-col justify-center items-center p-12 text-center animate-fade-in">
              <div className="w-24 h-24 border-2 border-primary rounded-full flex items-center justify-center mb-10 animate-pulse shadow-[0_0_50px_rgba(212,175,55,0.15)] bg-primary/5">
                <Lock className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-4xl font-black mb-4 uppercase italic tracking-tighter">Audit Complete</h2>
              <p className="text-muted-foreground mb-10 max-w-sm text-base">
                The Forensic Protocol is ready. Identification required for cloud-vault access.
              </p>
              <div className="w-full max-w-sm space-y-4">
                <Input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="founder@corporate.com" 
                  className="h-16 bg-secondary border-border text-white text-center rounded-none focus-visible:ring-primary focus-visible:border-primary transition-all text-lg" 
                />
                <Button 
                  onClick={handleUnlock} 
                  className="w-full h-16 bg-white text-black hover:bg-primary hover:text-white font-black rounded-none uppercase tracking-widest text-sm transition-all shadow-2xl active:scale-[0.98]"
                >
                  Unlock Diagnosis
                </Button>
              </div>
            </div>
          )}

          {stage === AuditStage.CALCULATING && (
            <div className="flex-1 flex flex-col justify-center items-center p-8 bg-black">
              <div className="flex items-center gap-3 mb-8">
                <Zap className="w-6 h-6 text-primary animate-pulse" />
                <div className="mono text-primary text-2xl uppercase font-black tracking-widest animate-blink">
                  Encrypting Data...
                </div>
              </div>
              <div className="w-72 h-1.5 bg-secondary rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-primary animate-[progressBar_2.5s_ease-in-out_forwards]" style={{ width: '0%' }}></div>
              </div>
              <p className="mt-10 mono text-[10px] text-muted-foreground uppercase tracking-[0.5em]">
                Authenticating Scale Protocol
              </p>
            </div>
          )}

          {stage === AuditStage.RESULT && result && (
            <div className="flex-1 flex flex-col bg-background animate-fade-in overflow-y-auto">
              <div className="p-12 border-b border-border text-center bg-primary/5 relative">
                <div className="absolute top-6 left-6">
                  <Badge variant="outline" className="mono text-[8px] border-primary/20 text-primary/60">REF_ID: {Math.random().toString(36).substring(7).toUpperCase()}</Badge>
                </div>
                <div className="mono text-muted-foreground text-[10px] mb-4 uppercase tracking-[0.4em] font-bold">Execution IQ Result</div>
                <div className="text-[120px] font-black italic text-white mb-2 leading-none tracking-tighter drop-shadow-2xl">
                  {result.percentage}<span className="text-primary text-4xl not-italic ml-2">%</span>
                </div>
                <div className={`text-2xl font-black mono uppercase ${result.color} tracking-tighter flex items-center justify-center gap-3`}>
                  <Award className="w-6 h-6" />
                  {result.tier}
                </div>
              </div>
              
              <div className="p-10 space-y-10">
                <div className="relative pl-6 border-l-2 border-primary/30">
                  <h3 className="mono text-primary text-[11px] font-black mb-4 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3" />
                    Forensic Extraction
                  </h3>
                  <p className="text-muted-foreground text-lg italic leading-relaxed font-light">
                    "{result.description}"
                  </p>
                </div>
                
                <div className="bg-secondary/40 p-10 border border-border rounded-none relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-5">
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px] px-3 py-1">AUTHORIZED_ACCESS</Badge>
                  </div>
                  
                  <h3 className="mono text-white text-[12px] font-black mb-8 uppercase tracking-[0.3em]">
                    PROTOCOL ACCESS: 1-PAGE SCALE
                  </h3>
                  
                  <div className="space-y-6">
                    <Button 
                      asChild
                      className="w-full h-16 bg-white hover:bg-primary text-black hover:text-white font-black rounded-none uppercase tracking-widest text-xs transition-all shadow-xl hover:-translate-y-1 active:translate-y-0"
                    >
                      <a href={NOTION_LINK} target="_blank" rel="noopener noreferrer">
                        View Your Scale Protocol <ExternalLink className="ml-2 w-4 h-4" />
                      </a>
                    </Button>

                    <div className="relative py-4 flex items-center gap-6">
                      <div className="flex-1 h-px bg-border"></div>
                      <span className="mono text-[9px] text-muted-foreground uppercase tracking-[0.5em] font-bold">Secure Gateway</span>
                      <div className="flex-1 h-px bg-border"></div>
                    </div>

                    <Button 
                      asChild
                      variant="outline"
                      className="w-full h-16 border-primary/50 text-primary hover:bg-primary hover:text-black font-black rounded-none uppercase tracking-widest text-[11px] transition-all group"
                    >
                      <a href={B12_PAYMENT_URL} target="_blank" rel="noopener noreferrer">
                        Authorize Full Forensic Diagnosis <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </Button>
                  </div>
                  <p className="mt-10 text-[9px] text-muted-foreground/40 text-center mono uppercase tracking-[0.6em]">
                    Direct B12 Connection Verified
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </main>

      {showAdminVault && (
        <div className="fixed inset-0 z-50 bg-background/98 p-8 md:p-16 overflow-y-auto animate-fade-in backdrop-blur-xl">
          <div className="max-w-5xl mx-auto mono text-primary">
            <div className="flex justify-between items-end mb-16 border-b border-primary/20 pb-8">
              <div>
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-3">B12_LEAD_VAULT</h2>
                <div className="text-[12px] text-muted-foreground tracking-[0.2em]">
                  SECURE ARCHIVE // {JSON.parse(localStorage.getItem('b12_audit_leads') || '[]').length} RECORDS FOUND
                </div>
              </div>
              <Button 
                variant="outline"
                onClick={() => setShowAdminVault(false)} 
                className="px-8 py-6 border-primary text-primary hover:bg-primary hover:text-black font-bold rounded-none"
              >
                TERMINAL_EXIT
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border">
                <div className="col-span-1">ID</div>
                <div className="col-span-3">TIMESTAMP</div>
                <div className="col-span-4">CORPORATE_EMAIL</div>
                <div className="col-span-2 text-right">SCORE</div>
                <div className="col-span-2 text-right">TIER</div>
              </div>
              
              {JSON.parse(localStorage.getItem('b12_audit_leads') || '[]').map((l: any, i: number) => (
                <div key={i} className="grid grid-cols-12 gap-4 px-6 py-6 border border-border/50 hover:bg-secondary/30 transition-colors items-center text-sm">
                  <div className="col-span-1 opacity-40 font-mono">#{i}</div>
                  <div className="col-span-3 opacity-60 font-mono text-xs">{l.timestamp}</div>
                  <div className="col-span-4 font-bold text-white truncate">{l.email}</div>
                  <div className="col-span-2 text-right font-black text-primary text-lg">{l.score}%</div>
                  <div className="col-span-2 text-right italic opacity-70 text-[10px] uppercase font-bold tracking-tighter leading-none">
                    {l.tier}
                  </div>
                </div>
              ))}
              
              {JSON.parse(localStorage.getItem('b12_audit_leads') || '[]').length === 0 && (
                <div className="text-center py-32 opacity-20 mono tracking-[1em] text-lg">
                  VAULT_EMPTY
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="mt-8 mb-12 text-muted-foreground/30 text-[10px] mono uppercase tracking-[0.6em] font-medium flex items-center gap-4">
        <div className="w-2 h-2 rounded-full bg-primary/20 animate-pulse" />
        Secure Extraction Active • Extraordinarily Built
      </footer>
    </div>
  );
};

export default App;
