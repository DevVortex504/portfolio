import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Cpu, Zap, Activity, Battery, Crosshair, Sun, Moon, ArrowUpRight, Github, Linkedin, Mail, Menu, X, ExternalLink } from 'lucide-react';

/**
 * UTILITY: Random character generator for the decoding effect
 */
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&";
const randomChar = () => chars[Math.floor(Math.random() * chars.length)];

/**
 * COMPONENT: Decrypting Text Animation
 * Decodes text from random characters to final string
 */
const DecryptText = ({ text, className, speed = 50 }) => {
  const [display, setDisplay] = useState(text.split('').map(() => randomChar()).join(''));
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(prev => 
        text.split('').map((letter, index) => {
          if (index < iteration) return text[index];
          return randomChar();
        }).join('')
      );
      
      if (iteration >= text.length) {
        clearInterval(interval);
        setCompleted(true);
        setDisplay(text); 
      }
      iteration += 1 / 2; // Decrypt speed factor
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <span className={`${className} ${completed ? '' : 'animate-pulse'}`}>{display}</span>;
};

/**
 * COMPONENT: Background Grid & Crosshair
 * Renders a technical grid and follows mouse with crosshairs
 */
const TechBackground = ({ theme }) => {
  const canvasRef = useRef(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const isDark = theme === 'dark';
      const color = isDark ? 'rgba(0, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
      const activeColor = isDark ? 'rgba(0, 255, 255, 0.8)' : 'rgba(255, 69, 0, 0.8)';
      const gridSize = 40;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw Grid
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw Crosshair at Mouse
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 1;
      
      // Horizontal Line
      ctx.beginPath();
      ctx.moveTo(0, mouse.y);
      ctx.lineTo(canvas.width, mouse.y);
      ctx.stroke();

      // Vertical Line
      ctx.beginPath();
      ctx.moveTo(mouse.x, 0);
      ctx.lineTo(mouse.x, canvas.height);
      ctx.stroke();

      // Coordinates Text next to cursor
      ctx.fillStyle = activeColor;
      ctx.font = '10px monospace';
      ctx.fillText(`X:${mouse.x} Y:${mouse.y}`, mouse.x + 10, mouse.y - 10);
      
      // Decorative "Target" corners around mouse
      const size = 20;
      const gap = 5;
      ctx.beginPath();
      // Top Left
      ctx.moveTo(mouse.x - size, mouse.y - gap);
      ctx.lineTo(mouse.x - size, mouse.y - size);
      ctx.lineTo(mouse.x - gap, mouse.y - size);
      // Top Right
      ctx.moveTo(mouse.x + gap, mouse.y - size);
      ctx.lineTo(mouse.x + size, mouse.y - size);
      ctx.lineTo(mouse.x + size, mouse.y - gap);
      // Bottom Right
      ctx.moveTo(mouse.x + size, mouse.y + gap);
      ctx.lineTo(mouse.x + size, mouse.y + size);
      ctx.lineTo(mouse.x + gap, mouse.y + size);
      // Bottom Left
      ctx.moveTo(mouse.x - gap, mouse.y + size);
      ctx.lineTo(mouse.x - size, mouse.y + size);
      ctx.lineTo(mouse.x - size, mouse.y + gap);
      ctx.stroke();
    };

    render();
    window.addEventListener('resize', render);
    return () => {
      window.removeEventListener('resize', render);
    };
  }, [theme, mouse]);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0" />;
};

/**
 * COMPONENT: Terminal Typing Animation
 * Types out text character by character like a terminal
 */
const TerminalTyping = ({ text, delay = 50, onComplete }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [hasStarted]);

  useEffect(() => {
    if (hasStarted && currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    } else if (currentIndex >= text.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, text, delay, onComplete, hasStarted]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <span ref={containerRef}>
      {displayText}
      {currentIndex < text.length && <span className={showCursor ? 'opacity-100' : 'opacity-0'}>_</span>}
    </span>
  );
};

/**
 * COMPONENT: Advanced Email Verification Modal
 * Shows hCaptcha image verification before revealing email
 */
const EmailVerificationModal = ({ isOpen, onClose, onVerified, theme, colors }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(false);
  const captchaRef = useRef(null);

  useEffect(() => {
    if (isOpen && window.hcaptcha) {
      // Reset captcha when modal opens
      setError(false);
      setIsVerifying(false);
      
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        if (captchaRef.current && !captchaRef.current.hasChildNodes()) {
          window.hcaptcha.render(captchaRef.current, {
            sitekey: 'a40e02e6-aa38-4c06-b7c8-1f2648da4748', // hCaptcha test key - replace with your real key
            theme: theme === 'dark' ? 'dark' : 'light',
            callback: (token) => {
              setIsVerifying(true);
              // Verify successful
              setTimeout(() => {
                onVerified();
                onClose();
              }, 500);
            },
            'error-callback': () => {
              setError(true);
            },
            'expired-callback': () => {
              setError(true);
            }
          });
        }
      }, 100);
    }
  }, [isOpen, theme, onVerified, onClose]);

  const handleClose = () => {
    if (captchaRef.current) {
      try {
        window.hcaptcha.reset(captchaRef.current);
      } catch (e) {
        // Ignore reset errors
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-auto" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      <div 
        className={`relative ${colors.cardBg} border-2 ${colors.border} rounded-lg p-8 max-w-md w-full shadow-2xl cursor-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold uppercase">Verify You're Human</h3>
          <button onClick={handleClose} className={`${colors.dim} hover:${colors.text} cursor-pointer`}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="mb-6">
          <p className={`text-sm mb-4 font-mono ${colors.dim}`}>
            Complete the challenge below to access contact information
          </p>
          
          {/* hCaptcha container */}
          <div ref={captchaRef} className="flex justify-center"></div>
          
          {isVerifying && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500 rounded text-center">
              <p className="text-green-500 text-sm font-bold">✓ Verification successful!</p>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500 rounded">
              <p className="text-red-500 text-sm font-bold">❌ Verification failed. Please try again.</p>
            </div>
          )}
        </div>
        
        <p className={`text-xs text-center ${colors.dim}`}>
          Protected by hCaptcha • Anti-bot verification
        </p>
      </div>
    </div>
  );
};

/**
 * COMPONENT: Project Detail Modal
 * Shows detailed information about a project
 */
const ProjectModal = ({ project, isOpen, onClose, theme, colors }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 cursor-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-auto"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto border-4 ${colors.border} ${colors.bg} p-8 shadow-2xl cursor-auto`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 ${colors.hover} transition-colors cursor-pointer`}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className={`flex items-center gap-4 mb-4`}>
            <div className={`${colors.accent}`}>{project.icon}</div>
            <span className={`text-xs font-bold border px-3 py-1 ${colors.border}`}>PRJ-{project.id}00</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black uppercase mb-4">{project.title}</h2>
          <p className={`text-lg ${colors.dim}`}>{project.desc}</p>
        </div>

        {/* Project Image */}
        {project.image && (
          <div className="mb-8 border-4 border-zinc-700 overflow-hidden">
            <img 
              src={project.image} 
              alt={project.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Tech Stack */}
        <div className="mb-8">
          <h3 className="text-xl font-bold uppercase mb-4 flex items-center gap-2">
            <span className={`${colors.accent}`}>&gt;&gt;</span> Tech Stack
          </h3>
          <div className="flex flex-wrap gap-2">
            {project.stack.map(tech => (
              <span key={tech} className={`text-xs font-bold uppercase tracking-wider border ${colors.border} px-3 py-2`}>
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Detailed Description */}
        {project.details && (
          <div className="mb-8">
            <h3 className="text-xl font-bold uppercase mb-4 flex items-center gap-2">
              <span className={`${colors.accent}`}>&gt;&gt;</span> Overview
            </h3>
            <div className={`text-sm leading-relaxed space-y-4 ${colors.dim}`}>
              {project.details.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}

        {/* Key Features */}
        {project.features && (
          <div className="mb-8">
            <h3 className="text-xl font-bold uppercase mb-4 flex items-center gap-2">
              <span className={`${colors.accent}`}>&gt;&gt;</span> Key Features
            </h3>
            <ul className="space-y-2">
              {project.features.map((feature, idx) => (
                <li key={idx} className={`flex items-start gap-3 text-sm ${colors.dim}`}>
                  <span className={`${colors.accent} mt-1`}>▸</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Links */}
        {(project.github || project.demo) && (
          <div className="flex flex-wrap gap-4">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-6 py-3 border ${colors.border} ${colors.hover} transition-colors font-bold uppercase text-sm`}
              >
                <Github className="w-5 h-5" />
                View Code
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-6 py-3 border ${colors.border} ${colors.hover} transition-colors font-bold uppercase text-sm`}
              >
                <ArrowUpRight className="w-5 h-5" />
                Live Demo
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * COMPONENT: Terminal Contact Section
 * Shows terminal with sequential output animations
 */
const TerminalContact = ({ theme, colors }) => {
  const [typingComplete, setTypingComplete] = useState(false);
  const [showLine1, setShowLine1] = useState(false);
  const [showLine2, setShowLine2] = useState(false);
  const [showLine3, setShowLine3] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // Track what action triggered verification

  // Obfuscated email - Base64 encoded to hide from scrapers
  const getEmail = () => {
    // This decodes to: debsharmatrishit@gmail.com
    return atob('ZGVic2hhcm1hdHJpc2hpdEBnbWFpbC5jb20=');
  };

  const handleTypingComplete = () => {
    setTypingComplete(true);
    setTimeout(() => setShowLine1(true), 200);
    setTimeout(() => setShowLine2(true), 100);
    setTimeout(() => setShowLine3(true), 110);
    setTimeout(() => setShowButtons(true), 120);
  };

  const handleEmailClick = (e) => {
    if (!isVerified) {
      e.preventDefault();
      setPendingAction('email');
      setShowEmailModal(true);
    }
  };

  const handleVerified = () => {
    setIsVerified(true);
    // Open mailto link after verification
    window.location.href = `mailto:${getEmail()}`;
  };

  const handleCopyEmail = () => {
    if (isVerified) {
      navigator.clipboard.writeText(getEmail());
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } else {
      setPendingAction('copy');
      setShowEmailModal(true);
    }
  };

  const handleModalVerified = () => {
    setIsVerified(true);
    
    // Execute the pending action after verification
    if (pendingAction === 'copy') {
      navigator.clipboard.writeText(getEmail());
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } else if (pendingAction === 'email') {
      window.location.href = `mailto:${getEmail()}`;
    }
    
    setPendingAction(null);
  };

  return (
    <footer id="contact" className="py-24 mt-20">
      <EmailVerificationModal 
        isOpen={showEmailModal} 
        onClose={() => setShowEmailModal(false)} 
        onVerified={handleModalVerified}
        theme={theme}
        colors={colors}
      />
      <div className="max-w-4xl mx-auto">
        <div className={`text-sm font-bold mb-8 ${colors.accent}`}>
          // 03. CONTACT
        </div>
        
        {/* Mac Terminal Window */}
        <div className={`${colors.cardBg} border ${colors.border} rounded-lg overflow-hidden shadow-2xl`}>
          {/* Terminal Header */}
          <div className={`flex items-center gap-2 px-4 py-3 border-b ${colors.border} ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className={`text-xs font-mono ml-auto ${colors.dim}`}>terminal — bash — 80x24</div>
          </div>
          
          {/* Terminal Content */}
          <div className="p-6 font-mono text-sm">
            <div className={`mb-4 ${colors.dim}`}>
              Last login: {new Date().toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })}
            </div>
            <div className="text-blue-500 mb-4">
              Welcome to Trishit Debsharma's Portfolio System
            </div>
            
            <div className="mb-6">
              <span className="text-blue-500">root@trishit:~$</span>{' '}
              <TerminalTyping text="./contact.sh --initiate" delay={40} onComplete={handleTypingComplete} />
            </div>
            
            {showLine1 && <div className={`mb-2 ${colors.dim}`}>&gt; Initializing communication link...</div>}
            {showLine2 && <div className={`mb-2 ${colors.dim}`}>&gt; Connection established.</div>}
            {showLine3 && <div className="text-blue-500 mb-6">&gt; Ready to receive transmission.</div>}
            
            {/* Contact Options */}
            {showButtons && (
              <div className="space-y-3">
                <a 
                  href="#contact" 
                  onClick={handleEmailClick}
                  className={`flex items-center gap-3 p-4 border ${colors.border} ${colors.hover} transition-colors group cursor-pointer`}
                >
                  <Mail className="w-5 h-5" />
                  <span className="font-bold">SEND_EMAIL</span>
                  {!isVerified && <span className="ml-auto text-xs opacity-50">[VERIFY]</span>}
                </a>
                
                <a 
                  href="https://github.com/DevVortex504" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 p-4 border ${colors.border} ${colors.hover} transition-colors group`}
                >
                  <Github className="w-5 h-5" />
                  <span className="font-bold">GITHUB</span>
                </a>
                
                <a 
                  href="https://www.linkedin.com/in/trishit-debsharma" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 p-4 border ${colors.border} ${colors.hover} transition-colors group`}
                >
                  <Linkedin className="w-5 h-5" />
                  <span className="font-bold">LINKEDIN</span>
                </a>
                
                <button 
                  onClick={handleCopyEmail}
                  className={`w-full flex items-center gap-3 p-4 border ${colors.border} ${copied ? 'bg-green-500/20 border-green-500' : colors.hover} transition-colors group relative`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="font-bold">{copied ? '✓ EMAIL_COPIED' : 'COPY_EMAIL'}</span>
                  {!isVerified && !copied && <span className="ml-auto text-xs opacity-50">[VERIFY]</span>}
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center mt-12 text-[10px] opacity-30 font-mono">
          © 2026 TRISHIT DEBSHARMA // ELECTRICAL ENGINEERING PORTFOLIO // V.2.0.0
        </div>
      </div>
    </footer>
  );
};

/**
 * COMPONENT: Scroll Reveal Text
 * Lines reveal based on exact scroll position
 */
const ScrollRevealSection = ({ children, theme }) => {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far the element is through the viewport
      const start = windowHeight * 0.8;
      const end = windowHeight * 0.2;
      
      let p = (start - rect.top) / (start - end);
      p = Math.max(0, Math.min(1, p));
      
      setProgress(p);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const lines = children.split('\n').filter(l => l.trim().length > 0);

  return (
    <div ref={containerRef} className="relative py-2 my-2 md:py-4 md:my-4">
      <div className="flex flex-col gap-2 md:gap-4">
        {lines.map((line, i) => {
          const lineTrigger = i / lines.length;
          const isVisible = progress > lineTrigger;
          
          return (
            <p 
              key={i} 
              className={`text-2xl md:text-4xl font-bold uppercase transition-opacity duration-75 ${isVisible ? 'opacity-100' : 'opacity-10'}`}
              style={{ 
                transform: `translateX(${isVisible ? '0' : '-20px'})`,
                transition: 'all 0.1s linear' 
              }}
            >
              {line}
            </p>
          );
        })}
      </div>
    </div>
  );
};

/**
 * MAIN APP COMPONENT
 */
export default function App() {
  const [theme, setTheme] = useState('dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // Obfuscated email getter
  const getEmail = () => atob('ZGVic2hhcm1hdHJpc2hpdEBnbWFpbC5jb20=');

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const handleHeroEmailClick = (e) => {
    if (!isEmailVerified) {
      e.preventDefault();
      setShowEmailModal(true);
    }
  };

  const handleEmailVerified = () => {
    setIsEmailVerified(true);
    window.location.href = `mailto:${getEmail()}`;
  };

  // Colors based on theme
  const colors = theme === 'dark' ? {
    bg: 'bg-zinc-950',
    text: 'text-zinc-100',
    accent: 'text-cyan-400',
    border: 'border-zinc-800',
    cardBg: 'bg-zinc-900',
    hover: 'hover:bg-cyan-900',
    hoverText: 'hover:text-cyan-400',
    dim: 'text-zinc-500'
  } : {
    bg: 'bg-zinc-50',
    text: 'text-zinc-900',
    accent: 'text-orange-600',
    border: 'border-zinc-300',
    cardBg: 'bg-white',
    hover: 'hover:bg-orange-100',
    hoverText: 'hover:text-orange-600',
    dim: 'text-zinc-400'
  };

  const navLinks = [
    { label: '// HOME', id: 'hero' },
    { label: '// ABOUT', id: 'about' },
    { label: '// PROJECTS', id: 'projects' },
    { label: '// CONTACT', id: 'contact' },
  ];

  const projects = [
    {
      id: 1,
      title: "Autonomous Precision Ag. System",
      desc: "Dual-drone fleet coordination using custom Pixhawk firmware. Implements SLAM for crop mapping and localized spraying.",
      stack: ["C++", "Python", "LIDAR", "Jetson Nano", "Pixhawk"],
      icon: <Crosshair className="w-6 h-6" />,
      image: "/portfolio/images/hexa.jpg",
      details: "Developed a coordinated dual-drone system for precision agriculture, featuring custom firmware modifications to Pixhawk flight controllers. The system implements real-time SLAM (Simultaneous Localization and Mapping) using LIDAR sensors for accurate crop mapping and enables targeted pesticide spraying with minimal environmental impact.\n\nThe project integrates computer vision algorithms running on Jetson Nano edge computing devices for real-time crop health analysis. Custom communication protocols ensure reliable coordination between drones, preventing coverage overlap and optimizing flight paths for maximum efficiency.",
      features: [
        "Custom Pixhawk firmware with extended telemetry and control APIs",
        "Real-time SLAM implementation using LIDAR point cloud processing",
        "Computer vision-based crop health monitoring with anomaly detection",
        "Multi-drone coordination with collision avoidance algorithms",
        "Precision spraying system with variable flow control",
        "Ground station software for mission planning and monitoring"
      ],
      github: null,
      demo: null
    },
    {
      id: 2,
      title: "Mars Yard Autonomous Rover",
      desc: "6-wheel rover featuring ROS-based navigation stack, rough terrain traversal, and object manipulation.",
      stack: ["ROS", "RealSense D435", "Ubuntu", "Python", "MoveIt"],
      icon: <Cpu className="w-6 h-6" />,
      details: "Designed and built a 6-wheel rocker-bogie rover inspired by NASA's Mars rovers, capable of autonomous navigation in challenging terrain. The robot runs a full ROS navigation stack with custom path planning algorithms optimized for rough terrain traversal.\n\nEquipped with Intel RealSense D435 depth camera for 3D environment mapping and obstacle detection. The rover features a 4-DOF manipulator arm controlled via MoveIt for object manipulation tasks, making it suitable for sample collection scenarios.",
      features: [
        "Rocker-bogie suspension system for maximum ground contact and stability",
        "Custom path planning considering terrain difficulty and rover limitations",
        "Real-time 3D mapping and localization using RealSense depth camera",
        "4-DOF manipulator with inverse kinematics control via MoveIt",
        "Autonomous navigation with dynamic obstacle avoidance",
        "Power management system with solar charging capability"
      ],
      github: null,
      demo: null
    },
    {
      id: 3,
      title: "Drone PID Position Control",
      desc: "Simulation environment for testing aggressive flight maneuvers using cascaded PID loops.",
      stack: ["ROS 2", "Gazebo", "PX4", "Matlab", "Control Theory"],
      icon: <Activity className="w-6 h-6" />,
      details: "Built a comprehensive simulation framework for developing and testing aggressive drone flight controllers. The system implements cascaded PID control loops for position, velocity, and attitude control, enabling precise trajectory tracking even during high-speed maneuvers.\n\nUsing PX4 autopilot stack within Gazebo simulation environment, the project includes Matlab/Simulink models for controller tuning and validation. The framework supports Hardware-in-the-Loop (HITL) testing, allowing direct deployment of tuned controllers to physical drones.",
      features: [
        "Cascaded PID architecture with position, velocity, and attitude loops",
        "Gazebo physics simulation with realistic aerodynamics modeling",
        "Matlab/Simulink integration for controller design and analysis",
        "Hardware-in-the-Loop (HITL) testing capability",
        "Trajectory generation for aggressive maneuvers (flips, barrel rolls)",
        "Real-time performance metrics and visualization tools"
      ],
      github: null,
      demo: null
    },
    {
      id: 4,
      title: "Stroke Detection XAI",
      desc: "Explainable AI architecture combining CNNs with a meta-learner to identify stroke precursors in CT scans.",
      stack: ["PyTorch", "TensorFlow", "Scikit-Learn", "OpenCV"],
      icon: <Terminal className="w-6 h-6" />,
      details: "Developed an explainable AI system for early stroke detection from CT scan images. The architecture combines convolutional neural networks (CNNs) for feature extraction with a meta-learning framework that provides interpretable predictions and highlights critical regions in medical images.\n\nThe system achieves high accuracy while maintaining transparency through attention mechanisms and saliency mapping, allowing medical professionals to understand and verify the AI's reasoning process. Trained on a large dataset of annotated CT scans with validation from medical experts.",
      features: [
        "CNN-based feature extraction with attention mechanisms",
        "Meta-learner architecture for improved generalization",
        "Grad-CAM visualization for explaining model predictions",
        "Multi-class classification (ischemic, hemorrhagic, normal)",
        "Real-time inference capability for clinical deployment",
        "Comprehensive evaluation metrics with medical expert validation"
      ],
      github: null,
      demo: null
    },
    {
      id: 5,
      title: "Embedded Systems Suite",
      desc: "Collection of hardware builds including custom BMS, IMU sensor fusion modules, and motor controllers.",
      stack: ["STM32", "Altium", "C", "I2C/SPI", "FreeRTOS"],
      icon: <Battery className="w-6 h-6" />,
      details: "A collection of custom-designed embedded systems for robotics applications. Projects include a Battery Management System (BMS) with cell balancing and safety features, IMU sensor fusion module for attitude estimation, and high-power motor controllers for autonomous vehicles.\n\nAll systems feature custom PCB designs created in Altium Designer, with firmware written in C running on STM32 microcontrollers. Communication protocols include I2C, SPI, and CAN bus for integration into larger robotic systems.",
      features: [
        "Custom BMS with active cell balancing and fault protection",
        "9-axis IMU with Kalman filter-based sensor fusion",
        "Dual-channel motor controller supporting up to 60A continuous",
        "FreeRTOS-based firmware with real-time guarantees",
        "CANbus and UART interfaces for system integration",
        "Over-the-air (OTA) firmware update capability"
      ],
      github: null,
      demo: null
    }
  ];

  return (
    <div className={`min-h-screen font-mono selection:bg-cyan-500 selection:text-black transition-colors duration-0 ${colors.bg} ${colors.text} overflow-x-hidden cursor-none`}>
      <TechBackground theme={theme} />
      <EmailVerificationModal 
        isOpen={showEmailModal} 
        onClose={() => setShowEmailModal(false)} 
        onVerified={handleEmailVerified}
        theme={theme}
        colors={colors}
      />
      <ProjectModal 
        project={selectedProject}
        isOpen={showProjectModal}
        onClose={() => {
          setShowProjectModal(false);
          setSelectedProject(null);
        }}
        theme={theme}
        colors={colors}
      />
      
      {/* HEADER / NAV */}
      <header className={`fixed top-0 left-0 w-full z-50 border-b ${colors.border} backdrop-blur-md bg-opacity-90 ${theme === 'dark' ? 'bg-zinc-950/80' : 'bg-zinc-50/80'}`}>
        <div className="flex justify-between items-center px-6 h-16 max-w-7xl mx-auto">
          
          {/* Brand */}
          <div className="flex items-center gap-2 text-sm font-bold tracking-widest cursor-pointer" onClick={() => scrollToSection('hero')}>
            <Zap className={`w-4 h-4 ${colors.accent}`} />
            <span className="hidden md:inline">TDS</span>
            <span className="md:hidden">TDS.EXE</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center h-full">
            {navLinks.map((link) => (
              <button 
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`h-full px-6 border-l ${colors.border} text-xs font-bold tracking-widest hover:bg-zinc-800/10 ${colors.hoverText} transition-colors`}
              >
                {link.label}
              </button>
            ))}
            <div className={`h-full border-l border-r ${colors.border} flex items-center px-6`}>
              <button 
                onClick={toggleTheme}
                className="hover:scale-110 transition-transform"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
             <button onClick={toggleTheme}>
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
             </button>
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <nav className={`md:hidden border-t ${colors.border} absolute w-full ${colors.bg}`}>
             {navLinks.map((link) => (
              <button 
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`w-full text-left py-4 px-6 border-b ${colors.border} text-xs font-bold tracking-widest ${colors.hoverText}`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        )}
      </header>

      <main className="relative z-10 pt-20 px-6 md:px-12 max-w-7xl mx-auto">
        
        {/* HERO SECTION */}
        <section id="hero" className="min-h-[85vh] flex flex-col justify-center relative border-b-2 border-dashed border-zinc-700/30">
            <div className={`absolute top-24 right-0 text-xs text-right font-bold ${colors.dim} hidden md:block`}>
              ID: EE-27<br/>
              LOC: JU-EE<br/>
              {/* UPTIME: 99.9% */}
            </div>
            
            <div className="max-w-5xl">
              <div className={`mb-6 flex items-center gap-2 text-xs font-bold tracking-[0.2em] ${colors.accent}`}>
                <span className="animate-ping inline-flex h-2 w-2 rounded-full bg-current opacity-75"></span>
                SYSTEM READY
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter leading-[0.9] mb-8 uppercase">
                <DecryptText text="TRISHIT" speed={30} className={colors.accent} /><br/>
                <DecryptText text="DEBSHARMA" speed={50} />
              </h1>
              
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mt-8">
                <div className={`h-1 w-24 ${theme === 'dark' ? 'bg-cyan-500' : 'bg-orange-500'}`}></div>
                <p className="text-xl md:text-3xl font-bold uppercase tracking-widest max-w-2xl">
                  I build stuffs. <span className={colors.dim}>// Robotics, AI & Embedded Systems Engineer.</span>
                </p>
              </div>

              <div className="mt-16 flex flex-wrap gap-4">
                 <a href="https://github.com/DevVortex504" target="_blank" rel="noopener noreferrer" className={`group flex items-center gap-2 text-sm border ${colors.border} px-6 py-3 hover:bg-zinc-800 hover:text-white transition-colors uppercase font-bold tracking-wider`}>
                   Github <ArrowUpRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                 </a>
                 <a href="https://www.linkedin.com/in/trishit-debsharma" target="_blank" rel="noopener noreferrer" className={`group flex items-center gap-2 text-sm border ${colors.border} px-6 py-3 hover:bg-zinc-800 hover:text-white transition-colors uppercase font-bold tracking-wider`}>
                   LinkedIn <ArrowUpRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                 </a>
                 <a href="#contact" onClick={handleHeroEmailClick} className={`group flex items-center gap-2 text-sm border ${colors.border} px-6 py-3 hover:bg-zinc-800 hover:text-white transition-colors uppercase font-bold tracking-wider`}>
                   Email <ArrowUpRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                 </a>
              </div>
            </div>
        </section>

        {/* ABOUT SECTION (Scroll Reveal) */}
        <section id="about" className="min-h-screen flex flex-col justify-center border-l-2 border-dashed border-zinc-700/30 pl-4 md:pl-12 py-24">
          <div className={`text-sm font-bold mb-2 ${colors.accent}`}>
            // 01. ABOUT ME
          </div>
          
          <ScrollRevealSection theme={theme}>
            {`I am an Electrical Engineer 
            obsessed with Robotics and AI.
            I don't just write code;
            I weld logic to metal.
            Specialized in embedded systems,
            computer vision, and 
            autonomous navigation.`}
          </ScrollRevealSection>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-3xl">
            {[
              { label: "Experience", val: "4+ Years" },
              { label: "Systems", val: "ROS / Linux" },
              { label: "Hardware", val: "STM32 / PCB" },
              { label: "Status", val: "Available" }
            ].map((stat, idx) => (
              <div key={idx} className={`p-4 border ${colors.border}`}>
                <div className={`text-xs uppercase ${colors.dim}`}>{stat.label}</div>
                <div className="text-xl font-bold mt-1">{stat.val}</div>
              </div>
            ))}
          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section id="projects" className="py-24">
          <div className="flex items-end justify-between mb-12 border-b-4 border-zinc-800 pb-4">
            <h2 className="text-5xl md:text-7xl font-black uppercase">
              <span className="text-sm md:text-base font-bold mr-4">// 02.</span>
              Projects
            </h2>
            <span className="hidden md:block text-xl font-mono">Index: 01-05</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
             {projects.map((project, idx) => (
               <div 
                 key={project.id} 
                 onClick={() => {
                   setSelectedProject(project);
                   setShowProjectModal(true);
                 }}
                 className={`group relative p-8 border ${colors.border} border-t-0 -ml-[1px] -mt-[1px] hover:z-10 transition-all duration-300 bg-transparent hover:${colors.cardBg} hover:scale-105 origin-center cursor-pointer`}
               >
                 {/* Hover Background Fill */}
                 <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 ${colors.hover} transition-opacity duration-300 pointer-events-none`}></div>
                 
                 <div className="relative z-10">
                   <div className="flex justify-between items-start mb-6">
                     <span className={`text-xs font-bold border px-2 py-1 ${colors.border}`}>PRJ-{idx + 1}00</span>
                     <div className={`${colors.accent}`}>{project.icon}</div>
                   </div>
                   
                   <div className="aspect-video bg-zinc-800 mb-6 overflow-hidden grayscale group-hover:grayscale-0 transition-all border border-zinc-700 relative">
                      {/* Project Image */}
                      {project.image ? (
                        <img 
                          src={project.image} 
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-xs font-mono uppercase">
                          IMG_NO_SIGNAL
                        </div>
                      )}
                      {/* Scanline effect */}
                      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-20"></div>
                   </div>

                   <h3 className="text-2xl font-bold uppercase mb-3 group-hover:underline decoration-4 underline-offset-4">{project.title}</h3>
                   <p className={`text-sm mb-6 font-medium leading-relaxed ${colors.dim} group-hover:text-inherit`}>
                     {project.desc}
                   </p>

                   <div className="flex flex-wrap gap-2">
                     {project.stack.map(tech => (
                       <span key={tech} className={`text-[10px] font-bold uppercase tracking-wider border ${colors.border} px-2 py-1`}>
                         {tech}
                       </span>
                     ))}
                   </div>
                 </div>
               </div>
             ))}
          </div>
        </section>

        {/* CONTACT SECTION - Terminal Style */}
        <TerminalContact theme={theme} colors={colors} />

      </main>
    </div>
  );
}