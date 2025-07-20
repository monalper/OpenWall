// ECNN - Kopya/frontend/src/pages/AboutPage.jsx (Yeni Dosya)
import React from 'react';

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Grid Background */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative h-[340px] md:h-[400px] flex items-center justify-center bg-[#101624] rounded-3xl overflow-hidden">
          {/* Grid background */}
          <div className="absolute inset-0 z-0">
            <svg width="100%" height="100%">
              <defs>
                <pattern
                  id="grid"
                  width="60"
                  height="60"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 60 0 L 0 0 0 60"
                    fill="none"
                    stroke="#2a3140"
                    strokeWidth="2"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          {/* Centered text */}
          <div className="relative z-10 text-center w-full">
            <h1 className="text-white text-5xl md:text-6xl font-bold mb-4">
              <span className="font-['Lora'] italic">About</span>
            </h1>
            <p className="text-slate-300 text-xl max-w-2xl mx-auto">
              Write anything.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Left: Image */}
          <div className="rounded-3xl overflow-hidden bg-slate-200 flex items-center justify-center min-h-[340px]">
            <img
              src="https://i.pinimg.com/736x/54/9b/d2/549bd2a71fd2ab2c95d56b8887865b92.jpg"
              alt="About görseli"
              className="w-full h-full object-cover object-center"
              style={{ minHeight: '340px', maxHeight: '500px' }}
            />
          </div>

          {/* Right: Contact Card with Grid Background */}
          <div className="relative bg-[#101624] rounded-3xl overflow-hidden flex flex-col justify-center border-2 border-brand-orange/20">
            {/* Contact Content */}
            <div className="relative z-10 p-8 md:p-12 flex flex-col h-full justify-center">
              <h2 className="text-3xl font-bold text-white mb-12 text-center">
                İletişim
              </h2>
              <div className="flex flex-col gap-12 md:gap-16 md:flex-row md:items-start">
                {/* Left: Info */}
                <div className="flex-1 space-y-8 md:pr-12">
                  <p className="text-slate-300 text-[15px] leading-relaxed">
                    Yazı önerileriniz, geri bildirimleriniz için iletişime geçebilirsiniz.
                  </p>
                  <div className="space-y-6">
                    <a 
                      href="mailto:info@monologed.com" 
                      className="inline-block text-brand-orange hover:text-brand-orange/80 transition-colors text-lg font-medium"
                    >
                      info@monologed.com
                    </a>
                    <div className="flex gap-6">
                      <a 
                        href="https://twitter.com/RogueAlper" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-slate-300 hover:text-brand-orange transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.46 5.924c-.793.352-1.645.59-2.54.698a4.48 4.48 0 0 0 1.963-2.475 8.94 8.94 0 0 1-2.828 1.082A4.48 4.48 0 0 0 16.11 4c-2.488 0-4.507 2.02-4.507 4.507 0 .353.04.697.117 1.026C7.728 9.38 4.1 7.6 1.67 4.905c-.388.666-.61 1.44-.61 2.263 0 1.563.796 2.942 2.008 3.75-.74-.023-1.436-.227-2.045-.567v.057c0 2.185 1.555 4.008 3.623 4.426-.378.104-.777.16-1.188.16-.29 0-.57-.028-.844-.08.57 1.78 2.223 3.078 4.183 3.113A9.01 9.01 0 0 1 2 19.54a12.73 12.73 0 0 0 6.89 2.02c8.266 0 12.79-6.844 12.79-12.78 0-.195-.004-.39-.013-.583A9.22 9.22 0 0 0 24 4.59a8.94 8.94 0 0 1-2.54.698z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
                {/* Right: Form */}
                <div className="flex-1 flex items-center justify-center">
                  <form className="space-y-6 w-full max-w-xs mx-auto">
                    <div>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 bg-gray-900/75 border border-white/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange"
                        placeholder="Adınız"
                      />
                    </div>
                    <div>
                      <input 
                        type="email" 
                        className="w-full px-4 py-3 bg-gray-900/75 border border-white/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange"
                        placeholder="E-posta adresiniz"
                      />
                    </div>
                    <div>
                      <textarea 
                        className="w-full px-4 py-3 bg-gray-900/75 border border-white/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange h-32"
                        placeholder="Mesajınız"
                      ></textarea>
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-brand-orange text-white py-3 px-6 rounded-lg hover:bg-brand-orange/90 transition-colors"
                    >
                      Gönder
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

