-- ═══════════════════════════════════════════
-- Clé en Main 3.0 — Seed Data v2
-- Exécuter APRÈS supabase_migration.sql et supabase_fix_rls.sql
-- ═══════════════════════════════════════════

-- ── Clients ──
INSERT INTO public.clients (id, prenom, nom, email, telephone, ville_residence, situation_pro, revenus_mensuels, apport_disponible, credits_en_cours, budget_total, villes_cibles, type_bien, rendement_cible, objectif, tolerance_travaux, regime_fiscal, score_base_profil, phase_actuelle, statut, date_onboarding, honoraires, acompte_recu, solde_recu, commission_courtier, frais_engages, temps_passe_heures, statut_paiement, source_acquisition, notes, experience_immo, horizon, tolerance_risque, dpe_minimum, copro, type_location, criteres_redhibitoires, gestion_locative, delai_souhaite)
VALUES
  ('c1', 'Julien', 'Moreau', 'julien.moreau@email.com', '+33 6 12 34 56 78', 'Lyon', 'CDI', '6000-10000', 25000, '1', 180000, ARRAY['Lyon','Saint-Étienne','Villeurbanne'], ARRAY['T2','T3'], 7.5, 'Mixte', 'Moyen', 'LMNP', 82, 'Phase 4', 'Shortlist', '2025-12-15', 5000, 2500, 0, 800, 350, 32, 'Acompte', 'Instagram', 'Client très motivé, disponible les weekends.', '1 bien', 'Moyen 5-15', 'Modéré', 'D', 'OK si charges <100€', ARRAY['Meublé LMNP'], ARRAY['RDC','DPE FG'], 'Agence', '2-4 mois'),
  ('c2', 'Sophie', 'Durand', 'sophie.durand@cabinet.fr', '+33 6 98 76 54 32', 'Paris', 'Libéral', '>10000', 50000, 'Aucun', 250000, ARRAY['Bordeaux','Toulouse'], ARRAY['T2','T3','T4+'], 6, 'Patrimoine', 'Léger', 'SCI_IS', 91, 'Phase 6', 'Négo', '2025-11-01', 8000, 4000, 0, 1200, 580, 48, 'Acompte', 'YouTube', 'Profil premium. Priorité haute.', '2-5 biens', 'Long 15+', 'Prudent', 'C', 'OK', ARRAY['Longue durée','Meublé LMNP'], ARRAY['Zone inondable','Gros travaux copro'], 'Agence', '4-6 mois'),
  ('c3', 'Marc', 'Lefèvre', 'marc.lefevre@startup.io', '+33 6 55 44 33 22', 'Nantes', 'Chef d''entreprise', '>10000', 40000, 'Aucun', 200000, ARRAY['Nantes','Rennes'], ARRAY['T3','Immeuble'], 8, 'Rendement', 'Lourd', 'LMNP', 78, 'Phase 2', 'Recherche', '2026-01-20', 6000, 3000, 0, 0, 120, 14, 'Acompte', 'Referral', 'Veut du rendement pur.', '1er investissement', 'Court <5ans', 'Dynamique', 'E+travaux', 'Préf mono', ARRAY['Coloc','Meublé LMNP'], ARRAY['RDC','Déclin démo'], 'À définir', '<2 mois'),
  ('c4', 'Claire', 'Bernard', 'claire.b@finance.com', '+33 6 77 88 99 00', 'Lille', 'CDI', '4000-6000', 15000, '1', 120000, ARRAY['Lille','Lens','Douai'], ARRAY['Studio','T2'], 8, 'Rendement', 'Léger', 'LMNP', 74, 'Phase 8', 'Travaux', '2025-09-10', 5000, 5000, 0, 600, 890, 62, 'Soldé', 'Google', 'Chantier en cours.', '1er investissement', 'Moyen 5-15', 'Modéré', 'D', 'OK si charges <100€', ARRAY['Meublé LMNP'], ARRAY['RDC','DPE FG','Dernier étage sans ascenseur'], 'Agence', '2-4 mois'),
  ('c5', 'Antoine', 'Girard', 'antoine.girard@medical.fr', '+33 6 11 22 33 44', 'Marseille', 'Libéral', '6000-10000', 30000, 'Aucun', 160000, ARRAY['Marseille','Montpellier'], ARRAY['T2','T3'], 7, 'Mixte', 'Moyen', 'A_definir', 85, 'Phase 10', 'Livré', '2025-06-01', 7000, 7000, 7000, 950, 420, 85, 'Soldé', 'LinkedIn', 'Mission terminée. Client satisfait.', '1 bien', 'Long 15+', 'Modéré', 'C', 'OK', ARRAY['Longue durée'], ARRAY['Zone inondable'], 'Agence', '4-6 mois')
ON CONFLICT (id) DO NOTHING;

-- ── Agences ──
INSERT INTO public.agences (id, nom, ville, contact_principal, email, telephone, statut, nb_biens_envoyes, nb_deals_conclus, score_agence, derniere_interaction, notes)
VALUES
  ('a1', 'Immo&Co Saint-Étienne', 'Saint-Étienne', 'Marie Dubois', 'marie@immoandco.fr', '+33 4 77 12 34 56', 'Partenaire_actif', 12, 3, 85, '2026-03-20', 'Excellent partenaire.'),
  ('a2', 'Cabinet Chartrons Bordeaux', 'Bordeaux', 'Pierre Martin', 'p.martin@chartrons-immo.com', '+33 5 56 78 90 12', 'Partenaire_actif', 8, 1, 72, '2026-03-18', 'Bon réseau.'),
  ('a3', 'Nord Invest Lille', 'Lille', 'Lucie Petit', 'lucie@nordinvest.fr', '+33 3 20 11 22 33', 'Partenaire_actif', 15, 4, 92, '2026-03-22', 'Top partenaire.'),
  ('a4', 'Atlantique Patrimoine', 'Nantes', 'Jean Roux', 'jroux@atl-patrimoine.fr', '+33 2 40 55 66 77', 'Interessee', 3, 0, 45, '2026-03-26', 'Nouveau contact.'),
  ('a5', 'Réseau Sud Immo', 'Montpellier', 'Amandine Costa', 'a.costa@reseausud.fr', '+33 4 67 88 99 00', 'Contactee', 0, 0, 0, '2026-03-24', 'Contact initial.')
ON CONFLICT (id) DO NOTHING;

-- ── Biens ──
INSERT INTO public.biens (id, adresse, ville, surface_m2, prix_affiche, prix_m2, dpe, charges_copro, taxe_fonciere, loyer_estime, rentabilite_brute, rentabilite_nette, cashflow_mensuel, travaux_estimes, ameublement, score_base, statut, source, date_sourcing, client_attribue, agence, notes, verdict_expert, note_secteur, atouts_quartier, prix_nego, frais_notaire, honoraires_service, cout_total, statut_annonce, matching_score, checklist_vendeur)
VALUES
  ('b1', '15 Rue de la République', 'Saint-Étienne', 52, 78000, 1500, 'D', 65, 580, 520, 8.0, 6.2, 145, 12000, 4000, 92, 'Shortlisté', 'LBC', '2026-03-15', 'c1', 'a1', 'Très bonne opportunité.', 'Pépite détectée — Quartier en gentrification.', 8, ARRAY['Tramway T1 à 2 min','Université Jean Monnet','Quartier en rénovation','Commerces'], 68000, 5440, 5000, 94440, 'Publiée depuis 45 jours', 94, '{"photos_hd":true,"video_360":true,"charges_tf":true,"dpe_factures":true,"historique_loyers":true,"diagnostics":true,"regles_copro":true,"pv_ag":true,"factures_recentes":true,"excel_exploitation":false,"contexte_vente":"Divorce","photos_avant_apres":false,"autorisation_visite":true,"dvf_compars":true}'),
  ('b2', '8 Avenue Jean Jaurès', 'Bordeaux', 45, 165000, 3667, 'C', 85, 920, 750, 5.5, 4.1, 42, 5000, 3500, 76, 'Offre_envoyée', 'Agence_directe', '2026-03-10', 'c2', 'a2', 'Bien correct.', 'Bon emplacement, rendement modeste.', 9, ARRAY['Tram C à 1 min','Quartier Chartrons','Restaurants & commerces'], 152000, 12160, 8000, 180660, 'Off-market', 82, '{"photos_hd":true,"video_360":false,"charges_tf":true,"dpe_factures":true,"historique_loyers":false,"diagnostics":true,"regles_copro":true,"pv_ag":false,"factures_recentes":true,"excel_exploitation":false,"contexte_vente":"Succession","photos_avant_apres":false,"autorisation_visite":true,"dvf_compars":true}'),
  ('b3', '22 Rue Gambetta', 'Lille', 38, 95000, 2500, 'D', 55, 650, 580, 7.3, 5.8, 110, 18000, 3500, 68, 'Acquis', 'SeLoger', '2025-10-02', 'c4', 'a3', 'Acquis. Travaux en cours.', 'Bien acquis sous le marché.', 7, ARRAY['Métro ligne 1','Vieux-Lille à 10 min','Université'], 85000, 6800, 5000, 118300, 'N/A', 78, '{"photos_hd":true,"video_360":true,"charges_tf":true,"dpe_factures":true,"historique_loyers":true,"diagnostics":true,"regles_copro":true,"pv_ag":true,"factures_recentes":true,"excel_exploitation":true,"contexte_vente":"Retraite","photos_avant_apres":true,"autorisation_visite":true,"dvf_compars":true}')
ON CONFLICT (id) DO NOTHING;

-- ── Journal Négo ──
INSERT INTO public.journal_nego (id, client_id, bien_id, date_heure, action, detail_conseil, decision_client)
VALUES
  ('n1', 'c1', 'b1', '2026-03-18 09:30', 'Info', 'Bien identifié et analysé. Score BASE 92/100.', ''),
  ('n2', 'c1', 'b1', '2026-03-19 14:00', 'Info', 'Checklist vendeur complétée à 100%.', ''),
  ('n3', 'c1', 'b1', '2026-03-20 10:15', 'Info', 'Pitch Deck envoyé au client.', 'En attente'),
  ('n4', 'c2', 'b2', '2026-03-12 11:00', 'Info', 'Bien identifié via Cabinet Chartrons.', ''),
  ('n5', 'c2', 'b2', '2026-03-15 16:30', 'Offre_envoyee', 'Offre à 152 000€ envoyée.', 'Validé'),
  ('n6', 'c2', 'b2', '2026-03-17 09:00', 'Contre_offre', 'Contre-offre du vendeur à 158 000€.', 'En discussion')
ON CONFLICT (id) DO NOTHING;

-- ── Notifications Admin ──
INSERT INTO public.notifications (id, date, type, message, target, urgent)
VALUES
  ('na1', '2026-03-28 14:30', 'pitch', 'Client Julien Moreau a reçu le Pitch Deck (Bien #b1)', 'admin', false),
  ('na2', '2026-03-27 10:00', 'checklist', 'Checklist vendeur 100% — Bien #b1 "Nego Ready"', 'admin', true),
  ('na3', '2026-03-26 16:45', 'score', 'Pépite détectée — Score BASE 92/100 (Bien #b1)', 'admin', true),
  ('na4', '2026-03-25 09:15', 'offre', 'Contre-offre reçue pour Sophie Durand — 158 000€', 'admin', true),
  ('na5', '2026-03-22 11:30', 'travaux', 'Avancement chantier Claire Bernard — 65%', 'admin', false)
ON CONFLICT (id) DO NOTHING;

-- ── Notifications Client ──
INSERT INTO public.notifications (id, date, type, message, target, client_id, icon)
VALUES
  ('nc1', '2026-03-20', 'bien', 'Nouveau bien analysé — Score 92/100', 'client', 'c1', 'green'),
  ('nc2', '2026-03-19', 'checklist', 'Dossier complet, prêt pour validation', 'client', 'c1', 'gold'),
  ('nc3', '2026-03-18', 'analyse', '8 biens analysés cette semaine à Saint-Étienne', 'client', 'c1', 'blue'),
  ('nc4', '2026-03-15', 'strategie', 'Stratégie validée — Cahier des charges finalisé', 'client', 'c1', 'green'),
  ('nc5', '2026-03-12', 'bienvenue', 'Bienvenue dans votre espace investisseur', 'client', 'c1', 'gold')
ON CONFLICT (id) DO NOTHING;
