import type { GitClient } from '@conventional-changelog/git-client';
import type { GitLogParams, Params } from '@conventional-changelog/git-client';

interface CommitFormatter<T> {
  format: string;
  parseFn: (raw: string) => T;
}

async function getCommits<T>(
  client: GitClient,
  { format, parseFn }: CommitFormatter<T>,
  params?: GitLogParams & Params,
): Promise<T[]> {
  const results: T[] = [];
  for await (const row of client.getRawCommits({ ...params, format }))
    results.push(parseFn(row));
  return results;
}

const SUMMARY: CommitFormatter<string> = {
  format: '%s',
  parseFn: (it) => it,
};

export async function getCommitSummary(
  client: GitClient,
  params?: GitLogParams & Params,
): Promise<string[]> {
  return getCommits<string>(client, SUMMARY, params);
}

type Commit = { hash: string; date: Date; subject: string; body: string };
const DETAILS: CommitFormatter<Commit> = {
  format: '%h\x1f%cI\x1f%s\x1f%b',
  parseFn(msg) {
    const [hash, date, subject, body] = msg.split('\x1f');
    return {
      hash,
      date: new Date(date),
      subject: subject.trim(),
      body: body.trim(),
    };
  },
};

export async function getCommitDetails(
  client: GitClient,
  params?: GitLogParams & Params,
): Promise<Commit[]> {
  return getCommits(client, DETAILS, params);
}
