import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

import { 
  Upload, Wand2, RefreshCcw, Image as ImageIcon, CheckCircle2, 
  AlertCircle, Loader2, Instagram, Home, Users, Layout, 
  BookOpen, Briefcase, Video, FileText, Layers, Settings, 
  History, Send, Plus, Sparkles, ChevronRight, Menu, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{original: string, result: string}[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [avatarPrompt, setAvatarPrompt] = useState('');
  const [avatarResult, setAvatarResult] = useState<string | null>(null);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const suggestions = [
    "Formal navy blue suit with a silk tie",
    "Casual summer linen shirt and beige shorts",
    "Cyberpunk style neon jacket with techwear pants",
    "Traditional Moroccan Djellaba with modern embroidery",
    "Vintage 90s oversized denim jacket and white tee"
  ];

  const handleGenerateVideo = async () => {
    if (!videoPrompt) return;
    setIsVideoLoading(true);
    setError(null);

    try {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }

      const videoAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await videoAi.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: videoPrompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await videoAi.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: { 'x-goog-api-key': process.env.API_KEY || '' },
        });
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.message || "";
      if (errorMsg.includes("Requested entity was not found") || errorMsg.toLowerCase().includes("permission denied")) {
        setError("Permission Denied: Please select a PAID API Key from a Google Cloud project with billing enabled to use Video generation.");
        await window.aistudio.openSelectKey();
      } else {
        setError("Failed to generate video. Please ensure you are using a Paid API Key.");
      }
    } finally {
      setIsVideoLoading(false);
    }
  };

  const handleGenerateAvatar = async () => {
    if (!avatarPrompt) return;
    setIsAvatarLoading(true);
    setError(null);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `Professional 3D avatar portrait of ${avatarPrompt}, high detail, cinematic lighting, stylized character design` }] },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setAvatarResult(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (err) {
      setError("Failed to generate avatar.");
    } finally {
      setIsAvatarLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResultImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResultImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image || !prompt) return;

    setIsLoading(true);
    setError(null);

    try {
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: `Edit this image to change the person's clothes. New outfit description: ${prompt}. Maintain the person's identity, pose, and background as much as possible.`,
            },
          ],
        },
      });

      let foundImage = false;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const newResult = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            setResultImage(newResult);
            setHistory(prev => [{ original: image, result: newResult }, ...prev].slice(0, 5));
            foundImage = true;
            break;
          }
        }
      }

      if (!foundImage) {
        setError("The model didn't return an edited image. Try a different prompt.");
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "An error occurred during image generation.");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResultImage(null);
    setPrompt('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-yellow-500/30 flex relative overflow-hidden">
      {/* Fixed Background Image - Saul Goodman Flag */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src="https://images.squarespace-cdn.com/content/v1/51b3dc8ee4b051b96ceb10de/1375302450153-C7S9G7M3X6X7X7X7X7X7/Saul+Goodman+Flag.jpg" 
          className="w-full h-full object-cover opacity-[0.12]" 
          alt="Saul Goodman Flag Background"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images2.alphacoders.com/552/552630.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]"></div>
      </div>

      {/* Sidebar (Desktop) */}
      <aside className="w-64 border-r border-white/5 bg-[#0f0f0f] flex flex-col hidden md:flex shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shadow-lg shadow-yellow-500/10">
            <img 
              src="https://static.wikia.nocookie.net/breakingbad/images/1/16/Saul_Goodman.jpg" 
              alt="GOODMAN" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-bold tracking-tight text-lg text-yellow-500 uppercase">MOHAMED DARDARI</span>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
          <div className="pb-2 px-3 text-[10px] font-bold text-white/30 uppercase tracking-widest">Main</div>
          <SidebarItem icon={<Home size={18} />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <SidebarItem icon={<Users size={18} />} label="Avatars" active={activeTab === 'avatars'} onClick={() => setActiveTab('avatars')} />
          <SidebarItem icon={<Layout size={18} />} label="Templates" active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} />
          <SidebarItem icon={<BookOpen size={18} />} label="Knowledge Base" active={activeTab === 'kb'} onClick={() => setActiveTab('kb')} />
          <SidebarItem icon={<Briefcase size={18} />} label="Brand System" active={activeTab === 'brand'} onClick={() => setActiveTab('brand')} />
          
          <div className="pt-6 pb-2 px-3 text-[10px] font-bold text-yellow-500/70 uppercase tracking-widest">Creation</div>
          <SidebarItem icon={<ImageIcon size={18} />} label="Photo to outfit" active={activeTab === 'photo-to-outfit'} onClick={() => setActiveTab('photo-to-outfit')} />
          <SidebarItem icon={<Video size={18} />} label="Script to video" active={activeTab === 'script'} onClick={() => setActiveTab('script')} />
          <SidebarItem icon={<FileText size={18} />} label="PPT/PDF to video" active={activeTab === 'doc'} onClick={() => setActiveTab('doc')} />
          <SidebarItem icon={<Layers size={18} />} label="Interactive video" active={activeTab === 'interactive'} onClick={() => setActiveTab('interactive')} />
        </nav>

        <div className="p-4 mt-auto border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-[10px] font-bold text-black">
              M
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-yellow-500 uppercase">MOHAMED DARDARI</p>
            </div>
            <Settings size={16} className="text-white/70" />
          </div>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#0f0f0f] border-r border-white/10 z-[70] md:hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10">
                    <img 
                      src="https://static.wikia.nocookie.net/breakingbad/images/1/16/Saul_Goodman.jpg" 
                      alt="GOODMAN" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="font-bold tracking-tight text-sm text-yellow-500 uppercase">MOHAMED DARDARI</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-white/40 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
                <div className="pb-2 px-3 text-[10px] font-bold text-white/30 uppercase tracking-widest">Main</div>
                <SidebarItem icon={<Home size={18} />} label="Home" active={activeTab === 'home'} onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }} />
                <SidebarItem icon={<Users size={18} />} label="Avatars" active={activeTab === 'avatars'} onClick={() => { setActiveTab('avatars'); setIsMobileMenuOpen(false); }} />
                <SidebarItem icon={<Layout size={18} />} label="Templates" active={activeTab === 'templates'} onClick={() => { setActiveTab('templates'); setIsMobileMenuOpen(false); }} />
                
                <div className="pt-6 pb-2 px-3 text-[10px] font-bold text-yellow-500/70 uppercase tracking-widest">Creation</div>
                <SidebarItem icon={<ImageIcon size={18} />} label="Photo to outfit" active={activeTab === 'photo-to-outfit'} onClick={() => { setActiveTab('photo-to-outfit'); setIsMobileMenuOpen(false); }} />
                <SidebarItem icon={<Video size={18} />} label="Script to video" active={activeTab === 'script'} onClick={() => { setActiveTab('script'); setIsMobileMenuOpen(false); }} />
                <SidebarItem icon={<FileText size={18} />} label="PPT/PDF to video" active={activeTab === 'doc'} onClick={() => { setActiveTab('doc'); setIsMobileMenuOpen(false); }} />
                <SidebarItem icon={<Layers size={18} />} label="Interactive video" active={activeTab === 'interactive'} onClick={() => { setActiveTab('interactive'); setIsMobileMenuOpen(false); }} />
              </nav>

              <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-[10px] font-bold text-black">
                    M
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-yellow-500 uppercase">MOHAMED DARDARI</p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[200px] md:h-[400px] bg-yellow-500/10 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />
        
        <header className="p-4 md:p-6 flex items-center justify-between relative z-50">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white md:hidden transition-colors"
          >
            <Menu size={24} />
          </button>
          <div className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10">
              <img 
                src="https://static.wikia.nocookie.net/breakingbad/images/1/16/Saul_Goodman.jpg" 
                alt="Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-bold text-xs text-yellow-500 uppercase tracking-tighter">M. DARDARI</span>
          </div>
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-[10px] md:text-xs font-bold transition-colors">
            Resources
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 pb-12 relative">
          <AnimatePresence mode="wait">
            {activeTab === 'home' ? (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-5xl mx-auto pt-12 space-y-12 relative z-10"
              >
                {/* Greeting */}
                <div className="text-center space-y-4 mb-16">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold tracking-widest uppercase mb-4"
                  >
                    <Sparkles size={14} />
                    Welcome to MOHAMED DARDARI AI Studio
                  </motion.div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
                    WHAT WILL YOU <span className="text-yellow-500">CREATE</span> TODAY?
                  </h1>
                  <p className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto font-medium px-4">
                    Choose a tool below to start your professional AI journey.
                  </p>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <HomeCard 
                    icon={<ImageIcon size={32} />} 
                    title="Photo to Outfit" 
                    description="Transform your look with AI virtual styling."
                    onClick={() => setActiveTab('photo-to-outfit')}
                    color="yellow"
                  />
                  <HomeCard 
                    icon={<Video size={32} />} 
                    title="Script to Video" 
                    description="Generate cinematic videos from text prompts."
                    onClick={() => setActiveTab('script')}
                    color="blue"
                  />
                  <HomeCard 
                    icon={<Users size={32} />} 
                    title="AI Avatars" 
                    description="Create unique digital personas for your brand."
                    onClick={() => setActiveTab('avatars')}
                    color="purple"
                  />
                  <HomeCard 
                    icon={<FileText size={32} />} 
                    title="PPT/PDF to Video" 
                    description="Convert documents into engaging video presentations."
                    onClick={() => setActiveTab('doc')}
                    color="emerald"
                  />
                  <HomeCard 
                    icon={<Layers size={32} />} 
                    title="Interactive Video" 
                    description="Create videos with clickable interactive elements."
                    onClick={() => setActiveTab('interactive')}
                    color="orange"
                  />
                  <HomeCard 
                    icon={<Layout size={32} />} 
                    title="AI Templates" 
                    description="Browse professional AI-ready design templates."
                    onClick={() => setActiveTab('templates')}
                    color="cyan"
                  />
                </div>
              </motion.div>
            ) : activeTab === 'photo-to-outfit' ? (
              <motion.div 
                key="photo-to-outfit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto pt-12 space-y-12 relative z-10"
              >
                {/* Greeting */}
                <div className="text-center space-y-2">
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight uppercase">
                    Hi <span className="text-yellow-500">MOHAMED</span>,
                  </h2>
                  <p className="text-2xl md:text-3xl font-medium text-white/80">what will you create?</p>
                </div>

                {/* Central Input Box */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-[24px] md:rounded-[32px] blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                  <div className="relative bg-[#151515] border border-white/10 rounded-[24px] md:rounded-[32px] p-4 md:p-6 shadow-2xl overflow-hidden">
                    {/* Background Image of Goodman */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.25] grayscale mix-blend-overlay">
                      <img 
                        src="https://m.media-amazon.com/images/M/MV5BMjJmZDRiYjAtM2ZiOC00YTM1LWI2YzctYjE1YmQxNDU0YmI1XkEyXkFqcGdeQXVyNjcyNjcyMzQ@._V1_.jpg" 
                        className="w-full h-full object-cover" 
                        alt="Background"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://www.thewrap.com/wp-content/uploads/2022/04/better-call-saul-season-6.jpg';
                        }}
                      />
                    </div>
                    <div className="relative flex flex-col gap-4 md:gap-6">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors shrink-0 overflow-hidden"
                        >
                          {image ? (
                            <img src={image} className="w-full h-full object-cover" alt="Upload" />
                          ) : (
                            <Plus size={window.innerWidth < 768 ? 20 : 24} className="text-white/40" />
                          )}
                        </div>
                        <div className="flex-1 min-h-[80px] md:min-h-[100px] flex flex-col">
                          <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe your outfit idea..."
                            className="w-full bg-transparent border-none outline-none text-base md:text-lg placeholder:text-white/20 resize-none py-2"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {suggestions.map((s, i) => (
                          <button 
                            key={i}
                            onClick={() => setPrompt(s)}
                            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[8px] md:text-[10px] font-medium whitespace-nowrap hover:bg-white/10 hover:border-yellow-500/30 transition-all"
                          >
                            {s}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-white/5 rounded-lg text-white/40 transition-colors">
                            <Sparkles size={18} />
                          </button>
                          <button className="p-2 hover:bg-white/5 rounded-lg text-white/40 transition-colors">
                            <History size={18} />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={handleGenerate}
                            disabled={!image || !prompt || isLoading}
                            className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full font-bold text-xs md:text-sm flex items-center gap-2 transition-all ${
                              isLoading 
                                ? 'bg-yellow-500/20 text-yellow-500/50 cursor-not-allowed' 
                                : 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/20'
                            }`}
                          >
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                            {isLoading ? 'Generating...' : 'Generate'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Result Display (if generated) */}
                <AnimatePresence>
                  {resultImage && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          <Sparkles className="text-yellow-400" size={20} />
                          Generated Masterpiece
                        </h3>
                        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                          <button 
                            onClick={() => setShowCompare(false)}
                            className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${!showCompare ? 'bg-yellow-500 text-black' : 'text-white/40 hover:text-white'}`}
                          >
                            Result
                          </button>
                          <button 
                            onClick={() => setShowCompare(true)}
                            className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${showCompare ? 'bg-yellow-500 text-black' : 'text-white/40 hover:text-white'}`}
                          >
                            Compare
                          </button>
                        </div>
                      </div>

                      <div className="bg-[#151515] border border-yellow-500/20 rounded-[32px] p-2 overflow-hidden shadow-2xl shadow-yellow-500/5">
                        <div className="relative aspect-[3/4] rounded-[24px] overflow-hidden bg-black group">
                          {showCompare ? (
                            <div className="flex h-full">
                              <div className="w-1/2 h-full relative border-r border-white/10">
                                <img src={image!} className="w-full h-full object-cover" alt="Original" />
                                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[8px] font-bold uppercase">Original</div>
                              </div>
                              <div className="w-1/2 h-full relative">
                                <img src={resultImage} className="w-full h-full object-cover" alt="Result" />
                                <div className="absolute bottom-4 right-4 bg-yellow-500/80 backdrop-blur-md px-2 py-1 rounded text-[8px] font-bold uppercase text-black">AI Result</div>
                              </div>
                            </div>
                          ) : (
                            <img src={resultImage} className="w-full h-full object-cover" alt="Result" />
                          )}
                          
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button 
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = resultImage;
                                link.download = 'ai-outfit.png';
                                link.click();
                              }}
                              className="px-6 py-2 bg-white text-black rounded-full text-xs font-bold shadow-xl hover:bg-cyan-400 transition-colors"
                            >
                              Download
                            </button>
                            <button 
                              onClick={handleGenerate}
                              className="px-6 py-2 bg-black/60 backdrop-blur-md text-white border border-white/20 rounded-full text-xs font-bold shadow-xl hover:bg-white/10 transition-colors"
                            >
                              Regenerate
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Recents Section */}
                <div className="space-y-6 pt-12">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Recents</h3>
                    <div className="flex items-center gap-4">
                      {history.length > 0 && (
                        <button 
                          onClick={() => setHistory([])}
                          className="text-[10px] font-bold text-red-400/50 hover:text-red-400 transition-colors uppercase tracking-widest"
                        >
                          Clear All
                        </button>
                      )}
                      <button className="text-sm font-bold text-white/40 hover:text-white flex items-center gap-1 transition-colors">
                        See all <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {history.length > 0 ? history.map((item, idx) => (
                      <div key={idx} className="group relative aspect-video bg-[#151515] border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-yellow-500/50 transition-all">
                        <img src={item.result} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt={`Recent ${idx}`} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                          <p className="text-[10px] font-bold uppercase tracking-widest">Untitled Look</p>
                          <p className="text-[8px] text-white/40">1 day ago • AI Edit</p>
                        </div>
                      </div>
                    )) : (
                      <>
                        <div className="aspect-video bg-[#151515] border border-white/5 rounded-2xl flex items-center justify-center text-white/5">
                          <ImageIcon size={24} />
                        </div>
                        <div className="aspect-video bg-[#151515] border border-white/5 rounded-2xl flex items-center justify-center text-white/5">
                          <ImageIcon size={24} />
                        </div>
                        <div className="aspect-video bg-[#151515] border border-white/5 rounded-2xl flex items-center justify-center text-white/5 hidden sm:flex">
                          <ImageIcon size={24} />
                        </div>
                        <div className="aspect-video bg-[#151515] border border-white/5 rounded-2xl flex items-center justify-center text-white/5 hidden md:flex">
                          <ImageIcon size={24} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'script' ? (
              <motion.div 
                key="script"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto pt-12 space-y-12 relative z-10"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight uppercase">
                    Script to <span className="text-yellow-500">Video</span>
                  </h2>
                  <p className="text-white/40 text-base md:text-lg px-4">Turn your ideas into cinematic masterpieces with Veo AI.</p>
                </div>

                <div className="bg-[#151515] border border-white/10 rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-2xl">
                  <div className="space-y-6">
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
                      <AlertCircle size={18} className="text-yellow-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] md:text-xs text-yellow-500/80 font-medium leading-relaxed">
                        <span className="font-black uppercase">Important:</span> Video generation requires a <span className="text-yellow-500 font-bold underline">Paid API Key</span> from a Google Cloud project with billing enabled.
                      </p>
                    </div>
                    <textarea
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      placeholder="Describe the video you want to generate..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 text-base md:text-lg text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 min-h-[150px] md:min-h-[200px] resize-none"
                    />
                    <button 
                      onClick={handleGenerateVideo}
                      disabled={isVideoLoading || !videoPrompt}
                      className={`w-full py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-xs md:text-sm tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 ${
                        isVideoLoading || !videoPrompt
                          ? 'bg-white/5 text-white/20 cursor-not-allowed'
                          : 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/20'
                      }`}
                    >
                      {isVideoLoading ? <Loader2 className="animate-spin" size={20} /> : <Video size={20} />}
                      {isVideoLoading ? 'Generating Video...' : 'Generate Video'}
                    </button>
                  </div>
                </div>

                {videoUrl && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg md:text-xl font-bold uppercase tracking-tight">Result</h3>
                    <div className="aspect-video rounded-[24px] md:rounded-[32px] overflow-hidden border border-yellow-500/20 bg-black shadow-2xl">
                      <video src={videoUrl} controls className="w-full h-full object-contain" />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : activeTab === 'avatars' ? (
              <motion.div 
                key="avatars"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto pt-12 space-y-12 relative z-10"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight uppercase">
                    AI <span className="text-yellow-500">Avatars</span>
                  </h2>
                  <p className="text-white/40 text-base md:text-lg px-4">Create unique digital personas for your brand.</p>
                </div>

                <div className="bg-[#151515] border border-white/10 rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-2xl">
                  <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    <div className="flex-1 space-y-6">
                      <textarea
                        value={avatarPrompt}
                        onChange={(e) => setAvatarPrompt(e.target.value)}
                        placeholder="Describe your avatar..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 min-h-[120px] md:min-h-[150px] resize-none"
                      />
                      <button 
                        onClick={handleGenerateAvatar}
                        disabled={isAvatarLoading || !avatarPrompt}
                        className={`w-full py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-xs md:text-sm tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 ${
                          isAvatarLoading || !avatarPrompt
                            ? 'bg-white/5 text-white/20 cursor-not-allowed'
                            : 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/20'
                        }`}
                      >
                        {isAvatarLoading ? <Loader2 className="animate-spin" size={20} /> : <Users size={20} />}
                        {isAvatarLoading ? 'Creating Avatar...' : 'Generate Avatar'}
                      </button>
                    </div>
                    <div className="w-full md:w-64 aspect-square rounded-xl md:rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                      {avatarResult ? (
                        <img src={avatarResult} className="w-full h-full object-cover" alt="Avatar" />
                      ) : (
                        <Users size={window.innerWidth < 768 ? 32 : 48} className="text-white/10" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Featured AI Characters */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-black uppercase tracking-tight">Featured AI Characters</h3>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-yellow-500 transition-colors">All</button>
                      <button className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-yellow-500 transition-colors">Female</button>
                      <button className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-yellow-500 transition-colors">Male</button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { name: "Aria", type: "Female", img: "https://picsum.photos/seed/aigirl1/400/500" },
                      { name: "Kael", type: "Male", img: "https://picsum.photos/seed/aiman1/400/500" },
                      { name: "Luna", type: "Female", img: "https://picsum.photos/seed/aigirl2/400/500" },
                      { name: "Jax", type: "Male", img: "https://picsum.photos/seed/aiman2/400/500" },
                      { name: "Nova", type: "Female", img: "https://picsum.photos/seed/aigirl3/400/500" },
                      { name: "Cyrus", type: "Male", img: "https://picsum.photos/seed/aiman3/400/500" },
                      { name: "Elena", type: "Female", img: "https://picsum.photos/seed/aigirl4/400/500" },
                      { name: "Zane", type: "Male", img: "https://picsum.photos/seed/aiman4/400/500" }
                    ].map((char, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 group cursor-pointer"
                        onClick={() => setAvatarPrompt(`A high-quality AI character named ${char.name}, ${char.type.toLowerCase()}, futuristic style`)}
                      >
                        <img src={char.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt={char.name} referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                          <p className="text-yellow-500 font-black uppercase text-xs tracking-widest">{char.type}</p>
                          <h4 className="text-white font-bold text-lg">{char.name}</h4>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'doc' ? (
              <motion.div 
                key="doc"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto pt-12 space-y-12 relative z-10"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight uppercase px-4">
                    PPT/PDF to <span className="text-yellow-500">Video</span>
                  </h2>
                  <p className="text-white/40 text-base md:text-lg px-4">Convert your documents into professional video presentations.</p>
                </div>

                <div className="bg-[#151515] border border-white/10 rounded-[24px] md:rounded-[32px] p-8 md:p-12 shadow-2xl text-center space-y-6 md:space-y-8">
                  <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto">
                    <FileText size={window.innerWidth < 768 ? 32 : 48} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl md:text-2xl font-bold">Upload your Document</h3>
                    <p className="text-white/40 text-xs md:text-sm max-w-sm mx-auto px-4">Upload a PDF or PPT file and our AI will summarize it into a video script and generate a presentation.</p>
                  </div>
                  <div className="flex justify-center">
                    <label className="px-6 md:px-8 py-3 md:py-4 bg-emerald-500 text-black rounded-xl md:rounded-2xl font-black text-xs md:text-sm tracking-widest uppercase cursor-pointer hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                      Select Document
                      <input type="file" accept=".pdf,.ppt,.pptx" className="hidden" onChange={() => {
                        setError("Document processing is being initialized. Please try again in a moment.");
                      }} />
                    </label>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'templates' ? (
              <motion.div 
                key="templates"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-6xl mx-auto pt-12 space-y-12 relative z-10"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight uppercase px-4">
                    AI <span className="text-yellow-500">Templates</span>
                  </h2>
                  <p className="text-white/40 text-base md:text-lg px-4">Professional ready-to-use AI design frameworks.</p>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap items-center justify-center gap-3 px-4">
                  {['All', 'Retail', 'Business', 'Marketing', 'Learning', 'Events', 'Tech'].map((cat) => (
                    <button 
                      key={cat}
                      className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                        cat === 'All' ? 'bg-yellow-500 text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: "E-commerce Fashion", category: "Retail", img: "https://picsum.photos/seed/fashion/800/600", users: "2.4k" },
                    { title: "Corporate Presentation", category: "Business", img: "https://picsum.photos/seed/business/800/600", users: "1.8k" },
                    { title: "Social Media Viral", category: "Marketing", img: "https://picsum.photos/seed/social/800/600", users: "5.2k" },
                    { title: "Product Showcase", category: "Retail", img: "https://picsum.photos/seed/product/800/600", users: "3.1k" },
                    { title: "Educational Course", category: "Learning", img: "https://picsum.photos/seed/edu/800/600", users: "1.2k" },
                    { title: "Event Promotion", category: "Events", img: "https://picsum.photos/seed/event/800/600", users: "900" },
                    { title: "Tech Startup Pitch", category: "Tech", img: "https://picsum.photos/seed/tech/800/600", users: "2.1k" },
                    { title: "Restaurant Menu AI", category: "Retail", img: "https://picsum.photos/seed/food/800/600", users: "1.5k" },
                    { title: "Fitness Program", category: "Learning", img: "https://picsum.photos/seed/fitness/800/600", users: "2.8k" },
                    { title: "Real Estate Tour", category: "Business", img: "https://picsum.photos/seed/home/800/600", users: "1.1k" },
                    { title: "Music Video AI", category: "Marketing", img: "https://picsum.photos/seed/music/800/600", users: "4.3k" },
                    { title: "Gaming Stream Overlay", category: "Tech", img: "https://picsum.photos/seed/gaming/800/600", users: "3.7k" }
                  ].map((t, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ y: -5 }}
                      className="bg-[#151515] border border-white/10 rounded-[24px] overflow-hidden group cursor-pointer"
                    >
                      <div className="aspect-video relative overflow-hidden">
                        <img src={t.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={t.title} referrerPolicy="no-referrer" />
                        <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-yellow-500">
                          {t.category}
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        <h3 className="text-xl font-bold text-white group-hover:text-yellow-500 transition-colors">{t.title}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-white/40 text-xs text-[10px] uppercase font-bold tracking-wider">Used by {t.users} creators</span>
                          <button className="p-2 bg-white/5 rounded-lg text-white/60 hover:bg-yellow-500 hover:text-black transition-all">
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : activeTab === 'kb' ? (
              <motion.div 
                key="kb"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto pt-12 space-y-12 relative z-10"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight uppercase px-4">
                    Knowledge <span className="text-yellow-500">Base</span>
                  </h2>
                  <p className="text-white/40 text-base md:text-lg px-4">Train your AI with custom data and documentation.</p>
                </div>

                <div className="bg-[#151515] border border-white/10 rounded-[24px] md:rounded-[32px] p-6 md:p-8 space-y-8">
                  <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white/5 rounded-2xl border border-white/10">
                    <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0">
                      <BookOpen size={32} />
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-1">
                      <h3 className="text-xl font-bold">Connect Data Sources</h3>
                      <p className="text-white/40 text-sm">Upload PDFs, link URLs, or connect Notion to feed your AI.</p>
                    </div>
                    <button className="px-6 py-2.5 bg-yellow-500 text-black rounded-full font-bold text-sm hover:bg-yellow-400 transition-all">
                      Add Source
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/20 px-2">Active Sources</h4>
                    {[
                      { name: "Brand Guidelines 2024.pdf", size: "2.4 MB", type: "PDF" },
                      { name: "Product Documentation", size: "12 Pages", type: "URL" },
                      { name: "Customer Support FAQ", size: "45 Items", type: "Manual" }
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-yellow-500 transition-colors">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{s.name}</p>
                            <p className="text-[10px] text-white/20 font-medium">{s.size} • {s.type}</p>
                          </div>
                        </div>
                        <button className="p-2 text-white/20 hover:text-red-500 transition-colors">
                          <Plus size={16} className="rotate-45" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'brand' ? (
              <motion.div 
                key="brand"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-5xl mx-auto pt-12 space-y-12 relative z-10"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight uppercase px-4">
                    Brand <span className="text-yellow-500">System</span>
                  </h2>
                  <p className="text-white/40 text-base md:text-lg px-4">Maintain consistency across all AI-generated content.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Colors */}
                  <div className="bg-[#151515] border border-white/10 rounded-[24px] p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold uppercase tracking-tight">Colors</h3>
                      <Settings size={16} className="text-white/20" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <div className="aspect-square rounded-xl bg-yellow-500 shadow-lg shadow-yellow-500/20"></div>
                        <p className="text-[10px] font-bold text-center text-white/40">#EAB308</p>
                      </div>
                      <div className="space-y-2">
                        <div className="aspect-square rounded-xl bg-black border border-white/10"></div>
                        <p className="text-[10px] font-bold text-center text-white/40">#000000</p>
                      </div>
                    </div>
                  </div>

                  {/* Typography */}
                  <div className="bg-[#151515] border border-white/10 rounded-[24px] p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold uppercase tracking-tight">Typography</h3>
                      <Settings size={16} className="text-white/20" />
                    </div>
                    <div className="space-y-4">
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-2xl font-black tracking-tighter">ABC</p>
                        <p className="text-[10px] text-white/40 uppercase font-bold">Inter Black</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-xl font-medium">abc</p>
                        <p className="text-[10px] text-white/40 uppercase font-bold">Inter Medium</p>
                      </div>
                    </div>
                  </div>

                  {/* Voice & Tone */}
                  <div className="bg-[#151515] border border-white/10 rounded-[24px] p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold uppercase tracking-tight">Voice</h3>
                      <Settings size={16} className="text-white/20" />
                    </div>
                    <div className="space-y-3">
                      {['Professional', 'Bold', 'Innovative', 'Direct'].map((v, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
                          <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest">{v}</span>
                          <CheckCircle2 size={14} className="text-yellow-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-[#151515] border border-white/10 rounded-[24px] p-8 flex flex-col md:flex-row items-center gap-8">
                  <div className="w-32 h-32 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                    <img 
                      src="https://static.wikia.nocookie.net/breakingbad/images/1/16/Saul_Goodman.jpg" 
                      className="w-full h-full object-cover opacity-50 grayscale" 
                      alt="Brand Logo" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 text-center md:text-left space-y-4">
                    <h3 className="text-2xl font-black uppercase tracking-tight">Brand Assets</h3>
                    <p className="text-white/40 text-sm max-w-xl">Your brand assets are automatically applied to all generated videos, avatars, and presentations to ensure a unified identity.</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                      <button className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold transition-all">Upload Logo</button>
                      <button className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold transition-all">Export Kit</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'interactive' ? (
              <motion.div 
                key="interactive"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto pt-12 space-y-12 relative z-10"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight uppercase px-4">
                    Interactive <span className="text-yellow-500">Video</span>
                  </h2>
                  <p className="text-white/40 text-base md:text-lg px-4">Create engaging videos with clickable hotspots and branches.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-[#151515] border border-white/10 rounded-[24px] md:rounded-[32px] p-6 md:p-8 space-y-4 md:space-y-6 hover:border-orange-500/30 transition-all group">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                      <Plus size={window.innerWidth < 768 ? 24 : 32} />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold">New Project</h3>
                    <p className="text-white/40 text-xs md:text-sm leading-relaxed">Start from scratch and build your interactive video journey.</p>
                    <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-white/10 transition-all">Create Project</button>
                  </div>
                  <div className="bg-[#151515] border border-white/10 rounded-[24px] md:rounded-[32px] p-6 md:p-8 space-y-4 md:space-y-6 hover:border-blue-500/30 transition-all group">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                      <History size={window.innerWidth < 768 ? 24 : 32} />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold">Recent Projects</h3>
                    <p className="text-white/40 text-xs md:text-sm leading-relaxed">Continue working on your existing interactive videos.</p>
                    <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-white/10 transition-all">View Projects</button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="coming-soon"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="w-24 h-24 rounded-[32px] bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 shadow-2xl shadow-yellow-500/5">
                  <Sparkles size={48} className="animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-4xl font-black tracking-tighter uppercase">
                    {activeTab.replace(/-/g, ' ')} <span className="text-yellow-500">Coming Soon</span>
                  </h2>
                  <p className="text-white/40 max-w-md mx-auto text-lg font-medium">
                    Our team is working hard to bring the <span className="text-white">{activeTab}</span> experience to life. Stay tuned for the Goodman update.
                  </p>
                </div>
                <button 
                  onClick={() => setActiveTab('photo-to-outfit')}
                  className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95"
                >
                  Return to Stylist
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error Message Overlay */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="fixed bottom-24 right-6 z-50 p-4 bg-red-500/10 border border-red-500/20 backdrop-blur-xl rounded-2xl flex items-center gap-3 text-red-400 max-w-sm shadow-2xl"
            >
              <AlertCircle size={20} />
              <p className="text-xs font-medium">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-white/20 hover:text-white">
                <Plus size={16} className="rotate-45" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          accept="image/*" 
          className="hidden" 
        />

        {/* Footer Branding */}
        <footer className="p-6 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
          <div>Powered by MOHAMED DARDARI</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white/40">
              Created by Mohameed.Dardari
              <a 
                href="https://www.instagram.com/mohameed.dardari?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#E4405F] hover:scale-125 transition-all hover:drop-shadow-[0_0_8px_rgba(228,64,95,0.6)]"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

const playClickSound = () => {
  const audio = new Audio('https://www.soundjay.com/buttons/button-16.mp3');
  audio.volume = 0.2;
  audio.play().catch(e => console.log("Audio play blocked by browser"));
};

function HomeCard({ icon, title, description, onClick, color }: { icon: React.ReactNode, title: string, description: string, onClick: () => void, color: string }) {
  const colors: Record<string, string> = {
    yellow: 'hover:border-yellow-500/50 group-hover:bg-yellow-500/10 text-yellow-500',
    blue: 'hover:border-blue-500/50 group-hover:bg-blue-500/10 text-blue-500',
    purple: 'hover:border-purple-500/50 group-hover:bg-purple-500/10 text-purple-500',
    emerald: 'hover:border-emerald-500/50 group-hover:bg-emerald-500/10 text-emerald-500',
    orange: 'hover:border-orange-500/50 group-hover:bg-orange-500/10 text-orange-500',
    cyan: 'hover:border-cyan-500/50 group-hover:bg-cyan-500/10 text-cyan-500',
  };

  const handleClick = () => {
    playClickSound();
    onClick();
  };

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`bg-[#151515] border border-white/10 rounded-[24px] md:rounded-[32px] p-6 md:p-8 cursor-pointer transition-all group ${colors[color].split(' ')[0]}`}
    >
      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center mb-4 md:mb-6 transition-all ${colors[color].split(' ')[1]} ${colors[color].split(' ')[2]}`}>
        {React.cloneElement(icon as React.ReactElement, { size: window.innerWidth < 768 ? 24 : 32 })}
      </div>
      <h3 className="text-xl md:text-2xl font-black tracking-tight text-white mb-2 uppercase">{title}</h3>
      <p className="text-white/40 text-xs md:text-sm font-medium leading-relaxed">{description}</p>
      <div className="mt-4 md:mt-6 flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white/20 group-hover:text-white/60 transition-colors">
        Launch Tool <ChevronRight size={14} />
      </div>
    </motion.div>
  );
}

function SidebarItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  const handleClick = () => {
    playClickSound();
    if (onClick) onClick();
  };

  return (
    <div 
      onClick={handleClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
      active ? 'bg-yellow-500/15 text-yellow-500 font-bold shadow-inner shadow-yellow-500/10' : 'text-white/80 hover:bg-white/10 hover:text-white'
    }`}>
      <div className={`${active ? 'text-yellow-500' : 'text-white/90'}`}>
        {icon}
      </div>
      <span className="text-sm">{label}</span>
      {active && <motion.div layoutId="active-pill" className="ml-auto w-1 h-4 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.5)]" />}
    </div>
  );
}
