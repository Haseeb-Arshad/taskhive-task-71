import { SeoAnalysis, SeoCheck } from './types';

export function analyzeSeo(
  title: string,
  content: string,
  metaDescription: string,
  tags: string[]
): SeoAnalysis {
  const checks: SeoCheck[] = [];

  // Title checks
  checks.push({
    label: 'Title length',
    passed: title.length >= 30 && title.length <= 70,
    message:
      title.length < 30
        ? `Title too short (${title.length}/30 min chars)`
        : title.length > 70
        ? `Title too long (${title.length}/70 max chars)`
        : `Title length is great (${title.length} chars)`
  });

  checks.push({
    label: 'Title has keyword',
    passed: title.trim().split(/\s+/).length >= 3,
    message:
      title.trim().split(/\s+/).length >= 3
        ? 'Title contains multiple words (good for keywords)'
        : 'Title should have at least 3 words'
  });

  // Meta description
  checks.push({
    label: 'Meta description length',
    passed: metaDescription.length >= 120 && metaDescription.length <= 160,
    message:
      metaDescription.length === 0
        ? 'Meta description is missing'
        : metaDescription.length < 120
        ? `Meta description too short (${metaDescription.length}/120 min)`
        : metaDescription.length > 160
        ? `Meta description too long (${metaDescription.length}/160 max)`
        : `Meta description length is perfect (${metaDescription.length} chars)`
  });

  // Content length
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  checks.push({
    label: 'Content length',
    passed: wordCount >= 300,
    message:
      wordCount >= 300
        ? `Content has ${wordCount} words (great!)`
        : `Content needs more words (${wordCount}/300 min)`
  });

  // Tags
  checks.push({
    label: 'Tags present',
    passed: tags.length >= 2,
    message:
      tags.length >= 2
        ? `${tags.length} tags added (good for discoverability)`
        : `Add at least 2 tags (currently ${tags.length})`
  });

  // Keyword in content
  const titleWords = title
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 4);
  const contentLower = content.toLowerCase();
  const keywordInContent =
    titleWords.length > 0 && titleWords.some((w) => contentLower.includes(w));
  checks.push({
    label: 'Keyword in content',
    passed: keywordInContent,
    message: keywordInContent
      ? 'Title keywords appear in content'
      : 'Include title keywords in your content body'
  });

  // Headings
  const hasHeadings = /#{1,3}\s/.test(content) || /<h[1-3]/i.test(content);
  checks.push({
    label: 'Headings used',
    passed: hasHeadings,
    message: hasHeadings
      ? 'Headings detected in content'
      : 'Add headings (## or ###) to structure your content'
  });

  const passed = checks.filter((c) => c.passed).length;
  const score = Math.round((passed / checks.length) * 100);

  return { score, checks };
}
