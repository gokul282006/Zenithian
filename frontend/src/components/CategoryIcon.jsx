import React from 'react';
import { 
  TrendingUp, 
  History, 
  MapPin, 
  GraduationCap, 
  HeartPulse, 
  Building2, 
  Trees, 
  DollarSign, 
  Newspaper, 
  FileText 
} from 'lucide-react';

export default function CategoryIcon({ category, className = "w-4 h-4" }) {
  const catKey = (category || '').toLowerCase();
  if (catKey.includes('trending') || catKey.includes('event')) return <TrendingUp className={className} />;
  if (catKey.includes('history')) return <History className={className} />;
  if (catKey.includes('geography') || catKey.includes('map')) return <MapPin className={className} />;
  if (catKey.includes('education')) return <GraduationCap className={className} />;
  if (catKey.includes('health')) return <HeartPulse className={className} />;
  if (catKey.includes('infra')) return <Building2 className={className} />;
  if (catKey.includes('tour') || catKey.includes('env')) return <Trees className={className} />;
  if (catKey.includes('econ')) return <DollarSign className={className} />;
  if (catKey.includes('news')) return <Newspaper className={className} />;
  return <FileText className={className} />;
}
