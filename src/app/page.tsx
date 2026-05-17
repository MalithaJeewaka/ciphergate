"use client";

import { useState } from "react";
import { sanitizeEnterprisePrompt, generateHMAC, decryptEntity } from "@/utils/security";

export default function Home() {
  const [input, setInput] = useState("");
  const [networkTraffic, setNetworkTraffic] = useState<{payload: string, signature: string} | null>(null);
  const [finalOutput, setFinalOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      
      // Extract [ENC:...] tokens and decrypt them
      // Regex to find tokens like [ENC:...]
      const encRegex = /(\[ENC:.*?\])/g;
      
      let decryptedText = serverResponse;
      decryptedText = decryptedText.replace(encRegex, (match: string) => {
        return decryptEntity(match);
      });

      setFinalOutput(decryptedText);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 drop-shadow-sm">
            CipherGate
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Zero-Trust Enterprise DLP Proxy</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Left Panel: Trusted Client */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-100">Local Client <span className="text-emerald-400 text-sm font-medium ml-2 px-2 py-1 bg-emerald-400/10 rounded-full">Trusted Zone</span></h2>
            </div>
            
            <div className="flex-grow flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="document-input" className="text-sm font-medium text-slate-400">Sensitive Enterprise Document</label>
                <textarea 
                  id="document-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste document containing emails (e.g., admin@corp.com) or money (e.g., $5,000,000.00)..."
                  className="w-full h-48 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none shadow-inner"
                />
              </div>

              <button 
                onClick={executeSecureQuery}
                disabled={loading || !input.trim()}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Secure Request...
                  </>
                ) : (
                  <>
                    Execute Secure Query
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>

              <div className="flex-grow flex flex-col">
                <label className="text-sm font-medium text-slate-400 mb-2">Decrypted Response</label>
                <div className={`flex-grow w-full bg-slate-950 border ${error ? 'border-red-900/50' : 'border-slate-800'} rounded-xl p-4 text-slate-300 min-h-[120px] shadow-inner flex flex-col justify-center`}>
                  {error ? (
                    <div className="text-red-400 flex items-center gap-2">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </div>
                  ) : finalOutput ? (
                    <div className="animate-fade-in text-emerald-50">
                      {finalOutput}
                    </div>
                  ) : (
                    <span className="text-slate-600 italic text-center text-sm">Response will appear here...</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Untrusted Network */}
          <div className="bg-slate-900/50 border border-red-900/30 rounded-2xl p-6 shadow-2xl flex flex-col relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-500"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-900/20 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-100">Network Intercept <span className="text-red-400 text-sm font-medium ml-2 px-2 py-1 bg-red-400/10 border border-red-400/20 rounded-full animate-pulse">Untrusted Zone</span></h2>
            </div>
            
            <div className="flex-grow flex flex-col justify-center relative z-10">
              {!networkTraffic ? (
                <div className="flex flex-col items-center justify-center text-slate-500 py-12 gap-4">
                  <div className="relative">
                    <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="absolute inset-0 border-2 border-slate-700/50 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-sm font-mono uppercase tracking-widest opacity-60">Awaiting Network Traffic...</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6 animate-fade-in">
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 shadow-inner relative group hover:border-orange-500/50 transition-colors">
                    <div className="absolute -top-3 left-4 bg-slate-900 px-2 text-xs font-bold text-orange-400 tracking-wider flex items-center gap-1 border border-slate-800 rounded">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      AES-256 Ciphertext (Confidentiality)
                    </div>
                    <div className="mt-2 text-slate-300 font-mono text-sm break-all leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
                      {networkTraffic.payload || <span className="text-slate-600 italic">Empty payload</span>}
                    </div>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 shadow-inner relative group hover:border-blue-500/50 transition-colors">
                    <div className="absolute -top-3 left-4 bg-slate-900 px-2 text-xs font-bold text-blue-400 tracking-wider flex items-center gap-1 border border-slate-800 rounded">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      HMAC-SHA256 Signature (Integrity)
                    </div>
                    <div className="mt-2 text-slate-300 font-mono text-sm break-all">
                      {networkTraffic.signature}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center mt-4">
                     <div className="flex items-center gap-2 text-xs text-slate-500 font-mono bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
                       <span className="relative flex h-2 w-2">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                       </span>
                       Intercepting POST /api/proxy
                     </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
