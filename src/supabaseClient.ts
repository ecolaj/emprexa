import { createClient } from '@supabase/supabase-js'

// Configuración directa - reemplaza con tus valores reales
const supabaseUrl = 'https://oznvktxmgtyddanslcru.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96bnZrdHhtZ3R5ZGRhbnNsY3J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1ODU2NTYsImV4cCI6MjA3NjE2MTY1Nn0.PHUjOjqd2S7kCysjYpMB9v_7N-EYdzNHywuEx1lhBgs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)