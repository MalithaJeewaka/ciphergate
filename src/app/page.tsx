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

    // 2. Generate Signature
    const signature = generateHMAC(encryptedPayload);

    // 3. Set Network Traffic for Visualization
    setNetworkTraffic({ payload: encryptedPayload, signature });

    try {
      // 4. Send to untrusted backend
      const response = await fetch("/api/proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payload: encryptedPayload, signature }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process request");
      }

      // 5. Decrypt response
      const serverResponse = data.response;

      const encRegex = /(\[ENC:.*?\])/g;
      let decryptedText = serverResponse;
      decryptedText = decryptedText.replace(encRegex, (match: string) => {
        return decryptEntity(match);
      });

      // Simulate a small delay for dramatic effect
      setTimeout(() => setFinalOutput(decryptedText), 600);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 font-sans selection:bg-emerald-500/30 relative overflow-hidden flex flex-col">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/20 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-900/20 blur-[120px] mix-blend-screen" />
        <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] rounded-full bg-blue-900/20 blur-[100px] mix-blend-screen" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-30" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full p-6 border-b border-white/5 bg-[#030712]/50 backdrop-blur-xl flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 p-[1px] shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <div className="w-full h-full bg-[#030712] rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">CipherGate <span className="font-light text-slate-400">DLP</span></h1>
            <p className="text-xs text-slate-500 font-mono">Zero-Trust Enterprise Proxy</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-emerald-500 uppercase tracking-widest">System Active</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 p-6 md:p-8 xl:p-12 w-full max-w-[1600px] mx-auto flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 h-full min-h-[650px]">
          
          {/* LEFT PANEL: LOCAL CLIENT (TRUSTED) */}
          <div className="flex flex-col rounded-3xl bg-[#0a0f1c]/80 border border-white/5 backdrop-blur-2xl shadow-2xl overflow-hidden group transition-all duration-500 hover:border-emerald-500/20 hover:shadow-[0_0_40px_rgba(16,185,129,0.05)]">
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-emerald-500/5 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h2 className="text-lg font-semibold text-white tracking-wide">Local Client</h2>
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(16,185,129,0.2)]">Trusted Zone</div>
            </div>
            
            <div className="p-6 md:p-8 flex-1 flex flex-col gap-6">
              <div className="flex flex-col gap-3 flex-1">
                <div className="flex justify-between items-end">
                  <label htmlFor="document-input" className="text-sm font-medium text-slate-400 tracking-wide uppercase">Input Data Stream</label>
                  <span className="text-xs text-slate-500 font-mono">PII Auto-detect: Active</span>
                </div>
                <div className="relative flex-1 group/input">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl transition-opacity duration-300 group-focus-within/input:opacity-100 opacity-50" />
                  <textarea 
                    id="document-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter message with emails or monetary values (e.g. Invoice to finance@corp.com for $10,000.00)..."
                    className="relative w-full h-full min-h-[200px] bg-[#030712]/50 border border-white/10 rounded-2xl p-5 text-slate-300 font-mono text-sm leading-relaxed placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none shadow-inner custom-scrollbar"
                  />
                  <div className="absolute bottom-4 right-4 flex gap-2 pointer-events-none">
                     <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-slate-500 font-mono border border-white/10 backdrop-blur-sm">AES-256 Ready</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={executeSecureQuery}
                disabled={loading || !input.trim()}
                className="group/btn relative w-full overflow-hidden rounded-xl bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl"
              >
                {!loading && input.trim() && (
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600 transition-all duration-500 group-hover/btn:scale-[1.02] group-active/btn:scale-95" />
                )}
                
                <div className={`relative px-6 py-4 flex justify-center items-center gap-3 font-semibold tracking-wide ${loading || !input.trim() ? 'text-slate-500' : 'text-white'}`}>
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <span className="animate-pulse text-emerald-400">Encrypting & Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Execute Secure Query</span>
                      <svg className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </>
                  )}
                </div>
              </button>

              <div className="flex flex-col gap-3 min-h-[140px]">
                <label className="text-sm font-medium text-slate-400 tracking-wide uppercase flex items-center gap-2">
                  Server Response
                  {finalOutput && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                </label>
                <div className={`relative flex-1 rounded-2xl p-5 shadow-inner transition-all duration-500 ${error ? 'bg-rose-950/20 border-rose-900/50 border' : finalOutput ? 'bg-[#030712]/50 border border-emerald-500/20' : 'bg-[#030712]/30 border border-white/5'} overflow-hidden`}>
                  {finalOutput && <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />}
                  
                  {error ? (
                    <div className="text-rose-400 flex items-start gap-3 font-mono text-sm">
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      <span><strong className="block mb-1">Decryption / Verification Failed</strong>{error}</span>
                    </div>
                  ) : finalOutput ? (
                    <div className="text-emerald-50 font-mono text-sm leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-500">
                      {finalOutput}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-600 italic text-sm font-mono opacity-50">
                      Awaiting secure response...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: UNTRUSTED NETWORK */}
          <div className="flex flex-col rounded-3xl bg-[#1c0a0f]/40 border border-rose-900/20 backdrop-blur-3xl shadow-2xl overflow-hidden group transition-all duration-500 hover:border-rose-500/20 hover:shadow-[0_0_40px_rgba(225,29,72,0.05)] relative">
            
            {/* Warning Stripes Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #e11d48 25%, #e11d48 75%, #000 75%, #000)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }}></div>

            <div className="relative p-6 border-b border-rose-900/30 bg-gradient-to-r from-rose-950/40 to-transparent flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400 relative">
                  <div className="absolute inset-0 bg-rose-500/20 rounded-lg animate-ping opacity-50"></div>
                  <svg className="w-5 h-5 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                </div>
                <h2 className="text-lg font-semibold text-white tracking-wide">Network Intercept</h2>
              </div>
              <div className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(225,29,72,0.3)] animate-pulse">Untrusted Zone</div>
            </div>
            
            <div className="relative p-6 md:p-8 flex-1 flex flex-col justify-center z-10">
              {!networkTraffic ? (
                <div className="flex flex-col items-center justify-center text-slate-500 py-12 gap-5 h-full">
                  <div className="relative">
                    <svg className="w-16 h-16 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="absolute inset-0 border-[3px] border-rose-900/30 rounded-full border-t-rose-500/50 animate-[spin_3s_linear_infinite]"></div>
                    <div className="absolute inset-2 border-[2px] border-transparent rounded-full border-b-rose-700/30 animate-[spin_2s_linear_infinite_reverse]"></div>
                  </div>
                  <p className="text-xs font-mono uppercase tracking-[0.2em] opacity-50">Monitoring Traffic...</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-right-4 duration-500 h-full justify-center">
                  
                  {/* Ciphertext Box */}
                  <div className="group/box relative bg-[#030712]/80 border border-rose-900/30 rounded-2xl p-5 shadow-2xl transition-colors hover:border-amber-500/40">
                    <div className="absolute -top-3 left-5 bg-[#030712] px-3 py-1 text-[10px] font-bold text-amber-400 tracking-widest uppercase flex items-center gap-1.5 border border-rose-900/30 rounded-md shadow-sm">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      AES-256 Ciphertext
                    </div>
                    <div className="mt-2 text-amber-200/80 font-mono text-[13px] break-all leading-relaxed max-h-[160px] overflow-y-auto custom-scrollbar group-hover/box:text-amber-100 transition-colors">
                      {networkTraffic.payload || <span className="opacity-50 italic text-slate-500">Empty payload</span>}
                    </div>
                    <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-tr-2xl pointer-events-none" />
                  </div>

                  {/* Connection Line */}
                  <div className="flex justify-center -my-2 relative z-0">
                     <div className="h-8 w-[1px] bg-gradient-to-b from-rose-900/50 to-rose-900/50 border-l border-dashed border-rose-700/50" />
                  </div>

                  {/* Signature Box */}
                  <div className="group/box relative bg-[#030712]/80 border border-rose-900/30 rounded-2xl p-5 shadow-2xl transition-colors hover:border-blue-500/40">
                    <div className="absolute -top-3 left-5 bg-[#030712] px-3 py-1 text-[10px] font-bold text-blue-400 tracking-widest uppercase flex items-center gap-1.5 border border-rose-900/30 rounded-md shadow-sm">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      HMAC-SHA256 Signature
                    </div>
                    <div className="mt-2 text-blue-200/80 font-mono text-[13px] break-all group-hover/box:text-blue-100 transition-colors">
                      {networkTraffic.signature}
                    </div>
                    <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-tr-2xl pointer-events-none" />
                  </div>
                  
                  <div className="mt-4 flex justify-center">
                    <div className="inline-flex items-center gap-2 text-[11px] text-rose-300/70 font-mono bg-rose-950/30 px-4 py-2 rounded-full border border-rose-900/40 backdrop-blur-md">
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Intercepting POST /api/proxy
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Global styling for custom scrollbar to match the dark theme */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}
