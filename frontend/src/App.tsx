import React, { useState } from 'react';
import { Sparkles, Mail, Zap, ArrowLeft, Check } from 'lucide-react';
import { NewslettersPage } from './pages/NewslettersPage';
import { Newsletter } from './components/NewsletterCard';

interface NewsletterData {
  newsletterName: string;
  newsletterPrompt: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<'list' | 'generate' | 'success'>('list');
  const [newsletterData, setNewsletterData] = useState<NewsletterData | null>(null);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [formData, setFormData] = useState({
    newsletterName: '',
    newsletterPrompt: ''
  });
  const [emailSignup, setEmailSignup] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.newsletterName.trim() || !formData.newsletterPrompt.trim()) {
      return;
    }
    
    setIsGenerating(true);
    // Simulate API call
    const res = await fetch('/api/newsletters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.newsletterName,
        prompt: formData.newsletterPrompt
      })
    });
    if (!res.ok) throw new Error('Failed to create');
    const nl = await res.json();
    setNewsletterData({ newsletterName: nl.name, newsletterPrompt: nl.prompt });
    setSelectedNewsletter(nl);
    setCurrentPage('success');
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSignup.trim()) return;

    setIsSigningUp(true);
    // Simulate API call
    const res = await fetch(`/api/newsletters/${selectedNewsletter?.id}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailSignup })
    });
    if (!res.ok) throw new Error('Signup failed');
    setSignupSuccess(true);
  };

  const handleBackToGenerate = () => {
    setCurrentPage('generate');
    setSignupSuccess(false);
    setEmailSignup('');
  };

  const handleBackToList = () => {
    setCurrentPage('list');
    setSignupSuccess(false);
    setEmailSignup('');
    setSelectedNewsletter(null);
  };

  const handleCreateNew = () => {
    setCurrentPage('generate');
    setFormData({ newsletterName: '', newsletterPrompt: '' });
  };

  const handleSelectNewsletter = (newsletter: Newsletter) => {
    setSelectedNewsletter(newsletter);
    setCurrentPage('success');
  };

  const isFormValid = formData.newsletterName.trim() && formData.newsletterPrompt.trim();

  // Show newsletters list page
  if (currentPage === 'list') {
    return (
      <NewslettersPage
        onCreateNew={handleCreateNew}
        onSelectNewsletter={handleSelectNewsletter}
      />
    );
  }

  // Show success/signup page
  if (currentPage === 'success' && (newsletterData || selectedNewsletter)) {
    const displayData = newsletterData || {
      newsletterName: selectedNewsletter!.name,
      newsletterPrompt: selectedNewsletter!.prompt
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>

        {/* Header */}
        <header className="relative z-10 pt-8 pb-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={selectedNewsletter ? handleBackToList : handleBackToGenerate}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-8"
            >
              <ArrowLeft className="w-5 h-5" />
              {selectedNewsletter ? 'Back to Newsletters' : 'Back to Generator'}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex-1">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Vibeletter Branding */}
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Vibeletter
              </h1>
              <p className="text-xl text-gray-600 max-w-lg mx-auto leading-relaxed">
                Sign up to receive a personalized newsletter with AI
              </p>
            </div>

            {/* Newsletter Details Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 md:p-10 mb-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Newsletter Name</h3>
                  <div className="p-4 bg-gray-50 rounded-xl border">
                    <p className="text-gray-800 font-medium">{displayData.newsletterName}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Newsletter Prompt</h3>
                  <div className="p-4 bg-gray-50 rounded-xl border">
                    <p className="text-gray-700 leading-relaxed">{displayData.newsletterPrompt}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Signup Form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 md:p-10">
              {signupSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Successfully Signed Up!</h3>
                  <p className="text-gray-600">
                    You'll receive your personalized newsletter soon. Check your email for confirmation.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEmailSignup} className="space-y-6">
                  <div className="space-y-3">
                    <label htmlFor="email" className="block text-lg font-semibold text-gray-900">
                      Email address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={emailSignup}
                      onChange={(e) => setEmailSignup(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white/50 placeholder-gray-400"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!emailSignup.trim() || isSigningUp}
                    className={`
                      w-full py-4 px-8 text-lg font-semibold rounded-xl transition-all duration-300 transform
                      ${emailSignup.trim() && !isSigningUp
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }
                    `}
                  >
                    {isSigningUp ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Signing Up...
                      </div>
                    ) : (
                      'Sign Up'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 mt-20 pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-500">
              Powered by advanced AI technology to create compelling newsletters
            </p>
          </div>
        </footer>
      </div>
    );
  }

  // Show generate page
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 pt-8 pb-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Newsletters
            </button>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Vibeletter
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-purple-500" />
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Generate Newsletter
              </h2>
              <Sparkles className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-xl text-gray-600 max-w-lg mx-auto leading-relaxed">
              Enter your preferences below to generate a personalized newsletter with AI.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 md:p-10">
            <form onSubmit={handleGenerate} className="space-y-8">
              {/* Newsletter Name Field */}
              <div className="space-y-3">
                <label htmlFor="newsletterName" className="block text-lg font-semibold text-gray-900">
                  Newsletter Name
                </label>
                <input
                  type="text"
                  id="newsletterName"
                  name="newsletterName"
                  value={formData.newsletterName}
                  onChange={handleInputChange}
                  placeholder="Enter your newsletter name"
                  className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white/50 placeholder-gray-400"
                  required
                />
              </div>

              {/* Newsletter Prompt Field */}
              <div className="space-y-3">
                <label htmlFor="newsletterPrompt" className="block text-lg font-semibold text-gray-900">
                  Newsletter Prompt
                </label>
                <textarea
                  id="newsletterPrompt"
                  name="newsletterPrompt"
                  value={formData.newsletterPrompt}
                  onChange={handleInputChange}
                  placeholder="Describe what you want your newsletter to cover. Be specific about topics, tone, target audience, and any particular focus areas..."
                  rows={6}
                  className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white/50 placeholder-gray-400 resize-none"
                  required
                />
                <p className="text-sm text-gray-500">
                  The more detailed your prompt, the better your newsletter will be.
                </p>
              </div>

              {/* Generate Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!isFormValid || isGenerating}
                  className={`
                    w-full py-4 px-8 text-lg font-semibold rounded-xl transition-all duration-300 transform
                    ${isFormValid && !isGenerating
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Generating Newsletter...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <Zap className="w-5 h-5" />
                      Generate Newsletter
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Features Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white/40 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-gray-600 text-sm">Advanced AI creates engaging, personalized content</p>
            </div>
            
            <div className="text-center p-6 bg-white/40 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600 text-sm">Generate professional newsletters in seconds</p>
            </div>
            
            <div className="text-center p-6 bg-white/40 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Ready to Send</h3>
              <p className="text-gray-600 text-sm">Get polished, professional newsletters instantly</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500">
            Powered by advanced AI technology to create compelling newsletters
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;