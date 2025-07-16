import React from 'react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-blue-800 text-white py-4 fixed w-full top-0 z-50 shadow-lg">
        <nav className="max-w-6xl mx-auto px-5 flex justify-between items-center">
          <a href="#" className="text-3xl font-bold text-white">
            Upsaleit
          </a>
          
          <ul className="hidden md:flex space-x-8 list-none">
            <li><a href="#how-it-works" className="text-white font-medium hover:text-blue-300 transition-colors">How It Works</a></li>
            <li><a href="#testimonials" className="text-white font-medium hover:text-blue-300 transition-colors">Testimonials</a></li>
            <li><a href="#pricing" className="text-white font-medium hover:text-blue-300 transition-colors">Pricing</a></li>
            <li><a href="#contact" className="text-white font-medium hover:text-blue-300 transition-colors">Contact</a></li>
          </ul>
          
          <a href="#" className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-md font-semibold transition-colors">
            Login
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-800 to-blue-500 text-white pt-32 pb-20 text-center">
        <div className="max-w-6xl mx-auto px-5">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
            Professional Influencer Marketing Platform
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
            Bridge the Gap Between Ambitious Brands and Talented Influencers — Built for Results.
          </p>
          <div className="mt-8">
            <a href="#" className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-block hover:-translate-y-1 transform">
              Get Started
            </a>
          </div>
        </div>
      </section>

      {/* Role Selection */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-center text-4xl font-bold mb-4 text-blue-800">
            Choose Your Professional Path
          </h2>
          <p className="text-center text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Looking to grow your brand? Or ready to turn your influence into income? Choose your path — we'll guide the way.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="bg-white p-12 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-200 text-center">
              <div className="w-20 h-20 bg-blue-800 rounded-full flex items-center justify-center text-4xl text-white mb-6 mx-auto">
                🏢
              </div>
              <h3 className="text-3xl font-bold text-blue-800 mb-4">
                For Brands & Agencies
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Run smarter campaigns with authentic creators. Discover talent, manage deals, and measure success — all from one powerful platform.
              </p>
              <a href="#" className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-block">
                Explore Brand Solutions
              </a>
            </div>
            
            <div className="bg-white p-12 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-200 text-center">
              <div className="w-20 h-20 bg-blue-800 rounded-full flex items-center justify-center text-4xl text-white mb-6 mx-auto">
                ⭐
              </div>
              <h3 className="text-3xl font-bold text-blue-800 mb-4">
                For Professional Influencers
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Monetize your content, build real brand partnerships, and run your creator business like a pro — all from one sleek platform.
              </p>
              <a href="#" className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-block">
                Join Our Network
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-center text-4xl font-bold mb-4 text-blue-800">
            How Upsaleit Works
          </h2>
          <p className="text-center text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            A streamlined process designed for professional results
          </p>
          
          <div className="grid md:grid-cols-4 gap-8 mt-12">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                1
              </div>
              <h3 className="text-xl font-bold text-blue-800 mb-4">
                Strategic Planning
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Define your campaign objectives, target audience, and key performance indicators with our consultation team.
              </p>
            </div>
            
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                2
              </div>
              <h3 className="text-xl font-bold text-blue-800 mb-4">
                Influencer Matching
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our AI-powered system identifies and vets the most suitable influencers based on your specific requirements.
              </p>
            </div>
            
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                3
              </div>
              <h3 className="text-xl font-bold text-blue-800 mb-4">
                Deal Finalization
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Send offers, negotiate terms, and finalize agreements — all through our secure, built-in deal management system.
              </p>
            </div>
            
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                4
              </div>
              <h3 className="text-xl font-bold text-blue-800 mb-4">
                Launch & Tracking
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Collaborate on content, approve assets, and monitor live campaign performance in real-time — all in one streamlined dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-center text-4xl font-bold mb-4 text-blue-800">
            What Our Clients Say
          </h2>
          <p className="text-center text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Trusted by leading brands and professional influencers worldwide
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-10 rounded-xl shadow-sm">
              <div className="text-gray-600 italic mb-6 text-lg leading-relaxed">
                "ConnectSphere has transformed our influencer marketing strategy. The quality of partnerships and the comprehensive analytics have delivered exceptional ROI for our campaigns."
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  SM
                </div>
                <div>
                  <h4 className="text-blue-800 font-semibold mb-1">
                    Sarah Mitchell
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Marketing Director, TechCorp
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-10 rounded-xl shadow-sm">
              <div className="text-gray-600 italic mb-6 text-lg leading-relaxed">
                "The platform's professional tools and premium brand partnerships have elevated my content business. It's the gold standard for serious influencers."
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  DJ
                </div>
                <div>
                  <h4 className="text-blue-800 font-semibold mb-1">
                    David Johnson
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Content Creator, 500K+ Followers
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-10 rounded-xl shadow-sm">
              <div className="text-gray-600 italic mb-6 text-lg leading-relaxed">
                "Outstanding service and results. The team's expertise in influencer marketing is evident in every campaign. Highly recommended for enterprise clients."
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  ER
                </div>
                <div>
                  <h4 className="text-blue-800 font-semibold mb-1">
                    Emily Rodriguez
                  </h4>
                  <p className="text-gray-600 text-sm">
                    CMO, Fashion Forward Inc.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-800 text-white py-20 text-center">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Elevate Your Marketing and Revenue?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Join a growing network of brands and creators using Upsaleit to drive real growth and measurable impact.
          </p>
          <a href="#" className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-block">
            Get Started
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div>
              <h3 className="text-amber-500 font-semibold mb-4">
                Upsaleit
              </h3>
              <p className="text-gray-300 text-sm">
                Professional influencer marketing platform connecting brands with authentic creators for measurable results.
              </p>
            </div>
            
            <div>
              <h3 className="text-amber-500 font-semibold mb-4">
                Platform
              </h3>
              <ul className="space-y-2 list-none">
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">For Brands</a></li>
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">For Influencers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">Analytics</a></li>
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">Campaign Management</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-amber-500 font-semibold mb-4">
                Resources
              </h3>
              <ul className="space-y-2 list-none">
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">Case Studies</a></li>
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">Whitepapers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">API Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-amber-500 font-semibold mb-4">
                Company
              </h3>
              <ul className="space-y-2 list-none">
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">Press</a></li>
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-amber-500 font-semibold mb-4">
                Support
              </h3>
              <ul className="space-y-2 list-none">
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-600 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2024 ConnectSphere. All rights reserved. Professional influencer marketing platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;