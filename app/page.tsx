'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Calendar, Users, Heart, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const modelPhotos = [
  { id: 1, name: 'Garden of Eden', file: 'M1-GardenofEden.png' },
  { id: 2, name: "Cain & Abel", file: 'M1.1-Cain&abel.jpeg' },
  { id: 3, name: "Noah's Ark", file: 'M2-Noah\'sArk.jpeg' },
  { id: 4, name: 'Tower of Babel', file: 'M3-TowerOfBabel.jpeg' },
  { id: 5, name: "Abraham's Promise", file: 'M4-AbrahamPromise.png' },
  { id: 6, name: 'Abraham Offering', file: 'M5-Abraham Offering.png' },
  { id: 7, name: "Joseph's Life", file: 'M6-Joseph\'s Life Story.png' },
  { id: 8, name: 'Baby Moses', file: 'M7-BabyMoses.png' },
  { id: 9, name: 'Burning Bush', file: 'M8-Burning bush.png' },
  { id: 10, name: 'Parting of Red Sea', file: 'M9-Parting of the RedSea.png' },
  { id: 11, name: 'Pillar of Fire & Manna', file: 'M10-Moses-PillarFireManna.png' },
  { id: 12, name: 'Mount Sinai', file: 'M11-MountSinai.png' },
  { id: 13, name: 'Tabernacle', file: 'M12-Tabernacle.png' },
  { id: 14, name: 'David the Shepherd', file: 'M13-David Shepard boy.png' },
  { id: 15, name: "Solomon's Temple", file: 'M14-Solomon\'s Temple.png' },
  { id: 16, name: 'Elijah', file: 'M15-Elijah.png' },
  { id: 17, name: "Nebuchadnezzar's Dream", file: 'M16-Nebukkadnezar\'sDream statue.png' },
  { id: 18, name: 'Fiery Furnace', file: 'M17-FieryFurnace.png' },
  { id: 19, name: "Lion's Den", file: 'M18-Lion\'sDen.png' },
  { id: 20, name: 'Writing on the Wall', file: 'M19-Writing on the Wall.png' },
  { id: 21, name: 'Birth of Jesus', file: 'M20-BirthOfJesus.png' },
  { id: 22, name: 'Jesus Teachings', file: 'M21-JesusTeachings.png' },
  { id: 23, name: 'Last Supper', file: 'M22-Last supper.png' },
  { id: 24, name: 'Crucifixion', file: 'M23-Cruxifiction.png' },
  { id: 25, name: 'Resurrection', file: 'M24-Resurrection.png' },
  { id: 26, name: 'Seven Churches', file: 'M25-SevenChurchesAndThreeAngel.png' },
  { id: 27, name: 'New Jerusalem', file: 'M26-NewJerusalem.png' },
];

export default function Home() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Check if registration is open (after May 28, 2026)
  useEffect(() => {
    const registrationOpenDate = new Date('2026-05-28T00:00:00+05:30');
    const now = new Date();
    setRegistrationOpen(now >= registrationOpenDate);
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim()) {
      setLoading(true);
      router.push(`/lookup?phone=${encodeURIComponent(phone)}`);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % modelPhotos.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + modelPhotos.length) % modelPhotos.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Section with Church Background */}
      <div className="relative bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/church-building.jpg')" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>
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
            {registrationOpen ? (
              <Link
                href="/register"
                className="inline-block bg-white text-slate-800 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                Register Your Group
              </Link>
            ) : (
              <div className="inline-block bg-yellow-500/20 border-2 border-yellow-400 rounded-lg px-8 py-4 backdrop-blur-sm">
                <p className="text-yellow-300 font-bold text-xl">
                  📅 Registration Opens May 28, 2026
                </p>
              </div>
            )}
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

        {/* Exhibition Models Gallery */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-slate-800 mb-2">
            Expected Sample Models
          </h2>
          <p className="text-center text-slate-600 mb-4">
            AI-generated concept images of biblical stories we plan to create
          </p>
          <p className="text-center text-amber-700 text-sm mb-8 italic">
            Note: Actual exhibition models may differ from these concept images
          </p>
          <div className="bg-white rounded-lg p-6 shadow-xl border-2 border-slate-200">
            <div className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden mb-4">
              <img
                src={`/models/${modelPhotos[currentImageIndex].file}`}
                alt={modelPhotos[currentImageIndex].name}
                className="w-full h-full object-contain"
              />
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-3 rounded-full transition-colors shadow-lg"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-3 rounded-full transition-colors shadow-lg"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {modelPhotos[currentImageIndex].name}
              </h3>
              <p className="text-slate-600">
                Model {currentImageIndex + 1} of {modelPhotos.length}
              </p>
            </div>
            {/* Thumbnail Navigation */}
            <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
              {modelPhotos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex
                      ? 'border-blue-500 scale-110 shadow-lg'
                      : 'border-slate-300 opacity-60 hover:opacity-100 hover:border-slate-400'
                  }`}
                  aria-label={`View ${photo.name}`}
                >
                  <img
                    src={`/models/${photo.file}`}
                    alt={photo.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Manage Registration Section */}
        <div className="max-w-4xl mx-auto mb-12 md:mb-16">
          <div className="bg-white border-2 border-slate-200 rounded-lg p-4 sm:p-6 md:p-8 shadow-lg">
            <div className="text-center mb-4 sm:mb-6">
              <Search className="w-10 h-10 sm:w-12 sm:h-12 text-slate-700 mx-auto mb-3 sm:mb-4" />
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-800 mb-2">
                Already Registered?
              </h2>
              <p className="text-sm sm:text-base text-slate-600 px-2">
                Enter your phone number to view or manage your registration
              </p>
            </div>
            
            <form onSubmit={handleLookup} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-base sm:text-lg"
                  minLength={10}
                  maxLength={20}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-800 disabled:bg-slate-400 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Search className="w-5 h-5" />
                  {loading ? 'Searching...' : 'Find'}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2 text-center px-2">
                Use the same phone number you used during registration
              </p>
            </form>

            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-200">
              <p className="text-xs sm:text-sm text-slate-600 text-center px-2">
                <strong>What you can do:</strong> View registration details • Access QR code • Cancel registration
              </p>
            </div>
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
            <div className="grid md:grid-cols-2 gap-8 mb-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  Saturdays
                </h3>
                <p className="text-slate-600 text-sm mb-2">Two Sessions</p>
                <p className="text-xl font-bold text-slate-800">1:30 PM - 5:00 PM</p>
                <p className="text-xl font-bold text-slate-800">6:00 PM - 8:00 PM</p>
                <p className="text-xs text-slate-500 mt-2">Break: 5:00 PM - 6:00 PM</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  Sundays
                </h3>
                <p className="text-slate-600 text-sm mb-2">Continuous Session</p>
                <p className="text-xl font-bold text-slate-800">9:30 AM - 8:00 PM</p>
                <p className="text-xs text-slate-500 mt-2">No break</p>
              </div>
            </div>

            {/* Weekday Notice */}
            <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Weekdays (Mon-Thu)
              </h3>
              
              <div className="bg-white rounded-lg p-4 mb-3">
                <p className="text-purple-900 font-bold text-lg mb-2">
                  ✅ Online Registration Available
                </p>
                <p className="text-xl font-bold text-purple-800 mb-2">
                  5:00 PM - 8:00 PM
                </p>
                <p className="text-sm text-purple-700">
                  Book your slot directly through this portal
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                <p className="text-amber-900 font-semibold mb-2">
                  ⏰ Please Note: Open to Public
                </p>
                <p className="text-sm text-amber-800 mb-2">
                  Weekday evening sessions (5-8 PM) are open to the general public. Your group may experience slight delays as we accommodate walk-in visitors.
                </p>
                <p className="text-sm text-amber-900 font-medium">
                  💡 For exclusive group time or other hours, please call the church office to arrange a private booking.
                </p>
              </div>
            </div>
            
            {/* Friday Special Notice */}
            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-amber-900 mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Friday Sessions - Call to Register
              </h3>
              <p className="text-amber-800 mb-3">
                Friday slots are available <strong>before and after vesper service</strong> by phone registration only.
              </p>
              <p className="text-amber-900 font-semibold">
                📞 Please call the church office to book Friday slots
              </p>
              <p className="text-xs text-amber-700 mt-2">
                Friday dates are not available for online registration
              </p>
            </div>

            {/* Languages */}
            <div className="text-center pt-4 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Audio Guides Available
              </h3>
              <p className="text-2xl font-bold text-slate-800">Tamil & English</p>
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
