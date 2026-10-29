// MindSync - Healthcare Provider Directory with Location & Price Filtering
import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Star,
  Building,
  Navigation,
  Calendar,
  Info,
  Map as MapIcon,
  List
} from 'lucide-react';
import { db } from '../../db/database';
import type { HealthcareProvider } from '../../types';
import { calculateDistanceKm } from '../../utils/crypto';

interface ProviderDirectoryProps {
  onSelectProviderForBooking: (provider: HealthcareProvider) => void;
}

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  'Delhi NCR': { lat: 28.6139, lng: 77.209 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Pune: { lat: 18.5204, lng: 73.8567 }
};

export const ProviderDirectory: React.FC<ProviderDirectoryProps> = ({
  onSelectProviderForBooking
}) => {
  const [providers] = useState<HealthcareProvider[]>(() => db.getProviders());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Location State
  const [selectedCity, setSelectedCity] = useState<string>('Bengaluru');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>(
    CITY_COORDINATES['Bengaluru']
  );
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Price & Filter State
  const [minPrice] = useState<number>(500);
  const [maxPrice, setMaxPrice] = useState<number>(2500);
  const [sortBy, setSortBy] = useState<'distance' | 'price_low' | 'price_high' | 'rating' | 'experience'>('distance');
  const [filterOnlineOnly, setFilterOnlineOnly] = useState<boolean>(false);
  const [filterInPersonOnly, setFilterInPersonOnly] = useState<boolean>(false);

  // Request browser geolocation on demand
  const handleRequestDeviceLocation = () => {
    setLocationError(null);
    setIsLocating(true);
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser. Using manual city selection.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setIsLocating(false);
      },
      err => {
        console.warn('Geolocation error:', err);
        setLocationError('Permission denied or location timed out. Falling back to manual city selection.');
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    if (CITY_COORDINATES[city]) {
      setUserCoords(CITY_COORDINATES[city]);
    }
  };

  // Filter and sort providers
  const filteredProviders = useMemo(() => {
    return providers
      .map(prov => {
        const dist = calculateDistanceKm(userCoords.lat, userCoords.lng, prov.lat, prov.lng);
        return { ...prov, distanceKm: dist };
      })
      .filter(prov => {
        // Category filter
        if (selectedCategory !== 'All' && prov.specialization !== selectedCategory) {
          return false;
        }
        // Price filter
        if (prov.consultationFee < minPrice || prov.consultationFee > maxPrice) {
          return false;
        }
        // Online filter
        if (filterOnlineOnly && !prov.isOnlineAvailable) return false;
        // In-person filter
        if (filterInPersonOnly && !prov.isInPersonAvailable) return false;

        // Search query filter (name, qualification, focus area, languages)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = prov.name.toLowerCase().includes(q);
          const matchFocus = prov.focusAreas.some(f => f.toLowerCase().includes(q));
          const matchLang = prov.languages.some(l => l.toLowerCase().includes(q));
          const matchCity = prov.city.toLowerCase().includes(q);
          if (!matchName && !matchFocus && !matchLang && !matchCity) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'distance') return (a.distanceKm || 0) - (b.distanceKm || 0);
        if (sortBy === 'price_low') return a.consultationFee - b.consultationFee;
        if (sortBy === 'price_high') return b.consultationFee - a.consultationFee;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
        return 0;
      });
  }, [
    providers,
    userCoords,
    selectedCategory,
    minPrice,
    maxPrice,
    filterOnlineOnly,
    filterInPersonOnly,
    searchQuery,
    sortBy
  ]);

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div
        className="p-5 rounded-2xl border"
        style={{
          backgroundColor: 'var(--card-bg, #182234)',
          borderColor: 'var(--border-color, #2d3e5b)'
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Building className="w-6 h-6 text-teal-400" />
              Verified Healthcare Providers & Counselor Directory
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Search qualified clinical psychologists, psychiatrists, counselors, and licensed therapists.
              Consultation fees and availability are verified from the provider database.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-teal-600 text-white border-teal-500'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" /> List View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'map'
                  ? 'bg-teal-600 text-white border-teal-500'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <MapIcon className="w-4 h-4" /> Map View
            </button>
          </div>
        </div>

        {/* Category Explanations Pill Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap gap-2 text-xs">
          <span className="text-slate-400 self-center mr-1">Categories:</span>
          {(['All', 'Psychologist', 'Psychiatrist', 'Counselor', 'Therapist'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search, Location and Price Filter Bar */}
      <div
        className="p-5 rounded-2xl border space-y-4"
        style={{
          backgroundColor: 'var(--card-bg, #182234)',
          borderColor: 'var(--border-color, #2d3e5b)'
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Text Search */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search doctor, topic (e.g. Anxiety, CBT), or language..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Location Selector & Geolocation Button */}
          <div className="md:col-span-4 flex gap-2">
            <select
              value={selectedCity}
              onChange={e => handleSelectCity(e.target.value)}
              className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
            >
              <option value="Bengaluru">Bengaluru, KA</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Mumbai">Mumbai, MH</option>
              <option value="Hyderabad">Hyderabad, TS</option>
              <option value="Chennai">Chennai, TN</option>
              <option value="Pune">Pune, MH</option>
            </select>

            <button
              onClick={handleRequestDeviceLocation}
              disabled={isLocating}
              className="px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs flex items-center gap-1.5 transition-colors shrink-0"
              title="Locate via GPS/Browser location"
            >
              <Navigation className="w-3.5 h-3.5 text-teal-400" />
              {isLocating ? 'Locating...' : 'Near Me'}
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-4">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
            >
              <option value="distance">Sort: Nearest Distance First</option>
              <option value="price_low">Sort: Price (Lowest First)</option>
              <option value="price_high">Sort: Price (Highest First)</option>
              <option value="rating">Sort: Highest Rated</option>
              <option value="experience">Sort: Most Experienced</option>
            </select>
          </div>
        </div>

        {/* Price Slider & Modality Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800 text-xs">
          {/* Price Range */}
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-medium">Price Range:</span>
            <span className="font-bold text-teal-400">
              ₹{minPrice} – ₹{maxPrice}
            </span>
            <input
              type="range"
              min="500"
              max="2500"
              step="100"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-32 accent-teal-500 cursor-pointer"
            />
          </div>

          {/* Consultation Type Checkboxes */}
          <div className="flex items-center gap-4 text-slate-300">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filterOnlineOnly}
                onChange={e => setFilterOnlineOnly(e.target.checked)}
                className="rounded accent-teal-500"
              />
              <span>Online Video Call</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filterInPersonOnly}
                onChange={e => setFilterInPersonOnly(e.target.checked)}
                className="rounded accent-teal-500"
              />
              <span>In-Person Clinic</span>
            </label>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            {filteredProviders.length} providers available
          </span>
        </div>

        {locationError && (
          <div className="text-[11px] text-amber-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>{locationError}</span>
          </div>
        )}
      </div>

      {/* Map View Mode */}
      {viewMode === 'map' && (
        <div
          className="p-5 rounded-2xl border space-y-4"
          style={{
            backgroundColor: 'var(--card-bg, #182234)',
            borderColor: 'var(--border-color, #2d3e5b)'
          }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-teal-400" />
              Interactive Provider Radius Map ({selectedCity})
            </h3>
            <span className="text-xs text-slate-400">Distances computed from your location</span>
          </div>

          {/* Visual Map Grid representation */}
          <div className="relative aspect-[21/9] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center p-6">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* User Location Radar Center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-400 animate-ping absolute" />
              <div className="w-4 h-4 rounded-full bg-teal-500 border-2 border-white shadow-lg z-10" />
              <span className="mt-1 px-2 py-0.5 rounded bg-black/80 text-[10px] text-teal-300 font-bold whitespace-nowrap">
                Your Location ({selectedCity})
              </span>
            </div>

            {/* Provider Pins scattered */}
            {filteredProviders.map((prov, i) => {
              const angle = (i / filteredProviders.length) * 2 * Math.PI;
              const radius = 25 + (prov.distanceKm ? Math.min(60, prov.distanceKm * 4) : 35);
              const top = `calc(50% + ${Math.sin(angle) * radius}px)`;
              const left = `calc(50% + ${Math.cos(angle) * radius * 1.8}px)`;

              return (
                <div
                  key={prov.id}
                  style={{ top, left }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  onClick={() => onSelectProviderForBooking(prov)}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-teal-400 text-white flex items-center justify-center text-xs font-bold shadow-xl group-hover:scale-110 transition-transform">
                    🩺
                  </div>
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2.5 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs z-50">
                    <span className="font-bold text-white block">{prov.name}</span>
                    <span className="text-[10px] text-teal-400 block">{prov.specialization}</span>
                    <div className="mt-1 flex justify-between text-[11px] text-slate-300">
                      <span>₹{prov.consultationFee}</span>
                      <span>{prov.distanceKm} km away</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View of Providers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProviders.map(provider => (
          <div
            key={provider.id}
            className="p-5 rounded-2xl border flex flex-col justify-between hover:border-teal-500/40 transition-all shadow-sm"
            style={{
              backgroundColor: 'var(--card-bg, #182234)',
              borderColor: 'var(--border-color, #2d3e5b)'
            }}
          >
            <div>
              {/* Header: Photo, Name, Qualification, Rating */}
              <div className="flex items-start gap-3.5">
                <img
                  src={provider.photoUrl}
                  alt={provider.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white truncate">{provider.name}</h3>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400 shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{provider.rating}</span>
                      <span className="text-[10px] text-slate-400">({provider.reviewCount})</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-teal-400 block">
                    {provider.specialization} • {provider.experienceYears}+ yrs exp
                  </span>
                  <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                    {provider.qualification}
                  </span>
                </div>
              </div>

              {/* Focus Areas Chips */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {provider.focusAreas.map((f, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300"
                  >
                    {f}
                  </span>
                ))}
              </div>

              {/* Clinic Location & Distance */}
              <div className="mt-3 pt-3 border-t border-slate-800 space-y-1 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400 truncate">
                    <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    {provider.clinicLocation}
                  </span>
                  <span className="text-[11px] font-bold text-teal-300 shrink-0 ml-2">
                    {provider.distanceKm} km
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Languages: {provider.languages.join(', ')}</span>
                  <div className="flex items-center gap-1.5">
                    {provider.isOnlineAvailable && (
                      <span className="text-emerald-400 font-medium">● Online</span>
                    )}
                    {provider.isInPersonAvailable && (
                      <span className="text-blue-400 font-medium">● In-Person</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer: Fee & Book Button */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Consultation Fee
                </span>
                <span className="text-lg font-black text-white">₹{provider.consultationFee}</span>
                <span className="text-[10px] text-slate-400 ml-1">/ session</span>
              </div>

              <button
                onClick={() => onSelectProviderForBooking(provider)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" /> Book Appointment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
