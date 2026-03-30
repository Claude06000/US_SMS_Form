import { Resend } from 'resend'

const FIELD_LABELS: Record<string, string> = {
  companyName: "Nom de l'entreprise",
  corporateWebsite: "Site web",
  businessAddress1: "Adresse (ligne 1)",
  businessAddress2: "Adresse (ligne 2)",
  city: "Ville",
  zip: "Code postal",
  stateAbbreviation: "Département",
  countryIsoCode: "Code pays ISO",
  registrationNumber: "Numéro d'immatriculation",
  registrationNumberType: "Type de document d'immatriculation",
  contactFirstName: "Prénom",
  contactLastName: "Nom",
  contactEmail: "Email professionnel",
  contactPhone: "Téléphone professionnel",
}

const COMPANY_FIELDS = [
  'companyName', 'corporateWebsite', 'businessAddress1',
  'businessAddress2', 'city', 'zip', 'stateAbbreviation', 'countryIsoCode',
  'registrationNumber', 'registrationNumberType',
]

const CONTACT_FIELDS = [
  'contactFirstName', 'contactLastName', 'contactEmail', 'contactPhone',
]

const ALL_TEXT_FIELDS = [...COMPANY_FIELDS, ...CONTACT_FIELDS]

function sanitize(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

function buildTableRows(fieldKeys: string[], fields: Record<string, string>): string {
  return fieldKeys.map((key) => {
    const label = FIELD_LABELS[key] || key
    const value = sanitize(fields[key] || '—')
    return `<tr>
      <td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;width:240px;vertical-align:top;">${sanitize(label)}</td>
      <td style="padding:8px 12px;border:1px solid #e2e8f0;">${value}</td>
    </tr>`
  }).join('')
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const resendApiKey = config.resendApiKey
  const recipientEmail = config.recipientEmail
  const senderEmail = config.senderEmail || 'noreply@noviamind.ai'

  if (!resendApiKey || !recipientEmail) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Configuration serveur manquante (RESEND_API_KEY ou RECIPIENT_EMAIL)',
    })
  }

  const resend = new Resend(resendApiKey)

  const formData = await readMultipartFormData(event)

  if (!formData) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Données du formulaire manquantes',
    })
  }

  // Extract text fields
  const fields: Record<string, string> = {}

  for (const part of formData) {
    if (part.name && ALL_TEXT_FIELDS.includes(part.name)) {
      fields[part.name] = part.data.toString('utf-8')
    }
  }

  // Build email HTML
  const now = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })

  const html = `
    <div style="font-family:'Inter',Arial,sans-serif;max-width:700px;margin:0 auto;color:#0f172a;">
      <div style="border-bottom:3px solid #7803FF;padding-bottom:12px;margin-bottom:24px;">
        <h2 style="margin:0;font-size:20px;">Nouvel enregistrement Toll-Free US — SMS</h2>
        <p style="color:#64748b;font-size:13px;margin:4px 0 0;">Soumis le ${sanitize(now)}</p>
      </div>

      <h3 style="color:#0f172a;margin:24px 0 8px;font-size:16px;border-left:3px solid #7803FF;padding-left:8px;">
        Informations sur l'entreprise
      </h3>
      <table style="border-collapse:collapse;width:100%;font-size:14px;">
        ${buildTableRows(COMPANY_FIELDS, fields)}
      </table>

      <h3 style="color:#0f172a;margin:24px 0 8px;font-size:16px;border-left:3px solid #7803FF;padding-left:8px;">
        Informations de contact
      </h3>
      <table style="border-collapse:collapse;width:100%;font-size:14px;">
        ${buildTableRows(CONTACT_FIELDS, fields)}
      </table>

      <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px;">
        Envoyé depuis le formulaire d'enregistrement NoviaMind Toll-Free US
      </div>
    </div>
  `

  const REQUIRED_FIELDS = [
    'companyName', 'businessAddress1', 'city', 'zip',
    'stateAbbreviation', 'countryIsoCode', 'registrationNumber', 'registrationNumberType',
    'contactFirstName', 'contactLastName', 'contactEmail', 'contactPhone',
  ]

  const missingFields = REQUIRED_FIELDS.filter((f) => !fields[f]?.trim())
  if (missingFields.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Champs obligatoires manquants : ${missingFields.map((f) => FIELD_LABELS[f] || f).join(', ')}`,
    })
  }

  try {
    await resend.emails.send({
      from: senderEmail,
      to: recipientEmail,
      subject: `[Toll-Free US] Enregistrement — ${fields.companyName || 'Entreprise'}`,
      html,
    })
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: "Erreur lors de l'envoi de l'email. Veuillez réessayer.",
    })
  }

  return { success: true }
})
