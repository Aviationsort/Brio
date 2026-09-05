import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

export const QRCodeGenerator: React.FC = () => {
  const [text, setText] = useState('https://brio.ife');
  const [dataUrl, setDataUrl] = useState('');
  const [fg, setFg] = useState('#000000');
  const [bg, setBg] = useState('#FFFFFF');
  const [size, setSize] = useState(256);

  useEffect(() => {
    const generate = async () => {
      try {
        const url = await QRCode.toDataURL(text || 'https://brio.ife', {
          width: size,
          margin: 2,
          color: { dark: fg, light: bg },
          errorCorrectionLevel: 'M',
        });
        setDataUrl(url);
      } catch {
        setDataUrl('');
      }
    };
    generate();
  }, [text, fg, bg, size]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'brio-qrcode.png';
    a.click();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="p-2 skeuo-inset-panel border border-red-500/30 rounded-xl text-red-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4h-4v-4H8v4H6v-4H4v-2h2v-4h4v4h4V4h2v10h4v4h-4v4h-2z" /></svg>
        </span>
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider">QR Code Generator</h2>
          <p className="text-[10px] font-mono text-zinc-400 mt-0.5">GENERATE SCANNABLE CODES</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="skeuo-panel p-4 space-y-3">
          <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Content</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text or URL..."
            rows={3}
            className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none resize-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Foreground</label>
              <div className="flex items-center gap-2 mt-1">
                <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
                <input type="text" value={fg} onChange={(e) => setFg(e.target.value)} className="flex-1 bg-transparent border border-white/10 rounded-lg px-2 py-1 text-xs text-white uppercase" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Background</label>
              <div className="flex items-center gap-2 mt-1">
                <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
                <input type="text" value={bg} onChange={(e) => setBg(e.target.value)} className="flex-1 bg-transparent border border-white/10 rounded-lg px-2 py-1 text-xs text-white uppercase" />
              </div>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Size: {size}px</label>
            <input type="range" min="128" max="512" step="32" value={size} onChange={(e) => setSize(parseInt(e.target.value))} className="w-full mt-1 accent-red-500" />
          </div>
        </div>

        <div className="skeuo-panel p-4 flex flex-col items-center justify-center gap-4">
          {dataUrl && <img src={dataUrl} alt="QR Code" className="max-w-[200px] max-h-[200px] border border-white/10 rounded-xl" />}
          <button onClick={download} disabled={!dataUrl} className="skeuo-btn-primary px-5 py-2.5 text-white font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50">
            Download PNG
          </button>
        </div>
      </div>
    </div>
  );
};
