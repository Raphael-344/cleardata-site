import { Wind, Users, Database, Globe, Shield, Zap } from 'lucide-react'

export default function AboutPage() {
  const team = [
    { name: 'ZANOLLA Lenny', role: 'Chef de projet' },
    { name: 'BOUAMER Yaacoub', role: 'Modélisation BDD' },
    { name: 'GASPARIN Raphael', role: 'Développement & Données' },
    { name: 'BEN ABDELGHANI Elyes', role: 'Requêtes SQL' },
    { name: 'ALIS Timéo', role: 'Documentation' },
  ]

  const techStack = [
    { name: 'MySQL 8.0', desc: 'Moteur InnoDB, 11 tables, triggers, contraintes' },
    { name: 'Next.js 14', desc: 'App Router, Server Components, API Routes' },
    { name: 'Railway', desc: 'Hébergement BDD cloud, connexion sécurisée SSL' },
    { name: 'Vercel', desc: 'Déploiement frontend, edge network mondial' },
    { name: 'Leaflet.js', desc: 'Cartographie interactive OpenStreetMap' },
    { name: 'Recharts', desc: 'Visualisation de données en temps réel' },
  ]

  return (
    <div className="pt-24 max-w-5xl mx-auto px-6 pb-24">
      {/* Hero */}
      <div className="mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-air-500/30 bg-air-500/10 text-air-400 text-xs font-mono mb-4">
          <Wind size={12} />
          À PROPOS
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-6">
          Projet ClearData<br /><span className="text-air-400">Groupe 11 — CESI</span>
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-3xl">
          Dans le cadre d'une mission pour le Ministère de la Transition Écologique, l'équipe ClearData
          a conçu et développé une base de données relationnelle centralisée pour la surveillance
          de la qualité de l'air en France.
        </p>
      </div>

      {/* Contexte */}
      <div className="glass p-8 mb-8">
        <h2 className="font-display text-2xl font-bold mb-4">Contexte du projet</h2>
        <p className="text-slate-400 leading-relaxed mb-4">
          Après la parution du dernier rapport du GIEC, le ministère de la Transition Écologique
          a lancé un grand projet national sur la qualité de l'air. ClearData a été retenu pour
          concevoir un outil centralisé permettant de stocker et d'interroger les données publiques
          de qualité de l'air dans les grandes villes de France.
        </p>
        <p className="text-slate-400 leading-relaxed">
          Le projet couvre <strong className="text-white">3 grands thèmes</strong> : la gestion des agences régionales
          et de leur personnel, la gestion des capteurs et des relevés de concentration gazeuse,
          et la gestion des rapports d'analyse produits par les agents administratifs.
        </p>
      </div>

      {/* Stats BDD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { val: '101', label: 'Agences départementales' },
          { val: '244 545', label: 'Capteurs déployés' },
          { val: '23M+', label: 'Relevés enregistrés' },
          { val: '7', label: 'Gaz surveillés' },
        ].map(({ val, label }) => (
          <div key={label} className="stat-card p-5 text-center">
            <div className="font-display text-3xl font-extrabold text-air-400 mb-1">{val}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Choix techniques */}
      <div className="glass p-8 mb-8">
        <h2 className="font-display text-2xl font-bold mb-6">Choix de modélisation défendables</h2>
        <div className="space-y-4">
          {[
            { icon: Shield, title: 'Héritage XT sur EMPLOYE', desc: 'L\'entité EMPLOYE se décline en 3 sous-types exclusifs et totaux : CHEF_AGENCE, AGENT_TECHNIQUE et AGENT_ADMIN. Cette modélisation Merise garantit l\'intégrité référentielle et évite la redondance.' },
            { icon: Database, title: 'id_agence conservé dans CAPTEUR', desc: 'Même si id_technique est présent, id_agence est maintenu car un capteur peut ne pas avoir de technicien affecté (NULL). Sans cette FK directe, l\'agence serait introuvable. Choix délibéré pour la robustesse.' },
            { icon: Shield, title: 'Triggers d\'immuabilité', desc: 'BEFORE UPDATE sur RELEVE et BEFORE UPDATE/DELETE sur RAPPORT garantissent que les données scientifiques ne peuvent jamais être altérées après saisie.' },
            { icon: Zap, title: 'Moteur InnoDB', desc: 'Choisi pour le support natif des clés étrangères, des transactions et des contraintes d\'intégrité. Idéal pour un projet requérant une forte cohérence des données.' },
            { icon: Globe, title: 'NH3 ajouté malgré son absence du CDC', desc: 'NH3 est absent de la liste client mais requis par la requête 7. Ajouté avec type GES et documenté comme anomalie du cahier des charges à clarifier avec le client.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-air-500/10 border border-air-500/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                <Icon size={14} className="text-air-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stack technique */}
      <div className="glass p-8 mb-8">
        <h2 className="font-display text-2xl font-bold mb-6">Stack technique</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {techStack.map(({ name, desc }) => (
            <div key={name} className="flex gap-3 p-4 bg-dark-800/50 rounded-xl border border-air-500/10">
              <div className="w-2 h-2 rounded-full bg-air-400 mt-1.5 flex-shrink-0" />
              <div>
                <div className="font-mono font-bold text-sm text-air-300">{name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Équipe */}
      <div className="glass p-8">
        <div className="flex items-center gap-2 mb-6">
          <Users size={20} className="text-air-400" />
          <h2 className="font-display text-2xl font-bold">Groupe 11</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {team.map(({ name, role }) => (
            <div key={name} className="flex items-center gap-4 p-4 bg-dark-800/50 rounded-xl border border-air-500/10 hover:border-air-500/30 transition-all">
              <div className="w-10 h-10 rounded-full bg-air-500/10 border border-air-500/20 flex items-center justify-center font-display font-bold text-air-400">
                {name.split(' ').map(n => n[0]).join('').slice(0,2)}
              </div>
              <div>
                <div className="font-semibold text-white">{name}</div>
                <div className="text-xs text-slate-500">{role}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-6 text-center">
          CESI École d'Ingénieurs — 1ère année Prépa Ingénieur — 2025/2026
        </p>
      </div>
    </div>
  )
}
