'use client';

import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { convertSolar2Lunar } from '@/lib/utils/lunar-calendar';

interface DateTimeState {
  solar: { day: number; month: number; year: number; hour: number; minute: number };
  lunar: { day: number; month: number; year: number; leap: number };
}

export default function DateTimeInfo() {
  const [dateTime, setDateTime] = useState<DateTimeState | null>(null);

  useEffect(() => {
    const now = new Date();
    const dd = now.getDate();
    const mm = now.getMonth() + 1;
    const yy = now.getFullYear();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Chuyển đổi sang âm lịch
    const lunar = convertSolar2Lunar(dd, mm, yy, 7.0);

    setDateTime({
      solar: { day: dd, month: mm, year: yy, hour, minute },
      lunar: {
        day: lunar.day,
        month: lunar.month,
        year: lunar.year,
        leap: lunar.leap,
      },
    });
  }, []);

  if (!dateTime) return null;

  return (
    <div className="flex-shrink-0 rounded-lg border border-primary/30 bg-background/50 px-4 py-3">
      <div className="mb-2 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold text-foreground">
          {'Thời gian lập quẻ'}
        </span>
      </div>
      <div className="space-y-1.5 text-xs">
        {/* Dương lịch */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">{'Dương lịch:'}</span>
          <span className="font-medium text-foreground">
            {String(dateTime.solar.hour).padStart(2, '0')}:
            {String(dateTime.solar.minute).padStart(2, '0')} -{' '}
            {String(dateTime.solar.day).padStart(2, '0')}/
            {String(dateTime.solar.month).padStart(2, '0')}/
            {dateTime.solar.year}
          </span>
        </div>
        {/* Âm lịch */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">{'Âm lịch:'}</span>
          <span className="font-medium text-foreground">
            {String(dateTime.lunar.day).padStart(2, '0')}/
            {dateTime.lunar.leap === 1 ? 'Nhuận ' : ''}
            {String(dateTime.lunar.month).padStart(2, '0')}/{dateTime.lunar.year}
          </span>
        </div>
      </div>
    </div>
  );
}
