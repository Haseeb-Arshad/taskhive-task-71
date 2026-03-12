import { SeoAnalysis } from './types';

const clean = (text: string) => text.trim().toLowerCase();

export function analyzeSeo(
  title: string,
  content: string,
  metaDescription: string,
  tags: string[]
): SeoAnalysis {
  const normalizedTitle = clean(title);
  const normalizedContent = clean(content);
  const normalizedMeta = clean(metaDescription);
  const firstKeyword = tags[0]?.trim().toLowerCase() ?? '';

  const checks = {
    titleLength: title.trim().length >= 35 && title.trim().length <= 65,
    contentLength: content.trim().length >= 600,
    metaDescriptionLength: normalizedMeta.length >= 120 && normalizedMeta.length <= 160,
    keywordInTitle: firstKeyword.length > 0 && normalizedTitle.includes(firstKeyword),
    keywordInContent: firstKeyword.length > 0 && normalizedContent.includes(firstKeyword),
    hasTags: tags.length >= 2
  };

  const totalChecks = Object.keys(checks).length;
  const passedChecks = Object.values(checks).filter(Boolean).length;
  const score = Math.round((passedChecks / totalChecks) * 100);

  const suggestions: string[] = [];

  if (!checks.titleLength) {
    suggestions.push('Keep title between 35–65 characters for stronger SERP readability.');
  }
  if (!checks.contentLength) {
    suggestions.push('Expand content to at least 600 characters for richer indexing context.');
  }
  if (!checks.metaDescriptionLength) {
    suggestions.push('Meta description should be 120–160 characters.');
  }
  if (!checks.hasTags) {
    suggestions.push('Add at least 2 tags to improve discoverability.');
  }
  if (firstKeyword.length === 0) {
    suggestions.push('Add tags so primary keyword checks can be performed.');
  } else {
    if (!checks.keywordInTitle) {
      suggestions.push(`Include primary keyword "${firstKeyword}" in the title.`);
    }
    if (!checks.keywordInContent) {
      suggestions.push(`Use primary keyword "${firstKeyword}" naturally in content.`);
    }
  }

  return {
    score,
    checks,
    suggestions
  };
}
