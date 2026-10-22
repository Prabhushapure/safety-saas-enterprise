const RESERVED_SLUGS = new Set(['me', 'admin', 'internal', 'login', 'api']);

export function normalizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function validateSlug(slug) {
  if (!slug) {
    return 'Company slug is required for enterprise accounts';
  }

  if (RESERVED_SLUGS.has(slug)) {
    return 'That slug is reserved. Choose a different company URL.';
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return 'Slug must be lowercase letters, numbers, and hyphens';
  }

  return null;
}
