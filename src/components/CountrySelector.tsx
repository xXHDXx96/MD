import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { COUNTRIES, CountryItem } from '../data/countries';

interface CountrySelectorProps {
  selectedCode: string;
  onSelect: (country: CountryItem) => void;
  idPrefix?: string;
}

export function CountrySelector({ selectedCode, onSelect, idPrefix = 'signup' }: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Find currently active country object (defaults to +1 if not found or +88)
  const currentCountry = useMemo(() => {
    const found = COUNTRIES.find((c) => c.code === selectedCode);
    if (found) return found;
    return { name: 'International', nameZh: '国际', code: selectedCode, iso: 'GL', flag: '🌐' };
  }, [selectedCode]);

  // Filtered countries based on search term
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return COUNTRIES;
    const query = searchQuery.toLowerCase().trim();
    return COUNTRIES.filter((c) => {
      const matchName = c.name.toLowerCase().includes(query);
      const matchZh = c.nameZh.includes(query);
      const matchCode = c.code.replace('+', '').includes(query.replace('+', ''));
      const matchIso = c.iso.toLowerCase().includes(query);
      return matchName || matchZh || matchCode || matchIso;
    });
  }, [searchQuery]);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search on open
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectCountry = (country: CountryItem) => {
    onSelect(country);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative inline-block" ref={dropdownRef} id={`${idPrefix}CountrySelectorWrapper`}>
      {/* Trigger Button */}
      <button
        type="button"
        id={`${idPrefix}CountryCodeBtn`}
        onClick={() => setIsOpen(!isOpen)}
        className="countryintl flex items-center space-x-1.5 py-1 pr-2 text-black cursor-pointer select-none font-medium hover:text-[#2a58b6] transition-colors focus:outline-none"
        title="Select Country / Region"
      >
        <span className="text-[17px] leading-none" role="img" aria-label={currentCountry.name}>
          {currentCountry.flag}
        </span>
        <span className="text-[15px] font-semibold text-[#111]">{currentCountry.code}</span>
        <ChevronDown
          size={14}
          className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#2a58b6]' : ''}`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          id={`${idPrefix}CountryDropdown`}
          className="absolute left-0 top-[calc(100%+6px)] w-72 sm:w-80 max-w-[calc(100vw-36px)] bg-white border border-gray-200 rounded-lg shadow-2xl z-[999] overflow-hidden animate-fadeIn"
          style={{
            maxHeight: '340px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Search Header */}
          <div className="p-2.5 border-b border-gray-100 bg-gray-50/80 sticky top-0 z-10">
            <div className="relative flex items-center">
              <Search size={15} className="absolute left-2.5 text-gray-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country or code (e.g. +86, US, 日本)"
                className="w-full pl-8 pr-7 py-1.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2a58b6] focus:ring-1 focus:ring-[#2a58b6]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Country List */}
          <div className="overflow-y-auto flex-1 divide-y divide-gray-50 divide-solid py-1">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => {
                const isSelected = country.code === selectedCode && country.iso === currentCountry.iso;
                return (
                  <div
                    key={`${country.iso}-${country.code}`}
                    onClick={() => handleSelectCountry(country)}
                    className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/80 text-[#2a58b6] font-medium'
                        : 'text-gray-800 hover:bg-gray-100/80'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <span className="text-[17px] leading-none shrink-0" role="img" aria-label={country.name}>
                        {country.flag}
                      </span>
                      <span className="truncate">
                        {country.name} <span className="text-gray-400 text-xs font-normal">({country.nameZh})</span>
                      </span>
                    </div>
                    <span className="font-semibold text-xs sm:text-sm ml-2 shrink-0 text-gray-600">
                      {country.code}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-gray-400">
                No matching country or region found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
