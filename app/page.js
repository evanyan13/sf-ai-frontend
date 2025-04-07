"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Search } from "lucide-react"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/analysis?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-center text-slate-800">Start COF Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by entity..."
                className="pl-4 pr-4 py-6 text-base rounded-lg border-slate-200 focus-visible:ring-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch()
                }}
              />
            </div>
            <Button
              className="w-full py-6 text-base bg-blue-800 hover:bg-blue-700 transition-colors"
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
            >
              <Search className="mr-2 h-5 w-5" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
