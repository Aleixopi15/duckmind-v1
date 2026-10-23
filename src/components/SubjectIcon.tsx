import {
  Calculator,
  Zap,
  FlaskConical,
  Dna,
  Landmark,
  Globe,
  Brain,
  Users,
  BookOpen,
  PenLine,
  Palette,
  Languages,
  BookMarked,
  type LucideIcon,
} from 'lucide-react';

type SubjectIconProps = {
  name?: string;
  icon?: string;
  className?: string;
  size?: number;
};

const NAME_ICON_MAP: Record<string, LucideIcon> = {
  matemática: Calculator,
  física: Zap,
  química: FlaskConical,
  biologia: Dna,
  história: Landmark,
  geografia: Globe,
  filosofia: Brain,
  sociologia: Users,
  português: BookOpen,
  literatura: BookOpen,
  gramática: BookOpen,
  redação: PenLine,
  artes: Palette,
  inglês: Languages,
  espanhol: Languages,
  linguagens: BookOpen,
  humanas: Landmark,
  natureza: Dna,
};

export default function SubjectIcon({ name, icon, className = '', size = 16 }: SubjectIconProps) {
  if (name) {
    const normalized = name.toLowerCase().trim();
    for (const [key, IconComponent] of Object.entries(NAME_ICON_MAP)) {
      if (normalized.includes(key)) {
        return <IconComponent size={size} className={className} />;
      }
    }
  }

  // If icon is an emoji, we can map common emoji indicators to Lucide icons
  if (icon) {
    if (icon.includes('📐') || icon.includes('🔢')) return <Calculator size={size} className={className} />;
    if (icon.includes('⚡') || icon.includes('💡')) return <Zap size={size} className={className} />;
    if (icon.includes('🧪')) return <FlaskConical size={size} className={className} />;
    if (icon.includes('🧬')) return <Dna size={size} className={className} />;
    if (icon.includes('🏛️')) return <Landmark size={size} className={className} />;
    if (icon.includes('🌍') || icon.includes('🌎')) return <Globe size={size} className={className} />;
    if (icon.includes('💭') || icon.includes('🧠')) return <Brain size={size} className={className} />;
    if (icon.includes('👥')) return <Users size={size} className={className} />;
    if (icon.includes('📖') || icon.includes('📚')) return <BookOpen size={size} className={className} />;
    if (icon.includes('✍️') || icon.includes('✏️')) return <PenLine size={size} className={className} />;
    if (icon.includes('🎨')) return <Palette size={size} className={className} />;
    if (icon.includes('🗣️')) return <Languages size={size} className={className} />;
  }

  return <BookMarked size={size} className={className} />;
}
