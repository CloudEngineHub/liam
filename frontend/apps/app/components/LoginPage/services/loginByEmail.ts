'use server'
import { redirect } from 'next/navigation'
import * as v from 'valibot'

import { createClient } from '../../../libs/db/server'
import { urlgen } from '../../../libs/routes/urlgen'
import { ensureUserHasOrganization } from './ensureUserHasOrganization'
import { sanitizeReturnPath } from './validateReturnPath'

export async function loginByEmail(formData: FormData) {
  const supabase = await createClient()

  // Get the returnTo path from the form data and sanitize it
  // This will be set by the login page which reads from the cookie
  const formReturnTo = formData.get('returnTo')
  const returnTo = sanitizeReturnPath(
    formReturnTo?.toString(),
    '/design_sessions/new',
  )

  const loginFormSchema = v.object({
    email: v.pipe(v.string(), v.email('Please enter a valid email address')),
    password: v.string(),
  })

  // Parse and validate form data
  const formDataObject = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsedData = v.safeParse(loginFormSchema, formDataObject)
  if (!parsedData.success) {
    console.error('Login validation failed:', {
      errors: parsedData.issues,
      email: formDataObject.email,
      timestamp: new Date().toISOString(),
    })
    redirect(urlgen('error'))
  }

  const data = parsedData.output

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error('Login authentication failed:', {
      error: error.message,
      code: error.status,
      email: data.email,
      timestamp: new Date().toISOString(),
    })
    redirect(urlgen('error'))
  }

  await ensureUserHasOrganization()

  redirect(returnTo)
}
