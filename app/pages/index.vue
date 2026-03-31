<script setup lang="ts">
import { ref } from 'vue'

const REGISTRATION_NUMBER_TYPES = [
  'EIN (Employer Identification Number)',
  'DUNS (Data Universal Numbering System)',
  'LEI (Legal Entity Identifier)',
  'SIRET',
  'Autre',
]

// Form state
const form = ref({
  companyName: '',
  corporateWebsite: '',
  businessAddress1: '',
  businessAddress2: '',
  city: '',
  zip: '',
  stateAbbreviation: '',
  countryIsoCode: '',
  registrationNumber: '',
  registrationNumberType: '',
  contactFirstName: '',
  contactLastName: '',
  contactEmail: '',
  contactPhone: '',
})

const consent = ref(false)
const isSubmitting = ref(false)
const submitStatus = ref<'idle' | 'success' | 'error'>('idle')
const errorMessage = ref('')
const showConfirmation = ref(false)

const REQUIRED_FIELDS: Record<string, string> = {
  companyName: "Nom de l'entreprise",
  businessAddress1: 'Adresse professionnelle (ligne 1)',
  city: 'Ville',
  zip: 'Code postal',
  stateAbbreviation: 'Département',
  countryIsoCode: 'Code pays ISO',
  registrationNumber: "Numéro d'immatriculation",
  registrationNumberType: "Type de document d'immatriculation",
  contactFirstName: 'Prénom',
  contactLastName: 'Nom',
  contactEmail: 'Email professionnel',
  contactPhone: 'Numéro de téléphone professionnel',
}

function validateForm(): boolean {
  const missing = Object.entries(REQUIRED_FIELDS)
    .filter(([key]) => !form.value[key as keyof typeof form.value]?.trim())
    .map(([, label]) => label)

  if (missing.length > 0) {
    errorMessage.value = `Veuillez remplir les champs obligatoires suivants : ${missing.join(', ')}`
    submitStatus.value = 'error'
    return false
  }

  if (!consent.value) {
    errorMessage.value = 'Veuillez accepter les conditions avant de soumettre.'
    submitStatus.value = 'error'
    return false
  }

  return true
}

function handleSubmitClick() {
  if (!validateForm()) return
  showConfirmation.value = true
}

function cancelSubmit() {
  showConfirmation.value = false
}

async function confirmSubmit() {
  showConfirmation.value = false
  isSubmitting.value = true
  submitStatus.value = 'idle'
  errorMessage.value = ''

  const formData = new FormData()

  // Append all text fields
  for (const [key, value] of Object.entries(form.value)) {
    formData.append(key, value)
  }

  try {
    await $fetch('/api/submit', {
      method: 'POST',
      body: formData,
    })
    submitStatus.value = 'success'
  } catch (err: any) {
    errorMessage.value = err?.data?.error || err?.message || 'Erreur lors de l\'envoi'
    submitStatus.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <!-- Success state -->
  <div v-if="submitStatus === 'success'" class="flex items-center justify-center min-h-[60vh]">
    <UiCard class="max-w-lg text-center">
      <UiCardContent class="pt-8 pb-8">
        <div class="text-green-600 text-5xl mb-4">✓</div>
        <h2 class="text-2xl font-bold mb-2">Formulaire envoyé avec succès !</h2>
        <p class="text-muted-foreground">
          Votre demande d'enregistrement a été transmise. Vous recevrez une confirmation par email.
        </p>
      </UiCardContent>
    </UiCard>
  </div>

  <!-- Form -->
  <div v-else class="space-y-6">
    <!-- Intro card -->
    <UiCard>
      <UiCardHeader>
        <div class="flex items-center gap-3 mb-2">
          <div class="h-8 w-1 rounded-full bg-gradient-to-b from-[hsl(225.35,84%,49%)] via-[hsl(211.7,96.4%,78.4%)] to-[hsl(189.48,100%,43%)]" />
          <UiCardTitle class="text-2xl">Enregistrement Règlementaire — SMS vers Amérique du Nord</UiCardTitle>
        </div>
        <span class="text-xs text-muted-foreground ml-11">v4</span>
      </UiCardHeader>
      <UiCardContent class="text-sm text-muted-foreground leading-relaxed space-y-3">
        <p>
          L'enregistrement auprès des autorités de supervision est requis pour l'envoi de SMS transactionnels
          (confirmations de commande, notifications de compte, réinitialisations de mot de passe, etc.)
          à destination de destinataires aux États-Unis et au Canada.
        </p>
        <p>
          Veuillez remplir ce formulaire afin d'enregistrer votre entreprise et vous conformer
          à la réglementation en vigueur pour l'envoi de SMS transactionnels.
        </p>
        <UiAlert variant="destructive" class="mt-3">
          <p class="font-medium">
            Sans enregistrement conforme, vos SMS transactionnels à destination des États-Unis
            ou du Canada ne pourront pas être envoyés.
          </p>
        </UiAlert>
      </UiCardContent>
    </UiCard>

    <form @submit.prevent="handleSubmitClick" class="space-y-6">
      <!-- Section 1: Company Information -->
      <UiCard>
        <UiCardHeader>
          <UiCardTitle class="text-lg">Informations sur l'entreprise</UiCardTitle>
        </UiCardHeader>
        <UiCardContent class="space-y-4">
          <div>
            <UiLabel for="companyName" :required="true">Nom de l'entreprise</UiLabel>
            <UiInput
              id="companyName"
              name="companyName"
              v-model="form.companyName"
              required
              class="mt-1.5"
            />
          </div>

          <div>
            <UiLabel for="corporateWebsite">Site web de l'entreprise</UiLabel>
            <UiInput
              id="corporateWebsite"
              name="corporateWebsite"
              type="url"
              v-model="form.corporateWebsite"
              placeholder="https://"
              class="mt-1.5"
            />
          </div>

          <div>
            <UiLabel for="businessAddress1" :required="true">Adresse professionnelle (ligne 1)</UiLabel>
            <UiInput
              id="businessAddress1"
              name="businessAddress1"
              v-model="form.businessAddress1"
              required
              class="mt-1.5"
            />
          </div>

          <div>
            <UiLabel for="businessAddress2">Adresse professionnelle (ligne 2)</UiLabel>
            <UiInput
              id="businessAddress2"
              name="businessAddress2"
              v-model="form.businessAddress2"
              class="mt-1.5"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <UiLabel for="city" :required="true">Ville</UiLabel>
              <UiInput id="city" name="city" v-model="form.city" required class="mt-1.5" />
            </div>
            <div>
              <UiLabel for="zip" :required="true">Code postal</UiLabel>
              <UiInput id="zip" name="zip" v-model="form.zip" required class="mt-1.5" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <UiLabel for="stateAbbreviation" :required="true">Département</UiLabel>
              <UiInput
                id="stateAbbreviation"
                name="stateAbbreviation"
                v-model="form.stateAbbreviation"
                placeholder="ex : 75, 69, 33"
                required
                class="mt-1.5"
              />
            </div>
            <div>
              <UiLabel for="countryIsoCode" :required="true">Code pays ISO</UiLabel>
              <UiInput
                id="countryIsoCode"
                name="countryIsoCode"
                v-model="form.countryIsoCode"
                placeholder="ex : US, CA"
                required
                class="mt-1.5"
              />
            </div>
          </div>

          <div>
            <UiLabel for="registrationNumber" :required="true">Numéro d'immatriculation</UiLabel>
            <UiInput
              id="registrationNumber"
              name="registrationNumber"
              v-model="form.registrationNumber"
              required
              class="mt-1.5"
            />
          </div>

          <div>
            <UiLabel for="registrationNumberType" :required="true">Type de document d'immatriculation</UiLabel>
            <UiSelect
              id="registrationNumberType"
              name="registrationNumberType"
              v-model="form.registrationNumberType"
              required
              class="mt-1.5"
            >
              <option value="" disabled>Sélectionnez...</option>
              <option v-for="opt in REGISTRATION_NUMBER_TYPES" :key="opt" :value="opt">{{ opt }}</option>
            </UiSelect>
          </div>
        </UiCardContent>
      </UiCard>

      <!-- Section 2: Contact Information -->
      <UiCard>
        <UiCardHeader>
          <UiCardTitle class="text-lg">Informations de contact</UiCardTitle>
        </UiCardHeader>
        <UiCardContent class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <UiLabel for="contactFirstName" :required="true">Prénom</UiLabel>
              <UiInput
                id="contactFirstName"
                name="contactFirstName"
                v-model="form.contactFirstName"
                required
                class="mt-1.5"
              />
            </div>
            <div>
              <UiLabel for="contactLastName" :required="true">Nom</UiLabel>
              <UiInput
                id="contactLastName"
                name="contactLastName"
                v-model="form.contactLastName"
                required
                class="mt-1.5"
              />
            </div>
          </div>

          <div>
            <UiLabel for="contactEmail" :required="true">Email professionnel</UiLabel>
            <UiInput
              id="contactEmail"
              name="contactEmail"
              type="email"
              v-model="form.contactEmail"
              required
              class="mt-1.5"
            />
          </div>

          <div>
            <UiLabel for="contactPhone" :required="true">Numéro de téléphone professionnel</UiLabel>
            <UiInput
              id="contactPhone"
              name="contactPhone"
              type="tel"
              v-model="form.contactPhone"
              placeholder="+1 (555) 123-4567"
              required
              class="mt-1.5"
            />
          </div>
        </UiCardContent>
      </UiCard>

      <!-- Consent & Submit -->
      <UiCard>
        <UiCardContent class="pt-6">
          <div class="flex items-start gap-3 mb-6">
            <UiCheckbox
              id="consent"
              v-model="consent"
              class="mt-0.5"
            />
            <label for="consent" class="text-sm text-muted-foreground leading-relaxed cursor-pointer">
              En soumettant ce formulaire, je déclare que les informations fournies sont exactes.
              Je reconnais que Noviamind traitera les informations fournies
              et les partagera avec les partenaires américains nécessaires, aux fins de vérification
              d'identité, et que Noviamind se réserve le droit de conserver
              les informations du profil client après la fermeture du compte en cas de demande d'une
              autorité de régulation ou équivalente. Noviamind traitera vos
              données personnelles conformément à la
              <a
                href="https://noviamind.ai/fr/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                class="text-noviamind-purple underline hover:text-noviamind-purple/80"
              >Politique de Confidentialité</a>.
            </label>
          </div>

          <!-- Error alert -->
          <UiAlert v-if="submitStatus === 'error'" variant="destructive" class="mb-4">
            <p>{{ errorMessage }}</p>
          </UiAlert>

          <UiButton
            type="submit"
            variant="noviamind"
            :disabled="isSubmitting"
            class="w-full h-11 text-base"
          >
            {{ isSubmitting ? 'Envoi en cours...' : "Soumettre l'enregistrement" }}
          </UiButton>
        </UiCardContent>
      </UiCard>
    </form>

    <!-- Confirmation modal -->
    <Teleport to="body">
      <div v-if="showConfirmation" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click="cancelSubmit" />
        <UiCard class="relative z-10 max-w-md mx-4 shadow-xl">
          <UiCardHeader>
            <UiCardTitle class="text-lg">Confirmer l'envoi</UiCardTitle>
          </UiCardHeader>
          <UiCardContent class="space-y-4">
            <p class="text-sm text-muted-foreground">
              Êtes-vous sûr de vouloir soumettre cet enregistrement ?
              Un email récapitulatif sera envoyé à <strong>{{ form.contactEmail }}</strong> ainsi qu'à notre équipe.
            </p>
            <div class="flex gap-3 justify-end">
              <UiButton type="button" variant="outline" @click="cancelSubmit">Annuler</UiButton>
              <UiButton type="button" variant="noviamind" @click="confirmSubmit">Confirmer</UiButton>
            </div>
          </UiCardContent>
        </UiCard>
      </div>
    </Teleport>
  </div>
</template>
