import { createClient } from '@supabase/supabase-js';

// Helper to safely get environment variables in different environments (Vite, Next.js, etc.)
const getEnv = (key: string) => {
  // Check for Vite/Browser standard
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  
  // Check for Node.js/Next.js standard (safely)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore ReferenceError if process is not defined
  }
  
  return '';
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL') || getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_ANON_KEY');

export const isConfigured = !!(supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey);

// Fallback for demo purposes so the app doesn't crash immediately if keys are missing
const validUrl = isConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const validKey = isConfigured ? supabaseAnonKey : 'placeholder';

export const supabase = createClient(validUrl, validKey);

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const getImageUrl = (path: string) => {
  if (!path) return 'https://picsum.photos/400/400';
  if (path.startsWith('http')) return path;
  // If no Supabase URL is set, return a placeholder
  if (!isConfigured) return 'https://picsum.photos/400/400';
  return `${validUrl}/storage/v1/object/public/product-images/${path}`;
};