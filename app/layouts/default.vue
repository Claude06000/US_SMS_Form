<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background">
    <!-- Header -->
    <header class="border-b bg-card">
      <div class="container flex h-16 items-center px-4 max-w-4xl mx-auto">
        <a href="https://noviamind.ai" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3">
          <img
            src="https://noviamind.ai/logo.png"
            alt="NoviaMind"
            class="h-8 dark:hidden"
          />
          <img
            src="https://noviamind.ai/logo-white.png"
            alt="NoviaMind"
            class="h-8 hidden dark:block"
          />
        </a>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1 py-8 px-4">
      <div class="max-w-4xl mx-auto">
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t bg-card py-4 text-center text-sm text-muted-foreground">
      <div class="container max-w-4xl mx-auto px-4">
        © {{ new Date().getFullYear() }} NoviaMind. Tous droits réservés.
      </div>
    </footer>
  </div>
</template>
