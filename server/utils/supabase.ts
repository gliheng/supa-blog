import { createClient } from '@supabase/supabase-js'

const project = 'gwfgxjhyajvratvvmffr';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3Zmd4amh5YWp2cmF0dnZtZmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM1MDM1MDAsImV4cCI6MjAyOTA3OTUwMH0.hsfRJjg_lLxcqeVFphRBoAFDFrnPX0YlRskoPpT1j9k';

export const supabase = createClient(`https://${project}.supabase.co`, anon);
