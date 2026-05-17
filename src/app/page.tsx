"use client";

import { useState, useEffect } from "react";
import { sanitizeEnterprisePrompt, generateHMAC, decryptEntity } from "@/utils/security";

export default function Home() {
  const [input, setInput] = useState("");
  const [networkTraffic, setNetworkTraffic] = useState<{ payload: string; signature: string } | null>(null);
  const [finalOutput, setFinalOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const executeSecureQuery = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError("");
    setFinalOutput("");
    setNetworkTraffic(null);

    // 1. Sanitize & Encrypt
    const encryptedPayload = sanitizeEnterprisePrompt(input);
    const signature = generateHMAC(encryptedPayload);

    // Simulated delay for UI animation
    setTimeout(() => {
      setNetworkTraffic({ payload: encryptedPayload, signature });
    }, 400);

    try {
      const response = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: encryptedPayload, signature }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to process request");

      const serverResponse = data.response;
      const encRegex = /(\[ENC:.*?\])/g;
      let decryptedText = serverResponse;
      decryptedText = decryptedText.replace(encRegex, (match: string) => decryptEntity(match));

      setTimeout(() => setFinalOutput(decryptedText), 1200);
    } catch (err: any) {
      setTimeout(() => setError(err.message), 1200);
    } finally {
      setTimeout(() => setLoading(false), 1200);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-cyan-500/30 relative flex flex-col font-light">
      
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-cyan-900/10 to-transparent" />
        {/* Glows */}
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center border border-cyan-500/30 bg-cyan-500/10 rounded-none rotate-45 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <div className="-rotate-45">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-[0.2em] text-white uppercase">CipherGate</h1>
            <span className="text-[10px] font-mono tracking-[0.3em] text-cyan-500">DLP // PROXY NODE</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6 font-mono text-xs">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <span className="text-cyan-400/80 tracking-widest uppercase">AES-256 Engine: Online</span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
            <span className="text-orange-500/80 tracking-widest uppercase">Network Monitor: Active</span>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 h-[700px]">
          
          {/* ============================================================================================== */}
          {/* LEFT: TRUSTED CLIENT NODE */}
          {/* ============================================================================================== */}
          <div className="relative group h-full flex flex-col">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50 transition-all duration-300 group-hover:w-8 group-hover:h-8" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500/50 transition-all duration-300 group-hover:w-8 group-hover:h-8" />
            
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md border border-cyan-500/20 shadow-[inset_0_0_40px_rgba(6,182,212,0.02)] transition-colors duration-500 group-hover:border-cyan-500/40" />

            <div className="relative z-10 p-6 flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-normal text-white tracking-[0.15em] uppercase">Local Client</h2>
                  <p className="text-xs font-mono text-cyan-500/70 mt-1 uppercase tracking-widest">Trusted Data Origin</p>
                </div>
                <div className="px-2 py-1 bg-cyan-950/50 border border-cyan-500/30 text-[10px] font-mono text-cyan-400">SECURE</div>
              </div>

              {/* Input Area */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="relative flex-1 group/textarea">
                  <div className="absolute top-3 left-3 text-[10px] font-mono text-cyan-500/50 uppercase tracking-widest z-10 pointer-events-none">_Query_Input</div>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter payload data containing sensitive PII..."
                    className="w-full h-full bg-slate-950/50 border border-cyan-900/50 p-4 pt-10 text-cyan-50 font-mono text-sm resize-none focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-950/20 transition-all custom-scrollbar"
                  />
                  {/* Decorative Scanline */}
                  <div className="absolute left-0 right-0 h-[1px] bg-cyan-500/20 top-1/2 -translate-y-1/2 hidden group-focus-within/textarea:block animate-scan" />
                </div>

                <button
                  onClick={executeSecureQuery}
                  disabled={loading || !input.trim()}
                  className="relative w-full h-14 bg-cyan-950/30 border border-cyan-500/30 overflow-hidden text-cyan-400 font-mono tracking-widest uppercase text-sm hover:bg-cyan-900/50 hover:border-cyan-400 transition-all disabled:opacity-40 disabled:hover:border-cyan-500/30 disabled:hover:bg-cyan-950/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000" />
                  <div className="flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                        Transmitting...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Execute Protocol
                      </>
                    )}
                  </div>
                </button>

                {/* Output Area */}
                <div className="h-1/3 min-h-[160px] relative">
                   <div className="absolute top-3 left-3 text-[10px] font-mono text-cyan-500/50 uppercase tracking-widest z-10 pointer-events-none">_Proxy_Response</div>
                   <div className={`w-full h-full p-4 pt-10 font-mono text-sm border transition-all duration-300 overflow-y-auto custom-scrollbar ${error ? 'bg-red-950/20 border-red-900/50 text-red-400' : finalOutput ? 'bg-cyan-950/10 border-cyan-500/40 text-cyan-50' : 'bg-slate-950/50 border-slate-800 text-slate-600'}`}>
                     {error ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2">[ERROR] {error}</div>
                     ) : finalOutput ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2 leading-relaxed">
                          <span className="text-cyan-500 mr-2">{">"}</span>{finalOutput}
                        </div>
                     ) : (
                        <div className="flex h-full items-center justify-center italic opacity-50 text-xs tracking-widest uppercase">Awaiting Transmission</div>
                     )}
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================================================== */}
          {/* RIGHT: UNTRUSTED NETWORK NODE */}
          {/* ============================================================================================== */}
          <div className="relative group h-full flex flex-col">
            {/* Corner Accents */}
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-orange-500/50 transition-all duration-300 group-hover:w-8 group-hover:h-8" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-orange-500/50 transition-all duration-300 group-hover:w-8 group-hover:h-8" />
            
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md border border-orange-500/20 shadow-[inset_0_0_40px_rgba(249,115,22,0.02)] transition-colors duration-500 group-hover:border-orange-500/40" />

            {/* Danger Stripes Overlay */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #f97316 0, #f97316 1px, transparent 1px, transparent 10px)' }}></div>

            <div className="relative z-10 p-6 flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-normal text-white tracking-[0.15em] uppercase">Network Intercept</h2>
                  <p className="text-xs font-mono text-orange-500/70 mt-1 uppercase tracking-widest">Untrusted Zone</p>
                </div>
                <div className="px-2 py-1 bg-orange-950/50 border border-orange-500/30 text-[10px] font-mono text-orange-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping"></span>
                  SNIFFING
                </div>
              </div>

              {/* Visualization Area */}
              <div className="flex-1 flex flex-col justify-center items-center gap-6 relative">
                
                {!networkTraffic ? (
                  <div className="flex flex-col items-center gap-4 opacity-40">
                    <div className="w-24 h-24 border border-dashed border-orange-500/50 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
                       <div className="w-16 h-16 border border-orange-500/30 rounded-full" />
                    </div>
                    <div className="font-mono text-[10px] text-orange-400 tracking-[0.4em] uppercase">No Packets Detected</div>
                  </div>
                ) : (
                  <div className="w-full flex flex-col gap-6 animate-in zoom-in-95 duration-500">
                    
                    {/* Ciphertext Block */}
                    <div className="relative border border-orange-500/30 bg-black/40 p-4">
                      <div className="absolute -top-3 left-4 bg-slate-950 px-2 font-mono text-[10px] text-orange-400 tracking-widest uppercase border border-orange-500/30">
                        Payload // AES-256
                      </div>
                      <div className="font-mono text-xs text-orange-200/70 break-all leading-relaxed max-h-[200px] overflow-y-auto custom-scrollbar">
                        {networkTraffic.payload}
                      </div>
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-orange-500" />
                    </div>

                    {/* Dotted Connection Line */}
                    <div className="flex justify-center -my-2 opacity-50">
                      <svg height="30" width="20">
                        <line x1="10" y1="0" x2="10" y2="30" stroke="#f97316" strokeWidth="1" strokeDasharray="4 4" />
                      </svg>
                    </div>

                    {/* Signature Block */}
                    <div className="relative border border-indigo-500/30 bg-black/40 p-4">
                      <div className="absolute -top-3 left-4 bg-slate-950 px-2 font-mono text-[10px] text-indigo-400 tracking-widest uppercase border border-indigo-500/30">
                        Signature // HMAC-SHA256
                      </div>
                      <div className="font-mono text-xs text-indigo-200/70 break-all">
                        {networkTraffic.signature}
                      </div>
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-indigo-500" />
                    </div>

                    {/* Intercept Data Status */}
                    <div className="mt-4 w-full flex justify-between items-center border-t border-orange-900/30 pt-4 font-mono text-[10px] text-orange-500/60 uppercase tracking-widest">
                       <span>Target: /api/proxy</span>
                       <span>Status: Analyzing...</span>
                    </div>

                  </div>
                )}
                
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Tailwind specific custom styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6, 182, 212, 0.3); border-radius: 0px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(6, 182, 212, 0.6); }
        
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}} />
    </div>
  );
}
