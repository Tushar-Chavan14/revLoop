"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { searchPlaces, type LocationSuggestion, type LocationType } from "@/utils/geocode-search";

export type { LocationSuggestion };

interface LocationAutocompleteProps {
  id?: string;
  name: string;
  value: string;
  placeholder?: string;
  types: LocationType;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** Fired (in addition to onChange) when the user picks a suggestion — gives coordinates for map-based fields. */
  onSelectLocation?: (location: LocationSuggestion) => void;
}

export function LocationAutocomplete({
  id,
  name,
  value,
  placeholder,
  types,
  onChange,
  onBlur,
  onSelectLocation,
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [menuRect, setMenuRect] = useState<{ top: number; left: number; width: number } | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const insideContainer = containerRef.current?.contains(target);
      const insideMenu = menuRef.current?.contains(target);
      if (!insideContainer && !insideMenu) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function close() {
      setIsOpen(false);
    }

    // Simplest way to keep the portalled menu from drifting away from the
    // input: close it if the page scrolls or resizes instead of tracking and
    // repositioning it continuously.
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [isOpen]);

  const openMenuAtInput = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setMenuRect({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setIsOpen(true);
  };

  const handleChange = (query: string) => {
    onChange(query);
    setActiveIndex(-1);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchPlaces(query, types);
        setSuggestions(results);
        if (results.length > 0) {
          openMenuAtInput();
        } else {
          setIsOpen(false);
        }
      } catch {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);
  };

  const selectSuggestion = (suggestion: LocationSuggestion) => {
    onChange(suggestion.name);
    onSelectLocation?.(suggestion);
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        ref={inputRef}
        id={id}
        name={name}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        onFocus={() => suggestions.length > 0 && openMenuAtInput()}
      />
      {isOpen &&
        menuRect &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: menuRect.top, left: menuRect.left, width: menuRect.width }}
            className="border-border bg-popover absolute z-50 overflow-hidden rounded-lg border shadow-md"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(suggestion)}
                className={cn(
                  "flex w-full flex-col px-3 py-2 text-left text-sm transition-colors",
                  index === activeIndex
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <span className="font-medium">{suggestion.name}</span>
                {suggestion.displayName && (
                  <span className="text-muted-foreground text-xs">{suggestion.displayName}</span>
                )}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
