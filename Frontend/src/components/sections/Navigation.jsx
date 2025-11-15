import { Sprout, Droplets, Bug, MapPin, Leaf, Users, DollarSign, Truck, FileText, TrendingUp } from 'lucide-react';

const sections = [
  { id: 'dashboard', name: 'Dashboard', icon: TrendingUp, color: 'indigo' },
  { id: 'parcelas', name: 'Parcelas', icon: MapPin, color: 'emerald' },
  { id: 'trabajadores', name: 'Personal', icon: Users, color: 'blue' },
  { id: 'finanzas', name: 'Finanzas', icon: DollarSign, color: 'violet' },
  { id: 'maquinaria', name: 'Maquinaria', icon: Truck, color: 'orange' },
  { id: 'semillas', name: 'Semillas', icon: Sprout, color: 'green' },
  { id: 'plagas', name: 'Plagas', icon: Bug, color: 'red' },
  { id: 'riego', name: 'Riego', icon: Droplets, color: 'cyan' },
  { id: 'fertilizantes', name: 'Fertilizantes', icon: Leaf, color: 'amber' },
  { id: 'reportes', name: 'Reportes', icon: FileText, color: 'slate' },
];

const Navigation = ({ activeSection, setActiveSection }) => (
  <div className="am-nav-grid">
    {sections.map((section) => {
      const Icon = section.icon;
      const isActive = activeSection === section.id;
      const colorClass = `am-nav-${section.color}`;
      return (
        <button
          key={section.id}
          onClick={() => setActiveSection(section.id)}
          className={`am-nav-btn ${colorClass} ${isActive ? 'is-active' : ''}`}
        >
          <Icon className="am-icon-lg" />
          <p className="label">{section.name}</p>
        </button>
      );
    })}
  </div>
);

export default Navigation;
