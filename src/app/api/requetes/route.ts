import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

const REQUETES: Record<string, { label: string; sql: string; params?: any[] }> = {
  '1': {
    label: 'Liste de l\'ensemble des agences',
    sql: `SELECT id_agence, nom_agence, adresse, ville, code_postal, region FROM Agence ORDER BY region, ville`,
  },
  '2': {
    label: 'Personnel technique de l\'agence de Bordeaux',
    sql: `SELECT e.nom, e.prenom FROM EMPLOYE e
          JOIN AGENT_TECHNIQUE at2 ON at2.id_employe = e.id_employe
          JOIN Agence a ON e.id_agence = a.id_agence
          WHERE a.ville = 'Bordeaux' ORDER BY e.nom`,
  },
  '3': {
    label: 'Nombre total de capteurs déployés',
    sql: `SELECT COUNT(id_capteur) AS nb_capteurs FROM CAPTEUR`,
  },
  '4': {
    label: 'Rapports publiés entre 2018 et 2022',
    sql: `SELECT id_rapport, titre, date_rapport FROM RAPPORT
          WHERE YEAR(date_rapport) BETWEEN 2018 AND 2022 ORDER BY date_rapport`,
  },
  '5': {
    label: 'Concentrations CH4 — Île-de-France, Bretagne, Occitanie (mai-juin 2025)',
    sql: `SELECT a.region, c.ville_capteur, r.date_releve, r.concentration_ppm
          FROM RELEVE r
          JOIN CAPTEUR c ON r.id_capteur = c.id_capteur
          JOIN GAZ g ON c.sigle = g.sigle
          JOIN Agence a ON c.id_agence = a.id_agence
          WHERE g.sigle = 'CH4'
            AND a.region IN ('Île-de-France','Bretagne','Occitanie')
            AND MONTH(r.date_releve) IN (5,6) AND YEAR(r.date_releve) = 2025
          ORDER BY a.region, r.date_releve LIMIT 200`,
  },
  '6': {
    label: 'Agents techniques maintenant des capteurs GESI',
    sql: `SELECT DISTINCT e.nom, e.prenom FROM EMPLOYE e
          JOIN AGENT_TECHNIQUE at2 ON at2.id_employe = e.id_employe
          JOIN CAPTEUR c ON c.id_technique = at2.id_technique
          JOIN GAZ g ON c.sigle = g.sigle
          WHERE g.type_gaz = 'GESI' ORDER BY e.nom`,
  },
  '7': {
    label: 'Rapports concernant le CO2 — ordre antichronologique',
    sql: `SELECT DISTINCT r.titre, r.date_rapport FROM RAPPORT r
          JOIN CONCERNER co ON r.id_rapport = co.id_rapport
          JOIN RELEVE re ON co.id_releve = re.id_releve
          JOIN CAPTEUR c ON re.id_capteur = c.id_capteur
          JOIN GAZ g ON c.sigle = g.sigle
          WHERE g.sigle = 'CO2' ORDER BY r.date_rapport DESC`,
  },
  '8': {
    label: 'Mois de concentration HFC minimale par région',
    sql: `SELECT a.region, DATE_FORMAT(r.date_releve,'%Y-%m') AS mois, MIN(r.concentration_ppm) AS concentration_min
          FROM RELEVE r
          JOIN CAPTEUR c ON r.id_capteur = c.id_capteur
          JOIN GAZ g ON c.sigle = g.sigle
          JOIN Agence a ON c.id_agence = a.id_agence
          WHERE g.sigle = 'HFC'
          GROUP BY a.region, DATE_FORMAT(r.date_releve,'%Y-%m')
          HAVING MIN(r.concentration_ppm) = (
            SELECT MIN(r2.concentration_ppm) FROM RELEVE r2
            JOIN CAPTEUR c2 ON r2.id_capteur = c2.id_capteur
            JOIN GAZ g2 ON c2.sigle = g2.sigle
            JOIN Agence a2 ON c2.id_agence = a2.id_agence
            WHERE g2.sigle = 'HFC' AND a2.region = a.region
          ) ORDER BY a.region`,
  },
  '9': {
    label: 'Moyenne concentrations Île-de-France 2025 par gaz',
    sql: `SELECT g.sigle, g.nom_gaz, ROUND(AVG(r.concentration_ppm),4) AS moyenne_ppm
          FROM RELEVE r
          JOIN CAPTEUR c ON r.id_capteur = c.id_capteur
          JOIN GAZ g ON c.sigle = g.sigle
          JOIN Agence a ON c.id_agence = a.id_agence
          WHERE a.region = 'Île-de-France' AND YEAR(r.date_releve) = 2025
          GROUP BY g.sigle, g.nom_gaz ORDER BY g.sigle`,
  },
  '10': {
    label: 'Taux de productivité des agents admin de Toulouse',
    sql: `SELECT e.nom, e.prenom,
            COUNT(DISTINCT rd.id_rapport) AS nb_rapports,
            TIMESTAMPDIFF(MONTH, e.date_prise_poste, CURDATE()) AS mois_contrat,
            ROUND(COUNT(DISTINCT rd.id_rapport) / NULLIF(TIMESTAMPDIFF(MONTH, e.date_prise_poste, CURDATE()),0),4) AS rapports_par_mois
          FROM EMPLOYE e
          JOIN AGENT_ADMIN aa ON aa.id_employe = e.id_employe
          JOIN Agence a ON e.id_agence = a.id_agence
          LEFT JOIN REDIGER rd ON rd.id_administratif = aa.id_administratif
          WHERE a.ville = 'Toulouse'
          GROUP BY e.id_employe, e.nom, e.prenom, e.date_prise_poste
          ORDER BY rapports_par_mois DESC`,
  },
  '11': {
    label: 'Rapports pour un gaz donné',
    sql: `SELECT DISTINCT r.id_rapport, r.titre, r.date_rapport
          FROM RAPPORT r
          JOIN CONCERNER co ON r.id_rapport = co.id_rapport
          JOIN RELEVE re ON co.id_releve = re.id_releve
          JOIN CAPTEUR c ON re.id_capteur = c.id_capteur
          JOIN GAZ g ON c.sigle = g.sigle
          WHERE g.nom_gaz = ? ORDER BY r.date_rapport DESC`,
    params: ['Méthane'],
  },
  '12': {
    label: 'Régions avec plus de capteurs que de personnel',
    sql: `SELECT a.region, COUNT(DISTINCT c.id_capteur) AS nb_capteurs, COUNT(DISTINCT e.id_employe) AS nb_employes
          FROM Agence a
          LEFT JOIN CAPTEUR c ON c.id_agence = a.id_agence
          LEFT JOIN EMPLOYE e ON e.id_agence = a.id_agence
          GROUP BY a.region
          HAVING COUNT(DISTINCT c.id_capteur) > COUNT(DISTINCT e.id_employe)
          ORDER BY a.region`,
  },
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const param = searchParams.get('param')

  if (!id || !REQUETES[id]) {
    return NextResponse.json({ error: 'Requête inconnue' }, { status: 400 })
  }

  try {
    const req_data = REQUETES[id]
    const params = param ? [param] : req_data.params
    const rows = await query(req_data.sql, params)
    return NextResponse.json({ rows, label: req_data.label, count: rows.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
