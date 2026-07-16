/**
 * Google (and most OAuth) sign-in populates `user_metadata.avatar_url` /
 * `.picture` with the provider's profile photo — used as the default so a
 * rider isn't stuck with no photo just because they skipped the upload step.
 */
export function getOAuthAvatarUrl(
  userMetadata: Record<string, unknown> | undefined,
): string | undefined {
  const avatarUrl = userMetadata?.avatar_url ?? userMetadata?.picture;
  return typeof avatarUrl === "string" && avatarUrl.length > 0 ? avatarUrl : undefined;
}
