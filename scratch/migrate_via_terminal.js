/**
 * INFINITY KIT TERMINAL MIGRATION UTILITY
 * ---------------------------------------
 * This script runs directly on your computer's terminal. It completely bypasses
 * any browser-level extensions (like AdBlockers, Brave Shields, or privacy firewalls)
 * that might be blocking database requests in your browser.
 */

const { createClient } = require('@supabase/supabase-js');

// 1. Connection Configurations
const SUPABASE_URL = 'https://dskdwqkealdqtngusghm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRza2R3cWtlYWxkcXRuZ3VzZ2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3ODQ5MDAsImV4cCI6MjA5NTM2MDkwMH0.uvQZEhDNuKz2k92d2066CTthWHZtc-ematwH344fJYg';
const FIREBASE_PROJECT_ID = 'infinity-kit-79c58';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper to safely parse Firestore values from Google's REST payload format
function parseFirestoreFields(fields) {
  const parsed = {};
  if (!fields) return parsed;
  
  for (const [key, val] of Object.entries(fields)) {
    if (val.stringValue !== undefined) parsed[key] = val.stringValue;
    else if (val.integerValue !== undefined) parsed[key] = parseInt(val.integerValue, 10);
    else if (val.doubleValue !== undefined) parsed[key] = parseFloat(val.doubleValue);
    else if (val.booleanValue !== undefined) parsed[key] = val.booleanValue;
    else if (val.timestampValue !== undefined) parsed[key] = val.timestampValue;
    else if (val.mapValue !== undefined && val.mapValue.fields) parsed[key] = parseFirestoreFields(val.mapValue.fields);
  }
  return parsed;
}

async function runMigration() {
  console.log('\n🚀 Starting Terminal Migration from Firestore to Supabase...');
  console.log(`🔗 Target URL: ${SUPABASE_URL}`);
  
  try {
    // -------------------------------------------------------------
    // 1. MIGRATE TESTIMONIAL REVIEWS
    // -------------------------------------------------------------
    console.log('\n[Reviews] Querying legacy testimonials...');
    const reviewsRes = await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/reviews`);
    if (!reviewsRes.ok) throw new Error(`Firebase REST API returned status: ${reviewsRes.status}`);
    
    const reviewsJson = await reviewsRes.json();
    const reviewsDocs = reviewsJson.documents || [];
    console.log(`[Reviews] Found ${reviewsDocs.length} records.`);
    
    let reviewsSuccess = 0;
    for (const doc of reviewsDocs) {
      const fields = parseFirestoreFields(doc.fields);
      const { error } = await supabase.from('reviews').insert({
        name: fields.name || 'Anonymous',
        rating: fields.rating || 5,
        message: fields.message || '',
        created_at: fields.timestamp || new Date().toISOString()
      });
      
      if (!error) reviewsSuccess++;
      else console.error('  ✗ Error inserting review:', error.message);
    }
    console.log(`✓ Successfully migrated ${reviewsSuccess}/${reviewsDocs.length} reviews.`);

    // -------------------------------------------------------------
    // 2. MIGRATE CHANGELOG UPDATES
    // -------------------------------------------------------------
    console.log('\n[Updates] Querying legacy updates...');
    const updatesRes = await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/updates`);
    const updatesJson = await updatesRes.json();
    const updatesDocs = updatesJson.documents || [];
    console.log(`[Updates] Found ${updatesDocs.length} records.`);
    
    let updatesSuccess = 0;
    for (const doc of updatesDocs) {
      const fields = parseFirestoreFields(doc.fields);
      const { error } = await supabase.from('system_updates').insert({
        message: fields.message || '',
        created_at: fields.timestamp || new Date().toISOString()
      });
      
      if (!error) updatesSuccess++;
      else console.error('  ✗ Error inserting update:', error.message);
    }
    console.log(`✓ Successfully migrated ${updatesSuccess}/${updatesDocs.length} system updates.`);

    // -------------------------------------------------------------
    // 3. MIGRATE AFFILIATE ADVERTISEMENTS
    // -------------------------------------------------------------
    console.log('\n[Ads] Querying legacy affiliate advertisements...');
    const adsRes = await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/affiliateAds`);
    const adsJson = await adsRes.json();
    const adsDocs = adsJson.documents || [];
    console.log(`[Ads] Found ${adsDocs.length} records.`);
    
    let adsSuccess = 0;
    for (const doc of adsDocs) {
      const fields = parseFirestoreFields(doc.fields);
      const { error } = await supabase.from('affiliate_ads').insert({
        title: fields.title || '',
        affiliate_link: fields.affiliateLink || '',
        media_link: fields.mediaLink || '',
        created_at: fields.timestamp || new Date().toISOString()
      });
      
      if (!error) adsSuccess++;
      else console.error('  ✗ Error inserting advertisement:', error.message);
    }
    console.log(`✓ Successfully migrated ${adsSuccess}/${adsDocs.length} advertisements.`);

    // -------------------------------------------------------------
    // 4. MIGRATE AI PROMPT TEMPLATES
    // -------------------------------------------------------------
    console.log('\n[Prompts] Querying legacy prompt templates...');
    const promptsRes = await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/aiPrompts`);
    const promptsJson = await promptsRes.json();
    const promptsDocs = promptsJson.documents || [];
    console.log(`[Prompts] Found ${promptsDocs.length} records.`);
    
    let promptsSuccess = 0;
    for (const doc of promptsDocs) {
      const fields = parseFirestoreFields(doc.fields);
      const { error } = await supabase.from('ai_prompts').insert({
        category: fields.category || 'men',
        image_url: fields.imageUrl || '',
        prompt: fields.prompt || '',
        created_at: fields.timestamp || new Date().toISOString()
      });
      
      if (!error) promptsSuccess++;
      else console.log('  ✗ Error inserting prompt:', error.message);
    }
    console.log(`✓ Successfully migrated ${promptsSuccess}/${promptsDocs.length} prompt templates.`);

    console.log('\n🎉 ALL PUBLIC DATA MIGRATED SUCCESSFULLY! 🎉\n');
  } catch (err) {
    console.error('\n❌ Fatal Migration Exception:', err.message);
  }
}

runMigration();
