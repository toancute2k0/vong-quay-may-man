'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, RefreshCw } from 'lucide-react';

interface Option {
  id: string;
  label: string;
  color: string;
  textColor: string;
}

interface HistoryItem extends Option {
  timestamp: string;
}

interface ControlsProps {
  options: Option[];
  history: HistoryItem[];
  onAddOption: (label: string) => void;
  onDeleteOption: (id: string) => void;
  onClearHistory: () => void;
}

export default function Controls({ options, history, onAddOption, onDeleteOption, onClearHistory }: ControlsProps) {
  const [newOption, setNewOption] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newOption.trim()) {
      onAddOption(newOption.trim());
      setNewOption('');
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit' });
  };

  return (
    <Card className="w-full max-w-md h-[600px] flex flex-col bg-[#8B0000]/95 backdrop-blur-sm shadow-xl border-4 border-[#FFD700] rounded-xl overflow-hidden">
      <CardHeader className="pb-2 border-b border-[#FFD700]/30 bg-[#990000]">
        <CardTitle className="text-center text-[#FFD700] text-xl uppercase tracking-wider font-black drop-shadow-sm">Bảng Điều Khiển</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col pt-0">
        <Tabs defaultValue="options" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-[#600000] p-1 rounded-lg">
            <TabsTrigger 
              value="options"
              className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-[#8B0000] data-[state=active]:font-bold text-gray-300"
            >
              Mục ({options.length})
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-[#8B0000] data-[state=active]:font-bold text-gray-300"
            >
              Kết quả ({history.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="options" className="flex-1 flex flex-col overflow-hidden data-[state=inactive]:hidden">
            <form onSubmit={handleAdd} className="flex gap-2 mb-4 p-1">
              <Input
                placeholder="Nhập tên món ăn..."
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                className="flex-1 bg-white/90 border-2 border-transparent focus:border-[#FFD700] text-[#8B0000] placeholder:text-[#8B0000]/50 font-medium"
                autoFocus
              />
              <Button 
                type="submit" 
                size="icon"
                className="bg-[#FFD700] hover:bg-[#FFC107] text-[#8B0000] border-2 border-white shadow-md w-12 shrink-0"
              >
                <Plus className="h-6 w-6 font-bold" />
              </Button>
            </form>

            <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
              {options.length === 0 && (
                <div className="text-center text-muted-foreground mt-10">
                  Chưa có món ăn nào
                </div>
              )}
              {options.map((opt) => (
                <div 
                  key={opt.id} 
                  className="flex items-center justify-between p-3 rounded-lg border bg-card text-card-foreground shadow-sm animate-in fade-in slide-in-from-bottom-2"
                  style={{ borderLeft: `4px solid ${opt.color === '#FFFFFF' ? '#ccc' : opt.color}` }}
                >
                  <span className="font-medium truncate flex-1 mr-2">{opt.label}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDeleteOption(opt.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="flex-1 flex flex-col overflow-hidden data-[state=inactive]:hidden">
            <div className="flex justify-end mb-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onClearHistory}
                    className="text-muted-foreground hover:text-destructive text-xs"
                    disabled={history.length === 0}
                >
                    <Trash2 className="h-3 w-3 mr-1" /> Xoá lịch sử
                </Button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-0 divide-y custom-scrollbar">
               {history.length === 0 && (
                 <div className="text-center text-muted-foreground mt-10">
                   Chưa có lịch sử quay
                 </div>
               )}
               {history.map((item, index) => (
                 <div key={index} className="flex justify-between items-center py-3 px-1 animate-in fade-in border-b border-[#FFD700]/10 last:border-0 hover:bg-white/5 rounded-md transition-colors">
                   <span className="font-bold text-[#FFD700] text-lg drop-shadow-sm">{item.label}</span>
                   <span className="text-xs text-white/70 font-mono">{formatDate(item.timestamp)}</span>
                 </div>
               ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
