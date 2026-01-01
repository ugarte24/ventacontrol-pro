import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Obtener el token de autorización
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Crear cliente Supabase con el token del usuario
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Verificar que el usuario esté autenticado
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obtener userId y email del cuerpo de la petición
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError: any) {
      return new Response(
        JSON.stringify({ error: 'Error al procesar el cuerpo de la petición. Asegúrate de enviar un JSON válido.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const { userId, email } = requestBody || {};
    
    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: 'userId y email son requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar que el usuario sea administrador O que esté actualizando su propio email
    const { data: userData, error: roleError } = await supabaseClient
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single()

    const isAdmin = userData?.rol === 'admin';
    const isOwnUser = user.id === userId;
    
    // Permitir si es admin o si está actualizando su propio email
    if (!isAdmin && !isOwnUser) {
      return new Response(
        JSON.stringify({ error: 'Solo los administradores pueden actualizar emails de otros usuarios' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Crear cliente admin para actualizar auth.users
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Actualizar el email del usuario directamente
    // Si el email ya está en uso, Supabase Auth lo indicará en el error
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { email: email.trim() }
    )

    if (updateError) {
      // Mensajes de error más descriptivos basados en el error de Supabase
      let errorMessage = 'Error al actualizar el correo electrónico';
      
      const errorMsg = updateError.message?.toLowerCase() || '';
      
      if (errorMsg.includes('already registered') || 
          errorMsg.includes('already exists') || 
          errorMsg.includes('user already registered') ||
          errorMsg.includes('email address already registered')) {
        errorMessage = 'Este correo electrónico ya está en uso por otro usuario';
      } else if (errorMsg.includes('invalid') || errorMsg.includes('format')) {
        errorMessage = 'El formato del correo electrónico no es válido';
      } else if (errorMsg.includes('not found') || errorMsg.includes('user not found')) {
        errorMessage = 'El usuario no fue encontrado';
      } else {
        errorMessage = updateError.message || 'Error al actualizar el correo electrónico';
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (!updatedUser) {
      return new Response(
        JSON.stringify({ error: 'No se pudo actualizar el correo electrónico. El usuario no fue encontrado.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, email: updatedUser.user.email }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    // Capturar cualquier error no esperado y devolver un mensaje descriptivo
    const errorMessage = error?.message || 'Error desconocido al procesar la solicitud';
    console.error('Error en update-user-email:', errorMessage, error);
    
    return new Response(
      JSON.stringify({ error: `Error al actualizar el correo electrónico: ${errorMessage}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

