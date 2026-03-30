-- ═══════════════════════════════════════════
-- Clé en Main 3.0 — Supabase Migration
-- Exécuter dans : Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════

-- 1. Table profiles (extension de auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  client_id TEXT,
  prenom TEXT,
  nom TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, email, prenom, nom)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    COALESCE(NEW.raw_user_meta_data->>'nom', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Table clients
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT,
  ville_residence TEXT,
  situation_pro TEXT,
  revenus_mensuels TEXT,
  apport_disponible INTEGER DEFAULT 0,
  credits_en_cours TEXT,
  budget_total INTEGER DEFAULT 0,
  villes_cibles TEXT[] DEFAULT '{}',
  type_bien TEXT[] DEFAULT '{}',
  rendement_cible NUMERIC DEFAULT 0,
  objectif TEXT,
  tolerance_travaux TEXT,
  regime_fiscal TEXT,
  score_base_profil INTEGER DEFAULT 0,
  phase_actuelle TEXT DEFAULT 'Phase 1',
  statut TEXT DEFAULT 'Onboarding',
  date_onboarding DATE DEFAULT CURRENT_DATE,
  date_livraison DATE,
  honoraires INTEGER DEFAULT 0,
  acompte_recu INTEGER DEFAULT 0,
  solde_recu INTEGER DEFAULT 0,
  commission_courtier INTEGER DEFAULT 0,
  frais_engages INTEGER DEFAULT 0,
  temps_passe_heures INTEGER DEFAULT 0,
  statut_paiement TEXT DEFAULT 'Acompte',
  source_acquisition TEXT,
  notes TEXT,
  experience_immo TEXT,
  horizon TEXT,
  tolerance_risque TEXT,
  dpe_minimum TEXT,
  copro TEXT,
  type_location TEXT[] DEFAULT '{}',
  criteres_redhibitoires TEXT[] DEFAULT '{}',
  gestion_locative TEXT,
  delai_souhaite TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table biens
CREATE TABLE IF NOT EXISTS public.biens (
  id TEXT PRIMARY KEY,
  adresse TEXT NOT NULL,
  ville TEXT NOT NULL,
  surface_m2 INTEGER,
  prix_affiche INTEGER,
  prix_m2 INTEGER,
  dpe TEXT,
  charges_copro INTEGER DEFAULT 0,
  taxe_fonciere INTEGER DEFAULT 0,
  loyer_estime INTEGER DEFAULT 0,
  rentabilite_brute NUMERIC DEFAULT 0,
  rentabilite_nette NUMERIC DEFAULT 0,
  cashflow_mensuel INTEGER DEFAULT 0,
  travaux_estimes INTEGER DEFAULT 0,
  ameublement INTEGER DEFAULT 0,
  score_base INTEGER DEFAULT 0,
  statut TEXT DEFAULT 'Identifié',
  source TEXT,
  lien_annonce TEXT,
  photos TEXT[] DEFAULT '{}',
  video_url TEXT,
  date_sourcing DATE,
  client_attribue TEXT REFERENCES public.clients(id),
  agence TEXT,
  checklist_vendeur JSONB DEFAULT '{}',
  notes TEXT,
  verdict_expert TEXT,
  note_secteur INTEGER DEFAULT 5,
  atouts_quartier TEXT[] DEFAULT '{}',
  prix_nego INTEGER,
  frais_notaire INTEGER,
  honoraires_service INTEGER,
  cout_total INTEGER,
  statut_annonce TEXT,
  matching_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table agences
CREATE TABLE IF NOT EXISTS public.agences (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  ville TEXT NOT NULL,
  contact_principal TEXT,
  email TEXT,
  telephone TEXT,
  linkedin TEXT,
  statut TEXT DEFAULT 'Contactee',
  nb_biens_envoyes INTEGER DEFAULT 0,
  nb_deals_conclus INTEGER DEFAULT 0,
  score_agence INTEGER DEFAULT 0,
  derniere_interaction DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Table journal_nego
CREATE TABLE IF NOT EXISTS public.journal_nego (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES public.clients(id),
  bien_id TEXT REFERENCES public.biens(id),
  date_heure TEXT,
  action TEXT,
  detail_conseil TEXT,
  decision_client TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Table notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  date TEXT,
  type TEXT,
  message TEXT NOT NULL,
  target TEXT DEFAULT 'admin' CHECK (target IN ('admin', 'client')),
  client_id TEXT,
  urgent BOOLEAN DEFAULT FALSE,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- Row Level Security (RLS)
-- ═══════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_nego ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own profile, admin reads all
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin reads all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Clients: admin full access, client reads own data
CREATE POLICY "Admin full access clients" ON public.clients
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Client reads own data" ON public.clients
  FOR SELECT USING (user_id = auth.uid());

-- Biens: admin full access, client reads assigned biens
CREATE POLICY "Admin full access biens" ON public.biens
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Client reads assigned biens" ON public.biens
  FOR SELECT USING (
    client_attribue IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );

-- Agences: admin only
CREATE POLICY "Admin full access agences" ON public.agences
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Journal: admin full access, client reads own
CREATE POLICY "Admin full access journal" ON public.journal_nego
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Client reads own journal" ON public.journal_nego
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );

-- Notifications: admin reads admin notifs, client reads client notifs
CREATE POLICY "Admin reads admin notifications" ON public.notifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Client reads own notifications" ON public.notifications
  FOR SELECT USING (
    target = 'client' AND client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );

-- ═══════════════════════════════════════════
-- Create admin user
-- (run AFTER creating admin account via Supabase Auth)
-- Replace 'YOUR_ADMIN_USER_UUID' with the actual UUID
-- ═══════════════════════════════════════════

-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'votre-email@admin.com';
