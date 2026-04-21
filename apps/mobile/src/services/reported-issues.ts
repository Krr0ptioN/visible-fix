import AsyncStorage from '@react-native-async-storage/async-storage';

const REPORTED_ISSUE_IDS_KEY = '@visiblefix_reported_issue_ids';

export async function getReportedIssueIds() {
  const raw = await AsyncStorage.getItem(REPORTED_ISSUE_IDS_KEY);
  if (!raw) return [] as string[];

  try {
    const parsed = JSON.parse(raw) as string[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export async function addReportedIssueId(issueId: string) {
  const current = await getReportedIssueIds();
  const next = Array.from(new Set([issueId, ...current])).slice(0, 200);
  await AsyncStorage.setItem(REPORTED_ISSUE_IDS_KEY, JSON.stringify(next));
}
