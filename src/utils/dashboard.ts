"use client";

import { subDays, differenceInDays, parseISO, isWithinInterval } from 'date-fns';
import { Sale, Expense, Product, Database } from '../types';

export const getPreviousPeriod = (start: string, end: string) => {
  const startDate = parseISO(start);
  const endDate = parseISO(end);
  const daysDiff = differenceInDays(endDate, startDate) + 1;
  
  return {
    start: subDays(startDate, daysDiff).toISOString().split('T')[0],
    end: subDays(startDate, 1).toISOString().split('T')[0]
  };
};

export const calculateTrend = (current: number, previous: number) => {
  const curr = typeof current === 'number' && !isNaN(current) ? current : 0;
  const prev = typeof previous === 'number' && !isNaN(previous) ? previous : 0;
  if (prev === 0) return curr > 0 ? 100 : 0;
  const val = ((curr - prev) / prev) * 100;
  return isNaN(val) ? 0 : val;
};

export const filterData = (data: any[], start: string, end: string, filters: any) => {
  if (!data || !Array.isArray(data)) return [];
  
  return data.filter(item => {
    if (!item || !item.date) return false;
    
    const date = item.date.split('T')[0];
    const inPeriod = date >= start && date <= end;
    if (!inPeriod) return false;

    if (filters.sellerId && item.sellerId !== filters.sellerId) return false;
    if (filters.customerId && item.customerId !== filters.customerId) return false;
    if (filters.category && item.items?.every((i: any) => i.product?.category !== filters.category)) return false;
    
    return true;
  });
};