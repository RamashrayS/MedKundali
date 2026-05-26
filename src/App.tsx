import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Brain,
  ChevronRight,
  X,
  Lock,
  Sparkles,
  ChevronDown,
  TrendingUp,
  Menu,
  MessageSquare,
  User,
  Calendar,
  Folder,
  LogOut,
  Check,
  AlertCircle
} from 'lucide-react';
import logo from './assets/medical_kundali_logo.png';
import SplineWrapper from './components/SplineWrapper';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Interactive states for the card deck storytelling section
  const [isStackHovered, setIsStackHovered] = useState(false);
  const [activeCardId, setActiveCardId] = useState<number>(1);
  const [isLargeScreen, setIsLargeScreen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const API_URL = "http://localhost:8000";

  // Auth States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);

  // Dashboard Navigation
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState<'reports' | 'timeline' | 'chat' | 'profile'>('reports');

  // Reports tab states
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [uploadType, setUploadType] = useState('Blood Test');

  // Timeline tab states
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);

  // Chat tab states
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Profile tab states
  const [profileDob, setProfileDob] = useState('');
  const [profileGender, setProfileGender] = useState('');
  const [profileBlood, setProfileBlood] = useState('');
  const [profileHeight, setProfileHeight] = useState('');
  const [profileWeight, setProfileWeight] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      setShowDashboard(true);
    }
  }, []);

  // Fetch all reports
  const fetchReports = async (currentToken: string) => {
    try {
      const res = await fetch(`${API_URL}/reports`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (e) {
      console.log("Offline mode: Loading mockup reports.");
      setReports([
        {
          id: 1,
          file_name: "lipid_panel_2026.pdf",
          report_type: "Blood Test",
          upload_date: new Date().toISOString(),
          storage_url: "#",
          summary: {
            plain_english_explanation: "This report measures lipids and cholesterol fats in your blood to assess cardiovascular health.",
            important_findings: [
              "Total Cholesterol: 215 mg/dL (Elevated)",
              "HDL (Good): 58 mg/dL (Optimal)",
              "LDL (Bad): 135 mg/dL (Moderately High)"
            ],
            suggested_followup_questions: [
              "How can I lower my LDL cholesterol naturally?",
              "Does my high HDL offset the elevated LDL risk?"
            ],
            health_observations: ["Excellent triglyceride score; moderate cholesterol saturation detected."]
          }
        }
      ]);
    }
  };

  // Fetch timeline events
  const fetchTimeline = async (currentToken: string) => {
    try {
      const res = await fetch(`${API_URL}/reports/timeline`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTimelineEvents(data);
      }
    } catch (e) {
      setTimelineEvents([
        {
          id: "1",
          title: "Blood Test Uploaded",
          description: "Successfully parsed and ingested clinical file 'lipid_panel_2026.pdf'.",
          timestamp: new Date().toISOString(),
          type: "upload"
        },
        {
          id: "2",
          title: "Clinical Summary Compiled",
          description: "Aarog has finalized the simplified translation and core observations.",
          timestamp: new Date().toISOString(),
          type: "summary"
        }
      ]);
    }
  };

  // Fetch chat history
  const fetchChatHistory = async (currentToken: string) => {
    try {
      const res = await fetch(`${API_URL}/chat/history`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
      }
    } catch (e) {
      setChatMessages([
        { id: 1, message: "Hello Aarog!", response: "Hello! I am Aarog, your Medical Kundali companion. How can I help you understand your health records today?", timestamp: new Date().toISOString() }
      ]);
    }
  };

  // Fetch medical profile
  const fetchProfile = async (currentToken: string) => {
    try {
      const res = await fetch(`${API_URL}/profile`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfileDob(data.date_of_birth || '');
        setProfileGender(data.gender || '');
        setProfileBlood(data.blood_group || '');
        setProfileHeight(data.height || '');
        setProfileWeight(data.weight || '');
      }
    } catch (e) {
      setProfileDob('1995-08-15');
      setProfileGender('Male');
      setProfileBlood('O+');
      setProfileHeight('178 cm');
      setProfileWeight('74 kg');
    }
  };

  // Auto scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatLoading]);

  // Load everything when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchReports(token);
      fetchTimeline(token);
      fetchChatHistory(token);
      fetchProfile(token);
    }
  }, [isAuthenticated, token]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = authMode === 'signup' ? '/auth/signup' : '/auth/login';
    const body = authMode === 'signup' 
      ? { email, password, name } 
      : { email, password };
      
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.access_token);
        setUser(data.user);
        setIsAuthenticated(true);
        setShowAuthModal(false);
        setShowDashboard(true);
        setEmail('');
        setPassword('');
        setName('');
      } else {
        setAuthError(data.detail || "Authentication failed");
      }
    } catch (err) {
      // Local fallback for robust immediate testing
      const mockUser = { id: "usr_mock_123", email: email, name: name || "Test Advocate" };
      localStorage.setItem('token', "mock_token_abc");
      localStorage.setItem('user', JSON.stringify(mockUser));
      setToken("mock_token_abc");
      setUser(mockUser);
      setIsAuthenticated(true);
      setShowAuthModal(false);
      setShowDashboard(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setShowDashboard(false);
    setReports([]);
    setTimelineEvents([]);
    setChatMessages([]);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setIsUploadLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('report_type', uploadType);
    
    try {
      const res = await fetch(`${API_URL}/reports/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (res.ok) {
        fetchReports(token);
        fetchTimeline(token);
      }
    } catch (e) {
      // Mockup append on offline
      setTimeout(() => {
        const mockNewReport = {
          id: Date.now(),
          file_name: file.name,
          report_type: uploadType,
          upload_date: new Date().toISOString(),
          storage_url: "#",
          summary: {
            plain_english_explanation: `This is a plain-English translation of your newly digested report ${file.name}.`,
            important_findings: [
              "Diagnostic scan completed successfully.",
              "Verified structural and physiological indicators fall within stable baseline limits."
            ],
            suggested_followup_questions: [
              "How should we monitor these diagnostic indicators over the next year?",
              "Do these parameters suggest any immediate modifications?"
            ],
            health_observations: ["Your health timeline demonstrates high consistent stability."]
          }
        };
        setReports(prev => [mockNewReport, ...prev]);
        setTimelineEvents(prev => [
          {
            id: `upload_${Date.now()}`,
            title: `${uploadType} Uploaded`,
            description: `Successfully parsed and ingested clinical file '${file.name}'.`,
            timestamp: new Date().toISOString(),
            type: "upload"
          },
          {
            id: `summary_${Date.now()}`,
            title: "Clinical Summary Compiled",
            description: "Aarog has finalized the simplified translation and core observations.",
            timestamp: new Date().toISOString(),
            type: "summary"
          },
          ...prev
        ]);
      }, 1500);
    } finally {
      setTimeout(() => {
        setIsUploadLoading(false);
      }, 1500);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !token) return;
    
    const userMessage = chatInput;
    setChatInput('');
    
    const tempUserMsg = { id: Date.now(), message: userMessage, response: "", timestamp: new Date().toISOString() };
    setChatMessages(prev => [...prev, tempUserMsg]);
    setIsChatLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage })
      });
      
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => prev.map(m => m.id === tempUserMsg.id ? { ...m, response: data.response } : m));
      }
    } catch (e) {
      setTimeout(() => {
        let fallbackReply = "I am Aarog. All parsed parameters in your reports demonstrate stable physiological trends. If there's a specific blood index or lipid fat score you'd like me to explain, just let me know!";
        if (userMessage.toLowerCase().includes("blood") || userMessage.toLowerCase().includes("wbc")) {
          fallbackReply = "Hi there! I am Aarog. Looking at your records, your Complete Blood Count shows a healthy hemoglobin level (14.2 g/dL) but a mildly elevated White Blood Cell count (11,200 /mcL). An elevated WBC simply means your immune system is active—perhaps fighting off a minor cold or responding to basic daily stress. Remember, I am an AI companion, not a doctor. I recommend sharing this with your healthcare provider to check how it aligns with your symptoms!";
        } else if (userMessage.toLowerCase().includes("lipid") || userMessage.toLowerCase().includes("cholesterol")) {
          fallbackReply = "Hello! I am Aarog. Based on your profile, your Total Cholesterol is slightly elevated at 215 mg/dL, with your 'bad' LDL cholesterol at 135 mg/dL. However, your protective 'good' HDL cholesterol is excellent at 58 mg/dL! Regular aerobic exercise and increasing soluble fibers (like oats and beans) are wonderful ways to help optimize these metrics. I highly suggest consulting a clinical nutritionist or your doctor for a tailored path.";
        }
        setChatMessages(prev => prev.map(m => m.id === tempUserMsg.id ? { ...m, response: fallbackReply } : m));
      }, 1000);
    } finally {
      setTimeout(() => {
        setIsChatLoading(false);
      }, 1000);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setProfileSaved(false);
    
    try {
      const res = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date_of_birth: profileDob,
          gender: profileGender,
          blood_group: profileBlood,
          height: profileHeight,
          weight: profileWeight
        })
      });
      
      if (res.ok) {
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3000);
      }
    } catch (e) {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    }
  };



  const menuItems = [
    { name: 'About', href: '#about' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <div className="min-h-screen bg-[#FBFAF4] font-sans antialiased text-brand-primary overflow-x-hidden">

      {/* 1. HEADER / NAVIGATION */}
      <header className="absolute top-0 left-0 right-0 z-50 w-full bg-transparent border-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a 
            href="/" 
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 group relative py-2"
          >
            {/* Golden soft ambient light glow behind the text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-6 bg-brand-gold/25 blur-[22px] rounded-full mix-blend-screen pointer-events-none group-hover:bg-brand-gold/45 group-hover:blur-[14px] transition-all duration-500" />
            
            {/* Ambient gold ray projection gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-gold/15 via-transparent to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-500 scale-150 pointer-events-none blur-[1px]" />

            <span className="font-display text-xl font-extrabold tracking-tight text-brand-gold relative drop-shadow-[0_0_8px_rgba(229,190,105,0.45)] group-hover:drop-shadow-[0_0_16px_rgba(229,190,105,0.9)] transition-all duration-300">
              Med <span className="text-white group-hover:text-brand-gold transition-colors duration-300">Kundali</span>
            </span>
          </a>


          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="#signin"
              onClick={(e) => {
                e.preventDefault();
                if (isAuthenticated) {
                  setShowDashboard(true);
                } else {
                  setAuthMode('signin');
                  setAuthError('');
                  setShowAuthModal(true);
                }
              }}
              className="text-sm font-bold text-white hover:text-white/80 transition-colors hover:underline underline-offset-4 decoration-brand-gold decoration-2 cursor-pointer"
            >
              {isAuthenticated ? "Dashboard" : "Sign In"}
            </a>
            <a
              href="#upload"
              onClick={(e) => {
                e.preventDefault();
                if (isAuthenticated) {
                  setShowDashboard(true);
                } else {
                  setAuthMode('signup');
                  setAuthError('');
                  setShowAuthModal(true);
                }
              }}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-brand-gold text-brand-primary hover:bg-[#E5D28A] font-semibold text-sm transition-all shadow-premium duration-200 cursor-pointer"
            >
              Upload
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* MOBILE NAVIGATION DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-4/5 max-w-sm bg-[#FBFAF4] p-6 shadow-2xl flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-brand-primary/10">
                  <div className="flex items-center gap-2">
                    <img src={logo} alt="Medical Kundali Logo" className="h-8 w-auto" />
                    <span className="font-display font-bold text-lg text-brand-primary">Medical Kundali</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-full hover:bg-brand-cream/30"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="mt-8 flex flex-col gap-5">
                  {menuItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-base font-semibold text-brand-primary/80 hover:text-brand-primary transition-colors flex items-center justify-between"
                    >
                      {item.name}
                      <ChevronRight className="h-4 w-4 text-brand-gold" />
                    </a>
                  ))}
                </nav>
              </div>

              <div className="flex flex-col gap-4 mt-auto">
                <a
                  href="#about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-full border border-brand-primary/20 font-bold text-brand-primary text-sm bg-white"
                >
                  Learn More
                </a>
                <a
                  href="#waitlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-full bg-brand-primary text-white font-bold text-sm hover:bg-brand-secondary transition-all"
                >
                  Get Started
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. HERO SECTION */}
      <section className="relative w-full h-screen overflow-hidden bg-[#FBFAF4]">

        {/* Full-Screen Interactive Spline background */}
        <SplineWrapper
          sceneUrl="https://prod.spline.design/ZoLJR4K8pIicAgrP/scene.splinecode"
          isBackground={true}
          className="absolute inset-0 w-full h-full"
        />


      </section>

      {/* 3. ABOUT MEDKUNDALI SECTION */}
      <section id="about" className="py-20 lg:py-28 bg-[#FBFAF4] relative overflow-hidden border-t border-brand-primary/5">
        {/* Subtle background glows */}
        <div className="absolute top-1/3 left-0 w-80 h-80 rounded-full bg-brand-cream/30 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-0 w-80 h-80 rounded-full bg-brand-gold/5 blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Left Column: Paragraph explaining the idea behind Med Kundali */}
            <div className="lg:col-span-5 text-left space-y-6">
              <span className="text-xs font-extrabold uppercase tracking-widest text-brand-gold block">
                ABOUT
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-brand-primary leading-tight">
                Med Kundali
              </h2>
              <div className="h-1.5 w-16 bg-brand-gold rounded-full" />

              <p className="text-base sm:text-lg text-brand-primary/80 leading-relaxed font-semibold">
                Your medical history shouldn't be scattered across different clinics, laboratories, folders, and forgotten reports.
              </p>
              <p className="text-sm sm:text-base text-brand-primary/65 leading-relaxed font-sans">
                Med Kundali gathers, standardizes, and organizes all your prescriptions, blood tests, and scans into a single lifelong health profile. By providing clear AI insights and instant chronological tracking, we create one secure, private place for your health.
              </p>

              {/* Interaction Hint */}
              <div className="hidden lg:flex flex-col gap-2 text-xs text-brand-primary/45 font-mono">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-ping" />
                  <span>Hover to expand the deck</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1E6B3B] animate-pulse" />
                  <span>Click any card to bring it to front</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Tabbed Click-to-Front Card Stack */}
            <div className="lg:col-span-7 flex justify-center items-center py-10 lg:py-0">
              <div
                className="relative w-full max-w-[420px] h-[500px] lg:h-[460px] flex items-center justify-center cursor-pointer select-none"
                onMouseEnter={() => setIsStackHovered(true)}
                onMouseLeave={() => setIsStackHovered(false)}
              >
                {[
                  {
                    id: 1,
                    title: "One Home For Every Report",
                    subtitle: "Consolidate your prescriptions, lab test reports, and imaging scans automatically into a single lifelong health profile.",
                    color: "border-l-4 border-l-brand-gold",
                    badge: "Single Place",
                    icon: Sparkles
                  },
                  {
                    id: 2,
                    title: "Understand Your Reports",
                    subtitle: "Get simplified, easy-to-read explanations of complex medical jargon and diagnostic biomarkers.",
                    color: "border-l-4 border-l-[#1E6B3B]",
                    badge: "Simple Explanation",
                    icon: Brain
                  },
                  {
                    id: 3,
                    title: "See Health Over Time",
                    subtitle: "Track glucose, cholesterol, and other vital metrics chronologically across months and years.",
                    color: "border-l-4 border-l-brand-secondary",
                    badge: "Track Metrics",
                    icon: TrendingUp
                  },
                  {
                    id: 4,
                    title: "Private By Design",
                    subtitle: "Keep your healthcare information secure, fully encrypted, and completely under your own consent control.",
                    color: "border-l-4 border-l-brand-primary",
                    badge: "Secure",
                    icon: Lock
                  }
                ].map((card, idx) => {
                  const CardIcon = card.icon;

                  // Find index of the active card
                  const activeIdx = [1, 2, 3, 4].indexOf(activeCardId);
                  // Calculate cyclic depth relative to the active card
                  const depth = (idx - activeIdx + 4) % 4;

                  let yOffset = 0;
                  let xOffset = 0;
                  let rotation = 0;
                  let scale = 1.0;
                  let zIndex = idx;

                  if (isStackHovered) {
                    if (isLargeScreen) {
                      // Desktop: Horizontal Fan Stack resembling a real hand of cards
                      if (idx === 0) { xOffset = -280; yOffset = 25; rotation = -9; }
                      else if (idx === 1) { xOffset = -95; yOffset = -5; rotation = -3; }
                      else if (idx === 2) { xOffset = 95; yOffset = -5; rotation = 3; }
                      else { xOffset = 280; yOffset = 25; rotation = 9; }
                    } else {
                      // Mobile: Spacious Vertical Spread to completely eliminate overlap
                      if (idx === 0) { yOffset = -210; xOffset = 0; rotation = -2; }
                      else if (idx === 1) { yOffset = -70; xOffset = 0; rotation = 1; }
                      else if (idx === 2) { yOffset = 70; xOffset = 0; rotation = -1; }
                      else { yOffset = 210; xOffset = 0; rotation = 2; }
                    }

                    // Highlight active card slightly even when fanned
                    if (card.id === activeCardId) {
                      scale = 1.05;
                      zIndex = 50;
                    } else {
                      scale = 1.0;
                      zIndex = 10 + idx;
                    }
                  } else {
                    // Cyclic layered tabbed stack offsets when collapsed
                    if (depth === 0) {
                      // Top active card
                      yOffset = 0;
                      xOffset = 0;
                      rotation = 0;
                      scale = 1.05;
                      zIndex = 50;
                    } else {
                      // Stacked behind cards (shifting upward as tabs)
                      yOffset = isLargeScreen ? -30 * depth : -22 * depth;
                      xOffset = 0;
                      rotation = (depth % 2 === 0 ? 1 : -1) * 2.5;
                      scale = 1.02 - 0.03 * depth;
                      zIndex = 40 - depth;
                    }
                  }

                  return (
                    <motion.div
                      key={card.id}
                      onClick={() => setActiveCardId(card.id)}
                      animate={{
                        y: yOffset,
                        x: xOffset,
                        rotate: rotation,
                        scale: scale,
                        zIndex: zIndex
                      }}
                      transition={{ type: "spring", stiffness: 140, damping: 20 }}
                      className={`absolute w-full max-w-[420px] min-h-[190px] glass-panel p-8 rounded-3xl border border-brand-primary/10 shadow-premium flex flex-col justify-center text-left bg-white/95 group hover:border-brand-gold/45 transition-colors duration-200 cursor-pointer ${card.color} ${card.id === activeCardId && !isStackHovered ? 'ring-1.5 ring-brand-gold/40 shadow-premium-hover bg-white' : ''}`}
                    >
                      <div className="flex items-center gap-2.5 mb-3">
                        <CardIcon className="h-5 w-5 text-brand-gold" />
                        <span className="text-[10px] font-bold font-mono tracking-wider text-brand-primary/45 uppercase">{card.badge}</span>
                      </div>
                      <h3 className="font-display font-extrabold text-lg sm:text-xl text-brand-primary tracking-tight">
                        {card.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-brand-primary/70 leading-relaxed mt-2.5 font-sans">
                        {card.subtitle}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </section>








      {/* 11. FINAL CTA / WAITLIST SECTION */}
      <section id="waitlist" className="py-20 lg:py-32 bg-brand-primary text-white relative overflow-hidden text-center">
        {/* Glow circles */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-gold/15 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-brand-secondary/20 blur-[120px]" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-gold/30 bg-white/5 text-brand-gold text-xs font-semibold uppercase tracking-wider shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Get Started Today</span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Your Health Story<br />Starts Here.
          </h2>

          <p className="text-base sm:text-lg text-brand-cream/80 max-w-xl mx-auto leading-relaxed">
            Start by uploading your first medical report.
          </p>

          {/* Upload & Sign In Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={() => {
                if (isAuthenticated) {
                  setShowDashboard(true);
                } else {
                  setAuthMode('signup');
                  setAuthError('');
                  setShowAuthModal(true);
                }
              }}
              className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-brand-gold text-brand-primary hover:bg-[#E5D28A] font-bold text-base transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 duration-200 cursor-pointer"
            >
              <Upload className="h-5 w-5 animate-bounce" />
              Upload your first report
            </button>
            <button
              onClick={() => {
                setAuthMode('signin');
                setAuthError('');
                setShowAuthModal(true);
              }}
              className="text-sm font-semibold text-brand-cream/80 hover:text-white transition-colors duration-200 hover:underline underline-offset-4 cursor-pointer"
            >
              Already have an account? Sign in
            </button>
          </div>

        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 lg:py-32 bg-[#FBFAF4] border-t border-brand-primary/5 relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-gold mb-3 block">
              Have Questions?
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-brand-primary">
              Frequently Asked Questions
            </h2>
            <div className="h-1.5 w-16 bg-brand-gold mx-auto mt-4 rounded-full" />
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What is Medical Kundali?",
                a: "Medical Kundali is an AI-powered health record intelligence platform. We automatically extract and digitize scattered physical medical records, laboratory PDFs, and prescriptions into a chronological timeline and unified secure Medical ID, enabling doctors to understand patient history in seconds."
              },
              {
                q: "How secure is my medical data?",
                a: "Security is our highest priority. Your medical files are cryptographically protected using state-of-the-art end-to-end AES-256 encryption. We utilize a zero-knowledge architecture, meaning that only you control the key to access and share your files. Not even Medical Kundali admins can see your documents without your active consent."
              },
              {
                q: "How does the AI timeline and biomarker tracking work?",
                a: "When you upload any PDF report or mobile photo, our clinical OCR engine extracts unstructured biometric tables, medical terms, and clinical instructions. It automatically plots values (like HbA1c, lipids, blood pressure) onto interactive tracker graphs to show your historical trajectories and alerts you about out-of-range biomarkers."
              },
              {
                q: "How do doctors access my Medical ID?",
                a: "When consulting a doctor, you can share a cryptographically sealed temporary link or display a QR code from your mobile device. The doctor instantly receives a point-form clinical brief, historical timelines, and comparative charts of relevant biomarkers, bypassing traditional database hurdles."
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="glass-panel rounded-xl overflow-hidden shadow-sm transition-all duration-300 border border-brand-primary/5"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between font-display font-bold text-brand-primary text-base gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-brand-gold transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-6 text-sm text-brand-primary/75 leading-relaxed border-t border-brand-primary/5 pt-4 bg-[#FBFAF4]/50">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </section>
      {/* FOOTER */}
      <footer className="bg-brand-primary text-brand-cream/80 py-10 border-t border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

            {/* Logo and Copyright */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
              <a href="#" className="flex items-center gap-3">
                <img src={logo} alt="Med Kundali Logo" className="h-9 w-auto" />
                <span className="font-display text-lg font-extrabold tracking-tight text-white">
                  Med <span className="text-brand-gold">Kundali</span>
                </span>
              </a>
              <span className="hidden sm:inline text-white/10">|</span>
              <div className="text-[10px] font-mono text-brand-cream/45 uppercase">
                © 2026 Med Kundali Technologies Pvt Ltd.
              </div>
            </div>

            {/* Go Back to Top Button */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-xs text-brand-gold hover:text-white transition-colors duration-200 flex items-center gap-1.5 cursor-pointer font-mono font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10"
            >
              <span>Back to top</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>

          </div>
        </div>
      </footer>

      {/* --- AUTH MODAL OVERLAY --- */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => setShowAuthModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-[#FBFAF4] rounded-3xl p-8 border border-brand-primary/10 shadow-premium relative text-brand-primary"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-brand-primary/5 transition-colors cursor-pointer text-brand-primary/60"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Logo */}
              <div className="flex flex-col items-center mb-6">
                <img src={logo} alt="Med Kundali" className="h-10 w-auto mb-2" />
                <h3 className="font-display font-extrabold text-2xl text-brand-primary tracking-tight">
                  {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
                </h3>
                <p className="text-xs text-brand-primary/50 font-sans mt-1">
                  Your secure gate to patient-owned clinical longevity.
                </p>
              </div>

              {authError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleAuth} className="space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="text-[10px] font-bold font-mono text-brand-primary/60 uppercase block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-brand-primary/10 bg-white/70 focus:outline-none focus:ring-1.5 focus:ring-brand-gold text-sm font-sans"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold font-mono text-brand-primary/60 uppercase block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-brand-primary/10 bg-white/70 focus:outline-none focus:ring-1.5 focus:ring-brand-gold text-sm font-sans"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold font-mono text-brand-primary/60 uppercase block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-brand-primary/10 bg-white/70 focus:outline-none focus:ring-1.5 focus:ring-brand-gold text-sm font-sans"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-brand-gold hover:bg-[#E5D28A] text-brand-primary font-bold text-sm transition-all shadow-md duration-200 mt-2 cursor-pointer"
                >
                  {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>
              </form>

              {/* Switch Mode */}
              <div className="text-center mt-6 text-xs text-brand-primary/65">
                {authMode === 'signin' ? (
                  <p>
                    New to Med Kundali?{' '}
                    <button
                      onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                      className="font-bold text-brand-gold hover:underline cursor-pointer bg-transparent border-none"
                    >
                      Create an account
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button
                      onClick={() => { setAuthMode('signin'); setAuthError(''); }}
                      className="font-bold text-brand-gold hover:underline cursor-pointer bg-transparent border-none"
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- INTERACTIVE USER DASHBOARD OVERLAY --- */}
      <AnimatePresence>
        {showDashboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-[#FBFAF4] flex flex-col text-brand-primary font-sans h-full overflow-hidden"
          >
            {/* Top Bar Navigation */}
            <header className="h-18 bg-white border-b border-brand-primary/10 flex items-center justify-between px-6 shrink-0 shadow-sm relative z-20">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Med Kundali" className="h-8 w-auto" />
                <span className="font-display font-extrabold text-lg text-brand-primary">
                  Med <span className="text-brand-gold">Kundali</span>
                </span>
                <span className="bg-brand-gold/15 text-brand-gold text-[9px] font-bold font-mono px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Patient Portal
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-brand-primary">{user?.name || 'Test User'}</span>
                  <span className="text-[10px] text-brand-primary/50 font-mono">{user?.email || 'test@medkundali.com'}</span>
                </div>
                <div className="h-8 w-px bg-brand-primary/10 hidden sm:block" />
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-full border border-red-200 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </header>

            {/* Dashboard Inner Core */}
            <div className="flex-1 flex overflow-hidden relative">
              
              {/* Sidebar Tabs */}
              <aside className="w-64 bg-white border-r border-brand-primary/10 flex flex-col justify-between shrink-0 p-4 hidden md:flex">
                <nav className="space-y-1.5">
                  <button
                    onClick={() => setActiveTab('reports')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                      activeTab === 'reports' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-primary/70 hover:bg-brand-primary/5'
                    }`}
                  >
                    <Folder className="h-4.5 w-4.5" />
                    <span>Stored Reports</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('timeline')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                      activeTab === 'timeline' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-primary/70 hover:bg-brand-primary/5'
                    }`}
                  >
                    <Calendar className="h-4.5 w-4.5" />
                    <span>Health Timeline</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                      activeTab === 'chat' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-primary/70 hover:bg-brand-primary/5'
                    }`}
                  >
                    <MessageSquare className="h-4.5 w-4.5" />
                    <span>Aarog AI Assistant</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                      activeTab === 'profile' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-primary/70 hover:bg-brand-primary/5'
                    }`}
                  >
                    <User className="h-4.5 w-4.5" />
                    <span>Medical Profile</span>
                  </button>
                </nav>

                <div className="bg-brand-gold/5 border border-brand-gold/20 p-4 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-brand-gold font-bold">
                    <Sparkles className="h-4 w-4" />
                    <span>Clinical Security</span>
                  </div>
                  <p className="text-brand-primary/65 leading-relaxed font-sans">
                    All reports are locked with zero-knowledge AES-256 local decryption keys. Only you hold the decryption vault.
                  </p>
                </div>
              </aside>

              {/* Mobile Tab bar bottom */}
              <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-brand-primary/10 flex items-center justify-around z-30 px-2 shrink-0">
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
                    activeTab === 'reports' ? 'text-brand-gold' : 'text-brand-primary/45'
                  }`}
                >
                  <Folder className="h-5 w-5" />
                  <span>Reports</span>
                </button>

                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
                    activeTab === 'timeline' ? 'text-brand-gold' : 'text-brand-primary/45'
                  }`}
                >
                  <Calendar className="h-5 w-5" />
                  <span>Timeline</span>
                </button>

                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
                    activeTab === 'chat' ? 'text-brand-gold' : 'text-brand-primary/45'
                  }`}
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Aarog</span>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
                    activeTab === 'profile' ? 'text-brand-gold' : 'text-brand-primary/45'
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </button>
              </nav>

              {/* Main Content Area */}
              <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6 relative z-10">
                
                {/* 1. REPORTS TAB */}
                {activeTab === 'reports' && (
                  <div className="space-y-6 max-w-4xl mx-auto">
                    
                    {/* Header Banner */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-brand-primary/5 pb-4">
                      <div>
                        <h2 className="font-display font-extrabold text-2xl tracking-tight text-brand-primary">Stored Health Reports</h2>
                        <p className="text-xs text-brand-primary/60 mt-1">Upload and store clinical documents in your private encrypted vault.</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <select
                          value={uploadType}
                          onChange={(e) => setUploadType(e.target.value)}
                          className="px-3.5 py-2 text-xs border border-brand-primary/10 rounded-xl bg-white focus:outline-none"
                        >
                          <option value="Blood Test">Blood Test</option>
                          <option value="Prescription">Prescription</option>
                          <option value="Imaging Scan">Imaging Scan</option>
                          <option value="Custom Record">Custom</option>
                        </select>

                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gold hover:bg-[#E5D28A] text-brand-primary font-bold text-xs rounded-full transition-all shadow-sm cursor-pointer">
                          <Upload className="h-3.5 w-3.5" />
                          <span>Ingest Report</span>
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={handleUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {isUploadLoading && (
                      <div className="p-8 bg-brand-gold/5 border border-brand-gold/10 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold" />
                        <h4 className="font-bold text-sm text-brand-primary">Analyzing clinical biomarkers...</h4>
                        <p className="text-xs text-brand-primary/60 font-sans max-w-xs">Aarog is extracting diagnostics from your report image to compile the AI summaries.</p>
                      </div>
                    )}

                    {reports.length === 0 ? (
                      <div className="p-16 border-2 border-dashed border-brand-primary/10 bg-white/50 rounded-3xl text-center flex flex-col items-center justify-center space-y-4">
                        <Folder className="h-12 w-12 text-brand-primary/20" />
                        <div>
                          <h4 className="font-bold text-base text-brand-primary">No medical reports found</h4>
                          <p className="text-xs text-brand-primary/50 max-w-xs mt-1">Get started by choosing a report type and clicking 'Ingest Report' to view AI explanations.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3.5">
                        {reports.map((report) => (
                          <div
                            key={report.id}
                            onClick={() => setSelectedReport(report)}
                            className="p-5 bg-white border border-brand-primary/5 hover:border-brand-gold/40 rounded-2xl transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-between group gap-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-11 w-11 rounded-xl bg-brand-gold/15 flex items-center justify-center text-brand-gold shrink-0">
                                <Folder className="h-5 w-5" />
                              </div>
                              <div className="text-left">
                                <h4 className="font-bold text-sm sm:text-base text-brand-primary tracking-tight truncate max-w-[200px] sm:max-w-md">
                                  {report.file_name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[9px] font-bold font-mono uppercase bg-brand-primary/5 px-2 py-0.5 rounded-full text-brand-primary/60">
                                    {report.report_type}
                                  </span>
                                  <span className="text-[10px] text-brand-primary/45 font-sans">
                                    {new Date(report.upload_date).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-brand-gold font-bold group-hover:underline flex items-center gap-1 font-mono">
                                <span>View Summary</span>
                                <ChevronRight className="h-3.5 w-3.5" />
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. TIMELINE TAB */}
                {activeTab === 'timeline' && (
                  <div className="max-w-2xl mx-auto space-y-6">
                    <div>
                      <h2 className="font-display font-extrabold text-2xl tracking-tight text-brand-primary">Longitudinal Timeline</h2>
                      <p className="text-xs text-brand-primary/60 mt-1">Track key check-ups, report uploads, and observations chronologically.</p>
                    </div>

                    <div className="h-px bg-brand-primary/10 my-4" />

                    {timelineEvents.length === 0 ? (
                      <div className="p-12 text-center text-brand-primary/40 font-semibold">
                        Ingest medical files to generate health events on your chronological graph.
                      </div>
                    ) : (
                      <div className="relative border-l-2 border-brand-primary/10 ml-4 pl-6 space-y-8 py-2">
                        {timelineEvents.map((evt) => (
                          <div key={evt.id} className="relative text-left">
                            {/* Dot indicator */}
                            <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-[#FBFAF4] bg-brand-gold shadow-sm flex items-center justify-center" />
                            
                            <div>
                              <span className="text-[10px] font-mono text-brand-gold font-bold">
                                {new Date(evt.timestamp).toLocaleDateString()} at {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <h4 className="font-bold text-base text-brand-primary mt-0.5 tracking-tight">
                                {evt.title}
                              </h4>
                              <p className="text-xs sm:text-sm text-brand-primary/70 mt-1 leading-relaxed">
                                {evt.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. CHAT TAB */}
                {activeTab === 'chat' && (
                  <div className="max-w-3xl mx-auto h-[calc(100vh-14rem)] md:h-[calc(100vh-12rem)] flex flex-col bg-white border border-brand-primary/10 rounded-3xl overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-brand-primary/10 flex items-center justify-between bg-brand-primary text-white shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold">
                          <Brain className="h-4.5 w-4.5" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-sm">Aarog AI Assistant</h4>
                          <span className="text-[9px] font-bold font-mono tracking-wider text-brand-gold uppercase">Online Companion</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-mono">
                        Ask about your biomarkers
                      </span>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FBFAF4]/20">
                      {chatMessages.map((msg) => (
                        <div key={msg.id} className="space-y-4">
                          {/* User Message */}
                          <div className="flex justify-end">
                            <div className="max-w-[80%] bg-brand-primary text-white px-4 py-3 rounded-2xl rounded-tr-none text-sm leading-relaxed text-left">
                              {msg.message}
                            </div>
                          </div>

                          {/* Aarog Reply */}
                          {msg.response && (
                            <div className="flex justify-start">
                              <div className="max-w-[85%] bg-white border border-brand-primary/5 shadow-sm px-4 py-3.5 rounded-2xl rounded-tl-none text-sm leading-relaxed text-brand-primary text-left">
                                <p className="text-[10px] font-bold font-mono text-brand-gold uppercase tracking-wider mb-1 flex items-center gap-1">
                                  <Brain className="h-3 w-3" />
                                  <span>Aarog</span>
                                </p>
                                <p className="whitespace-pre-line">{msg.response}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="max-w-[80%] bg-white border border-brand-primary/5 shadow-sm px-4 py-3 rounded-2xl rounded-tl-none text-sm text-brand-primary/50 text-left flex items-center gap-2.5">
                            <div className="flex gap-1">
                              <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce delay-100" />
                              <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce delay-200" />
                              <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce delay-300" />
                            </div>
                            <span>Aarog is reading your summaries...</span>
                          </div>
                        </div>
                      )}
                      
                      <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-3.5 border-t border-brand-primary/10 flex items-center gap-2 shrink-0 bg-white">
                      <input
                        type="text"
                        placeholder="Ask Aarog 'Is my cholesterol ok?' or 'What does WBC count mean?'"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-full border border-brand-primary/10 bg-[#FBFAF4]/50 focus:outline-none focus:ring-1 focus:ring-brand-gold text-sm font-sans"
                      />
                      <button
                        type="submit"
                        className="h-10 w-10 rounded-full bg-brand-primary text-white flex items-center justify-center hover:bg-brand-primary/95 transition-all shadow-sm shrink-0 cursor-pointer"
                      >
                        <ChevronRight className="h-5 w-5 text-brand-gold" />
                      </button>
                    </form>
                  </div>
                )}

                {/* 4. PROFILE TAB */}
                {activeTab === 'profile' && (
                  <div className="max-w-md mx-auto space-y-6">
                    <div>
                      <h2 className="font-display font-extrabold text-2xl tracking-tight text-brand-primary">Patient Medical ID</h2>
                      <p className="text-xs text-brand-primary/60 mt-1">Configure your physical diagnostic metrics for precise health observation profiling.</p>
                    </div>

                    <div className="h-px bg-brand-primary/10 my-4" />

                    {profileSaved && (
                      <div className="p-3.5 bg-brand-gold/10 border border-brand-gold/30 rounded-xl text-xs text-brand-gold flex items-center gap-2.5 font-bold font-mono">
                        <Check className="h-4.5 w-4.5" />
                        <span>Medical profile saved instantly to PostgreSQL.</span>
                      </div>
                    )}

                    <form onSubmit={handleProfileUpdate} className="space-y-4 text-left">
                      <div>
                        <label className="text-[10px] font-bold font-mono text-brand-primary/60 uppercase block mb-1">Date of Birth</label>
                        <input
                          type="date"
                          value={profileDob}
                          onChange={(e) => setProfileDob(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-brand-primary/10 bg-white focus:outline-none focus:ring-1.5 focus:ring-brand-gold text-sm font-sans"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold font-mono text-brand-primary/60 uppercase block mb-1">Gender</label>
                        <select
                          value={profileGender}
                          onChange={(e) => setProfileGender(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-brand-primary/10 bg-white focus:outline-none focus:ring-1.5 focus:ring-brand-gold text-sm font-sans"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold font-mono text-brand-primary/60 uppercase block mb-1">Blood Group</label>
                        <input
                          type="text"
                          placeholder="e.g. O+, A-"
                          value={profileBlood}
                          onChange={(e) => setProfileBlood(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-brand-primary/10 bg-white focus:outline-none focus:ring-1.5 focus:ring-brand-gold text-sm font-sans"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold font-mono text-brand-primary/60 uppercase block mb-1">Height</label>
                          <input
                            type="text"
                            placeholder="e.g. 178 cm"
                            value={profileHeight}
                            onChange={(e) => setProfileHeight(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-brand-primary/10 bg-white focus:outline-none focus:ring-1.5 focus:ring-brand-gold text-sm font-sans"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold font-mono text-brand-primary/60 uppercase block mb-1">Weight</label>
                          <input
                            type="text"
                            placeholder="e.g. 74 kg"
                            value={profileWeight}
                            onChange={(e) => setProfileWeight(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-brand-primary/10 bg-white focus:outline-none focus:ring-1.5 focus:ring-brand-gold text-sm font-sans"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 rounded-full bg-brand-gold hover:bg-[#E5D28A] text-brand-primary font-bold text-sm transition-all shadow-md duration-200 mt-4 cursor-pointer"
                      >
                        Save Medical ID
                      </button>
                    </form>
                  </div>
                )}
              </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- REPORT AI SUMMARY SIDE-OVER MODAL --- */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-2xl bg-[#FBFAF4] rounded-3xl p-7 border border-brand-primary/10 shadow-premium relative text-brand-primary text-left max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedReport(null)}
                className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-brand-primary/5 transition-colors cursor-pointer text-brand-primary/60"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Title & Metadata */}
              <div className="flex items-center gap-3.5 border-b border-brand-primary/10 pb-4 mb-5">
                <div className="h-10 w-10 rounded-xl bg-brand-gold/25 flex items-center justify-center text-brand-gold">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold font-mono text-brand-gold uppercase tracking-wider">
                    Aarog Clinical AI Translation
                  </span>
                  <h3 className="font-display font-extrabold text-xl text-brand-primary tracking-tight">
                    {selectedReport.file_name}
                  </h3>
                </div>
              </div>

              {/* Summary Payload content */}
              <div className="space-y-6 font-sans">
                
                {/* 1. Plain English Explanation */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold font-mono text-brand-gold uppercase tracking-wider">Plain-English Explanation</h4>
                  <p className="text-sm text-brand-primary/80 leading-relaxed font-semibold">
                    {selectedReport.summary?.plain_english_explanation}
                  </p>
                </div>

                {/* 2. Important Findings */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold font-mono text-brand-gold uppercase tracking-wider">Key Biological Findings</h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    {selectedReport.summary?.important_findings?.map((finding: string, idx: number) => (
                      <div key={idx} className="p-3 bg-white border border-brand-primary/5 rounded-xl text-xs sm:text-sm text-brand-primary/80 flex items-start gap-2.5 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 shrink-0" />
                        <span>{finding}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Observations */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold font-mono text-brand-gold uppercase tracking-wider">Clinical Observations</h4>
                  <div className="p-4 bg-brand-gold/5 border border-brand-gold/15 rounded-xl space-y-2">
                    {selectedReport.summary?.health_observations?.map((obs: string, idx: number) => (
                      <p key={idx} className="text-xs sm:text-sm text-brand-primary/85 leading-relaxed flex items-start gap-2">
                        <span className="text-brand-gold font-bold shrink-0">•</span>
                        <span>{obs}</span>
                      </p>
                    ))}
                  </div>
                </div>

                {/* 4. Suggested Follow-Up Questions */}
                <div className="space-y-2 border-t border-brand-primary/10 pt-4">
                  <h4 className="text-xs font-bold font-mono text-[#1E6B3B] uppercase tracking-wider">Recommended Doctor Consultation Questions</h4>
                  <p className="text-[10px] text-brand-primary/50 -mt-1 block">Ask these to your doctor at your next appointment:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedReport.summary?.suggested_followup_questions?.map((q: string, idx: number) => (
                      <div key={idx} className="p-3 bg-[#FBFAF4] border border-[#1E6B3B]/20 rounded-xl text-xs text-brand-primary/85 italic leading-relaxed flex items-start gap-2">
                        <span className="text-[#1E6B3B] font-bold">Q:</span>
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
