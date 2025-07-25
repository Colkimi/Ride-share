import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Clock, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useNavigate } from '@tanstack/react-router';

interface SearchResult {
  id: string;
  type: 'location' | 'ride' | 'driver';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  action: () => void;
}

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export function SearchBar({ className, placeholder = "Search locations, rides, drivers..." }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      setIsLoading(true);
      // Simulate search results
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'location',
          title: 'Downtown',
          subtitle: 'San Francisco, CA',
          icon: <MapPin className="h-4 w-4" />,
          action: () => {
            navigate({ to: '/create' });
            setIsOpen(false);
          },
        },
        {
          id: '2',
          type: 'ride',
          title: 'Airport Transfer',
          subtitle: 'Completed 2 days ago',
          icon: <Clock className="h-4 w-4" />,
          action: () => {
            navigate({ to: '/bookings' });
            setIsOpen(false);
          },
        },
        {
          id: '3',
          type: 'driver',
          title: 'John Smith',
          subtitle: '4.8 ★ • 150+ rides',
          icon: <Star className="h-4 w-4" />,
          action: () => {
            navigate({ to: '/driver' });
            setIsOpen(false);
          },
        },
      ];
      
      setTimeout(() => {
        setResults(mockResults.filter(r => 
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.subtitle.toLowerCase().includes(query.toLowerCase())
        ));
        setIsLoading(false);
      }, 300);
    } else {
      setResults([]);
    }
  }, [query, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate({ to: '/create', search: { destination: query } });
      setIsOpen(false);
    }
  };

  return (
    <div ref={searchRef} className={cn('relative', className)}>
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </form>

      {isOpen && (query || results.length > 0) && (
        <Card className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y">
              {results.map((result) => (
                <button
                  key={result.id}
                  className="w-full p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  onClick={result.action}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 text-muted-foreground">
                      {result.icon}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{result.title}</div>
                      <div className="text-xs text-muted-foreground">{result.subtitle}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.length > 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found for "{query}"
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Start typing to search...
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export function MobileSearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900">
          <div className="p-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <SearchBar
                className="flex-1"
                placeholder="Search..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
