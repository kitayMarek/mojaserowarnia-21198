#!/usr/bin/env node
/**
 * Import danych z Lovable Cloud do nowego projektu Supabase.
 *
 * Wymagane zmienne środowiskowe:
 *   NEW_SUPABASE_URL            - URL nowego projektu Supabase
 *   NEW_SUPABASE_SERVICE_ROLE_KEY - service_role key nowego projektu
 *
 * Opcjonalne:
 *   EXPORT_DIR  - katalog z plikami JSON wyeksportowanymi przez edge functions
 *                 (domyślnie ./export obok tego skryptu)
 *   SEND_PASSWORD_RESET - jeśli "true", wysyła do każdego użytkownika link resetujący hasło
 *                         (wymaga skonfigurowanego SMTP/wysyłki w nowym Supabase)
 *
 * Użycie:
 *   node scripts/import-to-supabase.mjs
 *
 * Uwaga: hasła użytkowników NIE są przenoszone (Supabase Auth nie udostępnia ich w plaintext).
 * Skrypt tworzy konta z losowymi hasłami i (opcjonalnie) wysyła linki resetujące.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NEW_SUPABASE_URL = process.env.NEW_SUPABASE_URL;
const NEW_SUPABASE_SERVICE_ROLE_KEY = process.env.NEW_SUPABASE_SERVICE_ROLE_KEY;
const EXPORT_DIR = process.env.EXPORT_DIR || path.resolve(__dirname, '../export');
const SEND_PASSWORD_RESET = process.env.SEND_PASSWORD_RESET === 'true';

if (!NEW_SUPABASE_URL || !NEW_SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Brak wymaganych zmiennych środowiskowych:');
  console.error('   NEW_SUPABASE_URL');
  console.error('   NEW_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

function loadJson(name) {
  const filePath = path.join(EXPORT_DIR, name);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Nie znaleziono pliku: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function generatePassword() {
  return crypto.randomBytes(24).toString('base64url');
}

function logStep(step) {
  console.log(`\n▶ ${step}`);
}

function logOk(message) {
  console.log(`  ✅ ${message}`);
}

function logWarn(message) {
  console.log(`  ⚠️  ${message}`);
}

function logError(message) {
  console.error(`  ❌ ${message}`);
}

async function main() {
  const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  logStep('Wczytywanie plików eksportu...');
  const dataExport = loadJson('export-data.json');
  const usersExport = loadJson('export-users.json');
  const storageExport = loadJson('export-storage.json');
  logOk(`Tabele publiczne: ${Object.keys(dataExport.data).length}`);
  logOk(`Użytkownicy: ${usersExport.data.users.length}`);
  logOk(`Role: ${usersExport.data.user_roles.length}`);
  logOk(`Profile: ${usersExport.data.profiles.length}`);
  logOk(`Pliki storage: ${Object.values(storageExport.counts).reduce((a, b) => a + b, 0)}`);

  // --- Użytkownicy ---
  logStep('Tworzenie użytkowników w nowym Supabase Auth...');
  const createdUsers = [];
  const failedUsers = [];
  for (const user of usersExport.data.users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      email_confirm: true,
      password: generatePassword(),
      user_metadata: user.user_metadata || {},
      app_metadata: user.app_metadata || {},
    });

    if (error) {
      // Użytkownik może już istnieć
      if (error.message?.includes('already been registered')) {
        logWarn(`Użytkownik ${user.email} już istnieje, pomijam.`);
        createdUsers.push({ id: user.id, email: user.email, existing: true });
      } else {
        logError(`Nie udało się utworzyć ${user.email}: ${error.message}`);
        failedUsers.push({ email: user.email, error: error.message });
      }
    } else {
      createdUsers.push({ id: data.user.id, email: data.user.email, existing: false });
      logOk(`Utworzono ${data.user.email}`);
    }
  }
  logOk(`Utworzono/pominięto ${createdUsers.length} użytkowników`);
  if (failedUsers.length > 0) {
    logWarn(`${failedUsers.length} użytkowników nie udało się utworzyć`);
  }

  // --- Profile ---
  logStep('Import profili...');
  if (usersExport.data.profiles.length > 0) {
    const { error } = await supabase.from('profiles').upsert(usersExport.data.profiles, { onConflict: 'id' });
    if (error) {
      logError(`Błąd importu profili: ${error.message}`);
    } else {
      logOk(`${usersExport.data.profiles.length} profile`);
    }
  }

  // --- Role ---
  logStep('Import ról użytkowników...');
  if (usersExport.data.user_roles.length > 0) {
    const { error } = await supabase.from('user_roles').upsert(usersExport.data.user_roles, { onConflict: 'id' });
    if (error) {
      logError(`Błąd importu ról: ${error.message}`);
    } else {
      logOk(`${usersExport.data.user_roles.length} role`);
    }
  }

  // --- Tabele publiczne w kolejności zgodnej z FK ---
  const phase1 = ['cultures', 'feed_ingredients', 'news_banners', 'contact_attempts', 'llm_queries'];
  const phase2 = [
    'price_history',
    'products',
    'user_culture_lists',
    'serowarnie',
    'feed_recipes',
    'invoices',
    'reactions',
    'sales_records',
    'culture_audit_log',
    'culture_clicks',
  ];
  const phase3 = ['user_culture_list_items', 'serowarnia_wpisy'];

  for (const table of phase1) {
    const rows = dataExport.data[table] || [];
    logStep(`Import ${table} (${rows.length} wierszy)...`);
    if (rows.length === 0) {
      logOk('pusta tabela');
      continue;
    }
    const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
    if (error) {
      logError(`Błąd importu ${table}: ${error.message}`);
    } else {
      logOk(`${rows.length} wierszy`);
    }
  }

  for (const table of phase2) {
    const rows = dataExport.data[table] || [];
    logStep(`Import ${table} (${rows.length} wierszy)...`);
    if (rows.length === 0) {
      logOk('pusta tabela');
      continue;
    }
    const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
    if (error) {
      logError(`Błąd importu ${table}: ${error.message}`);
    } else {
      logOk(`${rows.length} wierszy`);
    }
  }

  for (const table of phase3) {
    const rows = dataExport.data[table] || [];
    logStep(`Import ${table} (${rows.length} wierszy)...`);
    if (rows.length === 0) {
      logOk('pusta tabela');
      continue;
    }
    const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
    if (error) {
      logError(`Błąd importu ${table}: ${error.message}`);
    } else {
      logOk(`${rows.length} wierszy`);
    }
  }

  // --- Storage ---
  logStep('Import plików storage...');
  for (const [bucketName, files] of Object.entries(storageExport.data)) {
    if (files.length === 0) continue;

    const { data: existingBucket, error: bucketError } = await supabase.storage.getBucket(bucketName);
    if (bucketError || !existingBucket) {
      const { error: createError } = await supabase.storage.createBucket(bucketName, { public: true });
      if (createError) {
        logError(`Nie udało się utworzyć bucketu ${bucketName}: ${createError.message}`);
        continue;
      }
      logOk(`Utworzono bucket ${bucketName}`);
    }

    for (const file of files) {
      const bytes = Buffer.from(file.base64, 'base64');
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(file.name, bytes, {
          contentType: file.content_type,
          upsert: true,
        });

      if (uploadError) {
        logError(`Błąd uploadu ${bucketName}/${file.name}: ${uploadError.message}`);
      } else {
        logOk(`Upload ${bucketName}/${file.name}`);
      }
    }
  }

  // --- Linki resetujące hasła ---
  if (SEND_PASSWORD_RESET) {
    logStep('Wysyłanie linków resetujących hasła...');
    for (const user of createdUsers.filter((u) => !u.existing)) {
      const { error } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: user.email,
      });
      if (error) {
        logWarn(`Nie udało się wysłać linku do ${user.email}: ${error.message}`);
      } else {
        logOk(`Link resetujący dla ${user.email}`);
      }
    }
  } else {
    logStep('Pominięto wysyłanie linków resetujących (ustaw SEND_PASSWORD_RESET=true aby włączyć)');
  }

  // --- Podsumowanie ---
  console.log('\n=== PODSUMOWANIE ===');
  console.log(`Użytkownicy: ${createdUsers.length} (błędy: ${failedUsers.length})`);
  console.log(`Profile: ${usersExport.data.profiles.length}`);
  console.log(`Role: ${usersExport.data.user_roles.length}`);
  console.log('Tabele publiczne:');
  for (const table of [...phase1, ...phase2, ...phase3]) {
    console.log(`  - ${table}: ${(dataExport.data[table] || []).length}`);
  }
  console.log('Storage:');
  for (const [bucketName, files] of Object.entries(storageExport.data)) {
    console.log(`  - ${bucketName}: ${files.length}`);
  }

  if (!SEND_PASSWORD_RESET) {
    console.log('\n⚠️  WAŻNE: Użytkownicy zostali utworzeni z losowymi hasłami.');
    console.log('    Aby mogli się zalogować, wyślij im linki resetujące hasło:');
    console.log('    SEND_PASSWORD_RESET=true node scripts/import-to-supabase.mjs');
    console.log('    Lub ustaw hasła ręcznie w panelu Authentication nowego Supabase.');
  }
}

main().catch((err) => {
  console.error('❌ Błąd krytyczny:', err.message);
  console.error(err.stack);
  process.exit(1);
});
