import React, { useState, useEffect } from 'react';
import { Phone, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';

export interface CountryConfig {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  regex: RegExp;
  placeholder: string;
  hint: string;
}

export const COUNTRIES: CountryConfig[] = [
  {
    code: 'IN',
    name: 'India',
    dialCode: '+91',
    flag: '🇮🇳',
    regex: /^[6-9]\d{9}$/,
    placeholder: '98765 43210',
    hint: '10 digits starting with 6, 7, 8, or 9',
  },
  {
    code: 'US',
    name: 'United States',
    dialCode: '+1',
    flag: '🇺🇸',
    regex: /^[2-9]\d{9}$/,
    placeholder: '555 123 4567',
    hint: '10 digits (standard US area code & number)',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    dialCode: '+44',
    flag: '🇬🇧',
    regex: /^7\d{9}$/,
    placeholder: '7123 456789',
    hint: '10 digits mobile starting with 7',
  },
  {
    code: 'CA',
    name: 'Canada',
    dialCode: '+1',
    flag: '🇨🇦',
    regex: /^[2-9]\d{9}$/,
    placeholder: '416 123 4567',
    hint: '10 digits standard North American format',
  },
  {
    code: 'AU',
    name: 'Australia',
    dialCode: '+61',
    flag: '🇦🇺',
    regex: /^4\d{8}$/,
    placeholder: '412 345 678',
    hint: '9 digits mobile starting with 4',
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    dialCode: '+971',
    flag: '🇦🇪',
    regex: /^5\d{8}$/,
    placeholder: '50 123 4567',
    hint: '9 digits mobile starting with 5',
  },
  {
    code: 'SG',
    name: 'Singapore',
    dialCode: '+65',
    flag: '🇸🇬',
    regex: /^[89]\d{7}$/,
    placeholder: '8123 4567',
    hint: '8 digits starting with 8 or 9',
  },
  {
    code: 'DE',
    name: 'Germany',
    dialCode: '+49',
    flag: '🇩🇪',
    regex: /^1[567]\d{8,9}$/,
    placeholder: '151 23456789',
    hint: 'Mobile number starting with 15, 16, or 17',
  },
  {
    code: 'FR',
    name: 'France',
    dialCode: '+33',
    flag: '🇫🇷',
    regex: /^[67]\d{8}$/,
    placeholder: '6 12 34 56 78',
    hint: '9 digits mobile starting with 6 or 7',
  },
  {
    code: 'JP',
    name: 'Japan',
    dialCode: '+81',
    flag: '🇯🇵',
    regex: /^[789]0\d{8}$/,
    placeholder: '90 1234 5678',
    hint: '10 digits mobile starting with 70, 80, or 90',
  },
  {
    code: 'OTHER',
    name: 'Other International',
    dialCode: '+',
    flag: '🌐',
    regex: /^\d{7,15}$/,
    placeholder: '1234567890',
    hint: '7 to 15 digits international number',
  },
];

interface PhoneInputWithCountryProps {
  value: string;
  onChange: (fullPhoneNumber: string, isValid: boolean) => void;
  required?: boolean;
  label?: string;
  id?: string;
}

export const PhoneInputWithCountry: React.FC<PhoneInputWithCountryProps> = ({
  value,
  onChange,
  required = true,
  label = 'Phone Number',
  id = 'phone-input',
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryConfig>(COUNTRIES[0]); // Default India +91
  const [nationalNumber, setNationalNumber] = useState('');
  const [isTouched, setIsTouched] = useState(false);

  // Parse initial value if provided
  useEffect(() => {
    if (value && !nationalNumber) {
      // Find if value starts with any dial code
      const matched = COUNTRIES.find((c) => c.dialCode !== '+' && value.startsWith(c.dialCode));
      if (matched) {
        setSelectedCountry(matched);
        const digits = value.slice(matched.dialCode.length).replace(/\D/g, '');
        setNationalNumber(digits);
      } else {
        const digits = value.replace(/\D/g, '');
        setNationalNumber(digits);
      }
    }
  }, []);

  // Clean raw digits from input
  const cleanDigits = nationalNumber.replace(/\D/g, '');
  const isValid = selectedCountry.regex.test(cleanDigits);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = COUNTRIES.find((c) => c.code === e.target.value) || COUNTRIES[0];
    setSelectedCountry(country);
    const valid = country.regex.test(cleanDigits);
    const fullNumber = cleanDigits ? `${country.dialCode} ${cleanDigits}` : '';
    onChange(fullNumber, valid);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawVal = e.target.value;
    let digitsOnly = rawVal.replace(/\D/g, '');

    // If user pasted with country dialing code prefix (e.g. 91 for India +91)
    const codeDigits = selectedCountry.dialCode.replace(/\D/g, '');
    if (codeDigits && digitsOnly.startsWith(codeDigits) && digitsOnly.length > 10) {
      digitsOnly = digitsOnly.slice(codeDigits.length);
    }
    // If user typed a leading trunk zero (e.g., 09876543210) for 10-digit mobile
    if (digitsOnly.startsWith('0') && digitsOnly.length === 11) {
      digitsOnly = digitsOnly.slice(1);
    }

    setNationalNumber(digitsOnly);
    setIsTouched(true);

    const valid = selectedCountry.regex.test(digitsOnly);
    const fullNumber = digitsOnly ? `${selectedCountry.dialCode} ${digitsOnly}` : '';
    onChange(fullNumber, valid);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {isTouched && cleanDigits.length > 0 && (
          <span
            className={`text-[11px] font-bold flex items-center gap-1 ${
              isValid ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {isValid ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Valid Number</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 text-amber-600" />
                <span>Pattern Mismatch</span>
              </>
            )}
          </span>
        )}
      </div>

      <div className="flex items-stretch rounded-xl border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-red-500 focus-within:border-red-500 transition-all overflow-hidden shadow-xs">
        {/* Country Code Select Dropdown - Compact Trigger */}
        <div className="relative shrink-0 flex items-center bg-slate-50 hover:bg-slate-100 border-r border-slate-200 transition-colors px-2.5 py-2 cursor-pointer">
          <div className="flex items-center gap-1.5 pointer-events-none select-none">
            <span className="text-base leading-none">{selectedCountry.flag}</span>
            <span className="text-xs font-bold text-slate-800 font-mono">{selectedCountry.dialCode}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
          {/* Native select overlay for accessibility and mobile/desktop sheet */}
          <select
            value={selectedCountry.code}
            onChange={handleCountryChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-sm"
            title="Select country dialing code"
            aria-label="Select country dialing code"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name} ({c.dialCode})
              </option>
            ))}
          </select>
        </div>

        {/* National Number Input Field */}
        <div className="relative flex-1 min-w-0 flex items-center bg-white">
          <input
            id={id}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            required={required}
            value={nationalNumber}
            onChange={handleNumberChange}
            onBlur={() => setIsTouched(true)}
            placeholder={`e.g. ${selectedCountry.placeholder}`}
            className="w-full min-w-0 bg-transparent px-3 py-2 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          />
          {cleanDigits.length > 0 && (
            <div className="pr-3 shrink-0">
              {isValid ? (
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center" title="Valid Phone Number">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center" title="Pattern Mismatch">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Regex format hint and error explanation */}
      <div className="flex items-center justify-between text-[11px] pt-0.5">
        <span className="text-slate-500">
          Format: <span className="font-mono font-medium text-slate-700">{selectedCountry.hint}</span>
        </span>
        {isTouched && cleanDigits.length > 0 && !isValid && (
          <span className="text-amber-600 font-semibold text-right">
            Regex required: {selectedCountry.regex.toString()}
          </span>
        )}
      </div>
    </div>
  );
};
