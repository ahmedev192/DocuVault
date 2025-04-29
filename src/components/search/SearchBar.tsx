
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, X } from 'lucide-react';
import { useDocumentStore } from '@/store/document-store';
import { Button } from '@/components/ui/button';

const SearchBar = () => {
  const { searchQuery, setSearchQuery } = useDocumentStore();
  const [inputValue, setInputValue] = React.useState(searchQuery);
  
  React.useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(inputValue);
  };
  
  const clearSearch = () => {
    setInputValue('');
    setSearchQuery('');
  };
  
  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search documents by name, content, or tag:name"
          className="pl-10 pr-10"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        {inputValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full rounded-l-none"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear</span>
          </Button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
