<script lang="ts">
	import type { PageData } from './$types';
	import { settings } from '$lib/stores/settings';
	import type { ColorScheme, TileAppearanceMode } from '$lib/stores/settings';

	let { data }: { data: PageData } = $props();

	const colorSchemeOptions: { value: ColorScheme; label: string }[] = [
	  { value: 'light', label: 'Light' },
	  { value: 'dark', label: 'Dark' },
	  { value: 'system', label: 'Match device' }
	];

	const tileAppearanceOptions: { value: TileAppearanceMode; label: string }[] = [
	  { value: 'color', label: 'Colors only' },
	  { value: 'lines', label: 'Lines only' },
	  { value: 'colorAndLines', label: 'Colors + lines' }
	];
</script>

<svelte:head>
	<title>Settings</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<main class="mx-auto max-w-5xl px-4 py-10">
		<h1 class="text-2xl font-bold text-gray-900">Settings</h1>

		<div class="mt-6 space-y-6">
			<!-- Color scheme -->
			<section class="rounded-2xl bg-white p-8 shadow-sm">
				<h2 class="text-base font-semibold text-gray-900">Appearance</h2>
				<p class="mt-1 text-sm text-gray-500">
					Choose how Flip looks. This changes menus and the puzzle background.
				</p>
				<div class="mt-4 space-y-2">
					{#each colorSchemeOptions as option}
						<button
							type="button"
							class="flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors {$settings.colorScheme === option.value
							  ? 'border-gray-900 bg-gray-100'
							  : 'border-gray-200 bg-white hover:bg-gray-50'}"
							onclick={() => settings.setColorScheme(option.value)}
						>
							<span class="text-sm font-medium text-gray-900">{option.label}</span>
							{#if $settings.colorScheme === option.value}
								<span class="text-gray-600" aria-hidden="true">✓</span>
							{/if}
						</button>
					{/each}
				</div>
			</section>

			<!-- Accessibility – tile appearance -->
			<section class="rounded-2xl bg-white p-8 shadow-sm">
				<h2 class="text-base font-semibold text-gray-900">Accessibility</h2>
				<p class="mt-1 text-sm text-gray-500">
					Choose how puzzle tiles are displayed. Lines can help if colors are hard to tell apart.
				</p>
				<div class="mt-4 space-y-2">
					{#each tileAppearanceOptions as option}
						<button
							type="button"
							class="flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors {$settings.tileAppearanceMode === option.value
							  ? 'border-gray-900 bg-gray-100'
							  : 'border-gray-200 bg-white hover:bg-gray-50'}"
							onclick={() => settings.setTileAppearanceMode(option.value)}
						>
							<span class="text-sm font-medium text-gray-900">{option.label}</span>
							{#if $settings.tileAppearanceMode === option.value}
								<span class="text-gray-600" aria-hidden="true">✓</span>
							{/if}
						</button>
					{/each}
				</div>
				<p class="mt-3 text-xs text-gray-500">
					Changes apply immediately — no need to save.
				</p>
			</section>

			<!-- Profile -->
			<section class="rounded-2xl bg-white p-8 shadow-sm">
				<h2 class="text-base font-semibold text-gray-900">Profile</h2>
				<p class="mt-1 text-sm text-gray-500">Signed in with your Google account.</p>

				<div class="mt-6 flex items-center gap-5">
					{#if data.user.image}
						<img
							src={data.user.image}
							alt={data.user.name}
							referrerpolicy="no-referrer"
							class="h-16 w-16 rounded-full object-cover ring-2 ring-gray-100"
						/>
					{:else}
						<div class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-xl font-semibold text-gray-500">
							{data.user.name?.charAt(0).toUpperCase() ?? '?'}
						</div>
					{/if}
					<div>
						<p class="text-sm font-medium text-gray-900">{data.user.name}</p>
						<p class="text-sm text-gray-500">{data.user.email}</p>
					</div>
				</div>
			</section>
		</div>
	</main>
</div>
