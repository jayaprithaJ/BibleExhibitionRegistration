import Link from 'next/link';
import { BookOpen, Calendar, Users, Heart } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Section with Church Background */}
      <div className="relative bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/church-bg.jpg')" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="mb-6">
            <BookOpen className="w-16 h-16 text-white mx-auto mb-4 drop-shadow-lg" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 drop-shadow-lg">
            Bible Exhibition 2026
          </h1>
          <div className="max-w-2xl mx-auto mb-6">
            <p className="text-lg italic text-white mb-2 drop-shadow-md">
              "Thy word is a lamp unto my feet, and a light unto my path."
            </p>
            <p className="text-sm text-gray-200 drop-shadow-md">— Psalm 119:105</p>
          </div>
          <div className="inline-block bg-white/90 backdrop-blur-sm px-6 py-3 rounded-lg mb-8">
            <p className="text-slate-800 font-medium">
              June 5-21, 2026
            </p>
          </div>
          <div>
            <Link
              href="/register"
              className="inline-block bg-white text-slate-800 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Register Your Group
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Welcome Message from Church */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white border-2 border-slate-200 rounded-lg p-8 shadow-lg">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-serif font-bold text-slate-800 mb-2">
                Welcome from SDA Lowry Tamil Church
              </h2>
              <div className="w-24 h-1 bg-slate-300 mx-auto mb-6"></div>
            </div>
            <p className="text-slate-700 leading-relaxed text-center mb-4 text-lg">
              Dear Brothers and Sisters in Christ,
            </p>
            <p className="text-slate-600 leading-relaxed text-center mb-4">
              On behalf of the <strong>Seventh-day Adventist Lowry Tamil Church</strong>, we warmly welcome you
              to this special Bible Exhibition. This is a blessed opportunity to deepen your understanding
              of God's Word and experience the richness of Scripture in a meaningful way.
            </p>
            <p className="text-slate-600 leading-relaxed text-center mb-4">
              We encourage you and your church family to join us for this spiritual journey. Whether you
              prefer Tamil or English, our guided tours will help illuminate the timeless truths and
              profound wisdom found in the Holy Bible.
            </p>
            <p className="text-slate-600 leading-relaxed text-center mb-6">
              Come, let us explore God's Word together and be blessed by His presence.
            </p>
            <p className="text-slate-700 leading-relaxed text-center font-medium italic">
              "For the word of God is living and active, sharper than any two-edged sword..."
              <br />
              <span className="text-sm text-slate-500">— Hebrews 4:12</span>
            </p>
          </div>
        </div>

        {/* Features - Simple and Humble */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-700" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Flexible Scheduling</h3>
            <p className="text-slate-600 text-sm">
              Choose a date and time that works best for your church group
            </p>
          </div>

          <div className="text-center">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-700" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Group Visits</h3>
            <p className="text-slate-600 text-sm">
              Bring your entire congregation for a shared spiritual experience
            </p>
          </div>

          <div className="text-center">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-slate-700" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Guided Tours</h3>
            <p className="text-slate-600 text-sm">
              Audio guides in Tamil and English to enrich your understanding
            </p>
          </div>
        </div>

        {/* Schedule */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white border-2 border-slate-200 rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-serif font-semibold text-slate-800 mb-6 text-center">
              Exhibition Hours
            </h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="border-l-4 border-slate-300 pl-4">
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  Saturdays & Sundays
                </h3>
                <p className="text-slate-600 text-sm mb-2">Weekends</p>
                <p className="text-2xl font-bold text-slate-800">9 AM - 8 PM</p>
              </div>
              <div className="border-l-4 border-slate-300 pl-4">
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  Fridays
                </h3>
                <p className="text-slate-600 text-sm mb-2">Evening Sessions</p>
                <p className="text-2xl font-bold text-slate-800">6 PM - 9 PM</p>
              </div>
              <div className="border-l-4 border-slate-300 pl-4">
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  Languages
                </h3>
                <p className="text-slate-600 text-sm mb-2">Audio Guides</p>
                <p className="text-2xl font-bold text-slate-800">Tamil & English</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <p className="text-sm text-slate-500 italic">
            "For the word of God is living and active..." — Hebrews 4:12
          </p>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
