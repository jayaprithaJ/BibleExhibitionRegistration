'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

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

  // Check if registration is open
  useState(() => {
    const registrationOpenDate = new Date('2026-03-28T00:00:00+05:30');
    const now = new Date();
    setRegistrationOpen(now >= registrationOpenDate);
  });

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section - Flyer Theme */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-slate-900 to-yellow-900/20"></div>
        <div className="relative container mx-auto px-4 py-16 text-center">
          {/* Bible Verse */}
          <p className="text-yellow-400 text-lg md:text-xl italic mb-2 font-serif">
            "Thy word is a lamp unto my feet, and a light unto my path."
          </p>
          <p className="text-cyan-300 text-sm mb-8">Psalm 119:105</p>

          {/* Church Name */}
          <h2 className="text-white text-xl md:text-2xl font-bold mb-2 tracking-wide">
            SEVENTH-DAY ADVENTIST
          </h2>
          <h1 className="text-yellow-400 text-3xl md:text-5xl font-bold mb-8 tracking-wider">
            LOWRY TAMIL CHURCH
          </h1>

          {/* Main Title */}
          <p className="text-white text-lg md:text-xl mb-4">Cordially invites you to</p>
          <h1 className="text-cyan-400 text-6xl md:text-8xl font-black mb-6 tracking-wider" style={{ fontFamily: 'Impact, sans-serif' }}>
            BIBLIO '26
          </h1>
          <p className="text-white text-2xl md:text-3xl font-bold mb-12">
            Experience the Bible<br />Like Never Before
          </p>

          {/* Registration Notice or Button */}
          {!registrationOpen ? (
            <div className="inline-block bg-yellow-500/20 border-2 border-yellow-400 rounded-lg px-8 py-4 mb-8">
              <p className="text-yellow-400 font-bold text-xl">
                📅 Registration Opens March 28, 2026
              </p>
            </div>
          ) : (
            <Link
              href="/register"
              className="inline-block bg-cyan-500 hover:bg-cyan-600 text-slate-900 px-10 py-4 rounded-lg text-xl font-bold transition-colors shadow-lg shadow-cyan-500/50"
            >
              Register Your Group
            </Link>
          )}

          {/* Key Info */}
          <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-6">
              <p className="text-cyan-400 font-bold text-lg mb-2">Exhibition Dates</p>
              <p className="text-white text-2xl font-bold">June 5 - 21, 2026</p>
            </div>
            <div className="bg-slate-800/50 border border-yellow-500/30 rounded-lg p-6">
              <p className="text-yellow-400 font-bold text-lg mb-2">Inaugural Vespers</p>
              <p className="text-white text-2xl font-bold">June 5th, 2026</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Photo Gallery */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-cyan-400 mb-8">
            Exhibition Models Gallery
          </h2>
          <div className="bg-slate-800 rounded-lg p-6 shadow-2xl">
            <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden mb-4">
              <img
                src={`/models/${modelPhotos[currentImageIndex].file}`}
                alt={modelPhotos[currentImageIndex].name}
                className="w-full h-full object-contain"
              />
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-slate-900 text-white p-3 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-slate-900 text-white p-3 rounded-full transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">
                {modelPhotos[currentImageIndex].name}
              </h3>
              <p className="text-cyan-400">
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
                      ? 'border-cyan-400 scale-110'
                      : 'border-slate-600 opacity-60 hover:opacity-100'
                  }`}
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

        {/* Lookup Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-slate-800 border-2 border-cyan-500/30 rounded-lg p-8 shadow-xl">
            <div className="text-center mb-6">
              <Search className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Already Registered?
              </h2>
              <p className="text-slate-300">
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
                  className="flex-1 px-4 py-3 bg-slate-900 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white text-lg"
                  minLength={10}
                  maxLength={20}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-slate-900 rounded-lg font-bold disabled:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  {loading ? 'Searching...' : 'Find'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Schedule */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-yellow-400 mb-8">
            Exhibition Hours
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800 border-2 border-cyan-500/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Saturdays</h3>
              <p className="text-white text-lg mb-2">1:30 PM - 5:00 PM</p>
              <p className="text-white text-lg">6:00 PM - 8:00 PM</p>
              <p className="text-slate-400 text-sm mt-2">Break: 5:00 - 6:00 PM</p>
            </div>
            <div className="bg-slate-800 border-2 border-yellow-500/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-4">Sundays</h3>
              <p className="text-white text-lg">9:30 AM - 8:00 PM</p>
              <p className="text-slate-400 text-sm mt-2">Continuous Session</p>
            </div>
          </div>
          
          <div className="mt-6 bg-slate-800 border-2 border-purple-500/30 rounded-lg p-6">
            <h3 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Weekdays (Mon-Thu): 5:00 PM - 8:00 PM
            </h3>
            <p className="text-slate-300 text-sm mb-2">
              ⚠️ Open to public - May experience delays due to walk-in visitors
            </p>
            <p className="text-slate-400 text-sm">
              📞 For exclusive group bookings or Friday slots, call the church office
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-yellow-400 mb-4">
              Audio Guides Available
            </h3>
            <p className="text-white text-3xl font-bold">Tamil & English</p>
            <p className="text-slate-300 mt-4">
              Free admission • No registration charges
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
