'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, Globe, ChevronDown } from 'lucide-react';

const ALL_TIMEZONES = [
  { value: 'Pacific/Honolulu',               label: 'Hawaii',               offset: 'UTC−10'  },
  { value: 'America/Anchorage',              label: 'Alaska',               offset: 'UTC−9'   },
  { value: 'America/Los_Angeles',            label: 'Pacific Time (US)',    offset: 'UTC−8'   },
  { value: 'America/Denver',                 label: 'Mountain Time (US)',   offset: 'UTC−7'   },
  { value: 'America/Phoenix',                label: 'Arizona',              offset: 'UTC−7'   },
  { value: 'America/Chicago',                label: 'Central Time (US)',    offset: 'UTC−6'   },
  { value: 'America/New_York',               label: 'Eastern Time (US)',    offset: 'UTC−5'   },
  { value: 'America/Halifax',                label: 'Atlantic Time (CA)',   offset: 'UTC−4'   },
  { value: 'America/Sao_Paulo',              label: 'Brasília',             offset: 'UTC−3'   },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires',        offset: 'UTC−3'   },
  { value: 'Atlantic/Azores',                label: 'Azores',               offset: 'UTC−1'   },
  { value: 'UTC',                            label: 'UTC',                  offset: 'UTC+0'   },
  { value: 'Europe/London',                  label: 'London',               offset: 'UTC+0'   },
  { value: 'Europe/Dublin',                  label: 'Dublin',               offset: 'UTC+0'   },
  { value: 'Europe/Lisbon',                  label: 'Lisbon',               offset: 'UTC+0'   },
  { value: 'Europe/Paris',                   label: 'Paris / Berlin',       offset: 'UTC+1'   },
  { value: 'Europe/Rome',                    label: 'Rome / Madrid',        offset: 'UTC+1'   },
  { value: 'Europe/Warsaw',                  label: 'Warsaw',               offset: 'UTC+1'   },
  { value: 'Europe/Helsinki',                label: 'Helsinki / Tallinn',   offset: 'UTC+2'   },
  { value: 'Europe/Kiev',                    label: 'Kyiv',                 offset: 'UTC+2'   },
  { value: 'Africa/Cairo',                   label: 'Cairo',                offset: 'UTC+2'   },
  { value: 'Africa/Johannesburg',            label: 'Johannesburg',         offset: 'UTC+2'   },
  { value: 'Europe/Moscow',                  label: 'Moscow',               offset: 'UTC+3'   },
  { value: 'Asia/Istanbul',                  label: 'Istanbul',             offset: 'UTC+3'   },
  { value: 'Asia/Riyadh',                    label: 'Riyadh',               offset: 'UTC+3'   },
  { value: 'Asia/Dubai',                     label: 'Dubai / Abu Dhabi',    offset: 'UTC+4'   },
  { value: 'Asia/Baku',                      label: 'Baku',                 offset: 'UTC+4'   },
  { value: 'Asia/Karachi',                   label: 'Karachi',              offset: 'UTC+5'   },
  { value: 'Asia/Tashkent',                  label: 'Tashkent',             offset: 'UTC+5'   },
  { value: 'Asia/Kolkata',                   label: 'India (IST)',          offset: 'UTC+5:30' },
  { value: 'Asia/Colombo',                   label: 'Colombo',              offset: 'UTC+5:30' },
  { value: 'Asia/Dhaka',                     label: 'Dhaka',                offset: 'UTC+6'   },
  { value: 'Asia/Yangon',                    label: 'Yangon',               offset: 'UTC+6:30' },
  { value: 'Asia/Bangkok',                   label: 'Bangkok / Jakarta',    offset: 'UTC+7'   },
  { value: 'Asia/Ho_Chi_Minh',              label: 'Ho Chi Minh City',     offset: 'UTC+7'   },
  { value: 'Asia/Shanghai',                  label: 'China (CST)',          offset: 'UTC+8'   },
  { value: 'Asia/Singapore',                 label: 'Singapore',            offset: 'UTC+8'   },
  { value: 'Asia/Kuala_Lumpur',             label: 'Kuala Lumpur',         offset: 'UTC+8'   },
  { value: 'Asia/Hong_Kong',                label: 'Hong Kong',            offset: 'UTC+8'   },
  { value: 'Asia/Taipei',                    label: 'Taipei',               offset: 'UTC+8'   },
  { value: 'Asia/Seoul',                     label: 'Seoul',                offset: 'UTC+9'   },
  { value: 'Asia/Tokyo',                     label: 'Tokyo',                offset: 'UTC+9'   },
  { value: 'Australia/Perth',                label: 'Perth',                offset: 'UTC+8'   },
  { value: 'Australia/Darwin',               label: 'Darwin',               offset: 'UTC+9:30' },
  { value: 'Australia/Adelaide',             label: 'Adelaide',             offset: 'UTC+9:30' },
  { value: 'Australia/Sydney',               label: 'Sydney / Melbourne',   offset: 'UTC+10'  },
  { value: 'Australia/Brisbane',             label: 'Brisbane',             offset: 'UTC+10'  },
  { value: 'Pacific/Auckland',               label: 'Auckland',             offset: 'UTC+12'  },
  { value: 'Pacific/Fiji',                   label: 'Fiji',                 offset: 'UTC+12'  },
];

export function getAllTimezones() {
  return ALL_TIMEZONES;
}

export default function TimezoneSelect({ value, onChange, className = '' }) {
  const [open, setOpen]           = useState(false);
  const [search, setSearch]       = useState('');
  const [dropdownPos, setDropPos] = useState({ top: 0, left: 0, width: 0, openUp: false });
  const triggerRef                = useRef(null);
  const inputRef                  = useRef(null);
  const dropdownRef               = useRef(null);
  const [mounted, setMounted]     = useState(false);

  // Only render portal on the client
  useEffect(() => { setMounted(true); }, []);

  const selected = ALL_TIMEZONES.find(tz => tz.value === value)
    || { label: value || 'Select timezone', offset: '' };

  const filtered = search
    ? ALL_TIMEZONES.filter(tz =>
        tz.label.toLowerCase().includes(search.toLowerCase()) ||
        tz.value.toLowerCase().includes(search.toLowerCase()) ||
        tz.offset.toLowerCase().includes(search.toLowerCase())
      )
    : ALL_TIMEZONES;

  // Calculate dropdown position using trigger's bounding rect
  const calcPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect       = triggerRef.current.getBoundingClientRect();
    const dropHeight = 300; // max dropdown height
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUp     = spaceBelow < dropHeight && spaceAbove > spaceBelow;

    setDropPos({
      top:    openUp
        ? rect.top + window.scrollY - dropHeight - 4
        : rect.bottom + window.scrollY + 4,
      left:   rect.left + window.scrollX,
      width:  rect.width,
      openUp,
    });
  }, []);

  const handleOpen = () => {
    calcPosition();
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleClose = useCallback(() => {
    setOpen(false);
    setSearch('');
  }, []);

  // Close on outside click and scroll
  useEffect(() => {
    if (!open) return;

    const handleOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        triggerRef.current  && !triggerRef.current.contains(e.target)
      ) {
        handleClose();
      }
    };

    const handleScroll = () => {
      if (open) calcPosition(); // reposition on scroll
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') handleClose();
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('scroll',    handleScroll,  true);
    window.addEventListener('resize',      calcPosition);
    document.addEventListener('keydown',   handleEsc);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('scroll',    handleScroll, true);
      window.removeEventListener('resize',      calcPosition);
      document.removeEventListener('keydown',   handleEsc);
    };
  }, [open, handleClose, calcPosition]);

  const handleSelect = (tz) => {
    onChange(tz.value);
    handleClose();
  };

  // The portal dropdown — rendered directly into document.body
  const dropdown = open && mounted && createPortal(
    <div
      ref={dropdownRef}
      style={{
        position:  'absolute',
        top:       dropdownPos.top,
        left:      dropdownPos.left,
        width:     dropdownPos.width,
        zIndex:    9999,
        background: '#0d1528',
        border:    '1px solid rgba(82,113,195,0.35)',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(82,113,195,0.1)',
        overflow:  'hidden',
        animation: 'fadeIn 0.12s ease',
      }}
    >
      {/* Search */}
      <div style={{ padding: '8px', borderBottom: '1px solid rgba(82,113,195,0.15)' }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={13}
            style={{
              position: 'absolute', left: 10, top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(126,149,210,0.5)', pointerEvents: 'none',
            }}
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search timezone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: 30, paddingRight: 12,
              paddingTop: 8, paddingBottom: 8,
              fontSize: 12,
              background: 'rgba(10,15,30,0.7)',
              border: '1px solid rgba(82,113,195,0.2)',
              borderRadius: 8,
              color: 'white',
              outline: 'none',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(82,113,195,0.6)'; }}
            onBlur={e  => { e.target.style.borderColor = 'rgba(82,113,195,0.2)'; }}
          />
        </div>
      </div>

      {/* Options list */}
      <div style={{ maxHeight: 240, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <p style={{ color: 'rgba(126,149,210,0.5)', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>
            No timezones found
          </p>
        ) : (
          filtered.map(tz => {
            const isSelected = tz.value === value;
            return (
              <button
                key={tz.value}
                type="button"
                onClick={() => handleSelect(tz)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  fontSize: 13,
                  textAlign: 'left',
                  background: isSelected ? 'rgba(58,90,180,0.3)' : 'transparent',
                  color: isSelected ? 'white' : 'rgba(170,184,225,0.85)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(30,49,120,0.5)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(170,184,225,0.85)'; }}
              >
                <span>{tz.label}</span>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(126,149,210,0.6)', marginLeft: 12, flexShrink: 0 }}>
                  {tz.offset}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>,
    document.body
  );

  return (
    <div ref={triggerRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={open ? handleClose : handleOpen}
        className="input-field flex items-center justify-between gap-2 text-left w-full"
        style={{ cursor: 'pointer' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Globe size={14} className="text-navy-400 shrink-0" />
          <span className="truncate text-sm text-white">{selected.label}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-navy-500 text-xs font-mono">{selected.offset}</span>
          <ChevronDown
            size={14}
            className="text-navy-400 transition-transform duration-200"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </div>
      </button>

      {/* Portal dropdown */}
      {dropdown}
    </div>
  );
}
