/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation Signup($email: String!, $password: String!, $displayName: String) {\n    signup(email: $email, password: $password, displayName: $displayName) {\n      token\n      user {\n        id\n        email\n        displayName\n        themePreference\n        fontPreference\n      }\n    }\n  }\n": typeof types.SignupDocument,
    "\n  mutation Login($email: String!, $password: String!) {\n    login(email: $email, password: $password) {\n      token\n      user {\n        id\n        email\n        displayName\n        themePreference\n        fontPreference\n      }\n    }\n  }\n": typeof types.LoginDocument,
    "\n  query Me {\n    me {\n      id\n      email\n      displayName\n      themePreference\n      fontPreference\n    }\n  }\n": typeof types.MeDocument,
    "\n  mutation UpdateFontPreference($font: FontFamily!) {\n    updateFontPreference(font: $font) {\n      id\n      fontPreference\n    }\n  }\n": typeof types.UpdateFontPreferenceDocument,
    "\n  query JournalEntries($journalId: ID!, $limit: Int, $offset: Int) {\n    journalEntries(journalId: $journalId, limit: $limit, offset: $offset) {\n      id\n      title\n      contentText\n      moodRating\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.JournalEntriesDocument,
    "\n  query JournalEntry($id: ID!) {\n    journalEntry(id: $id) {\n      id\n      title\n      contentJson\n      contentText\n      moodRating\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.JournalEntryDocument,
    "\n  mutation CreateJournalEntry(\n    $journalId: ID!\n    $title: String\n    $contentJson: JSON!\n    $contentText: String!\n    $moodRating: Int\n  ) {\n    createJournalEntry(\n      journalId: $journalId\n      title: $title\n      contentJson: $contentJson\n      contentText: $contentText\n      moodRating: $moodRating\n    ) {\n      id\n      title\n      contentJson\n      contentText\n      moodRating\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.CreateJournalEntryDocument,
    "\n  mutation UpdateJournalEntry(\n    $id: ID!\n    $title: String\n    $contentJson: JSON\n    $contentText: String\n    $moodRating: Int\n  ) {\n    updateJournalEntry(\n      id: $id\n      title: $title\n      contentJson: $contentJson\n      contentText: $contentText\n      moodRating: $moodRating\n    ) {\n      id\n      title\n      contentJson\n      contentText\n      moodRating\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.UpdateJournalEntryDocument,
    "\n  mutation DeleteJournalEntry($id: ID!) {\n    deleteJournalEntry(id: $id)\n  }\n": typeof types.DeleteJournalEntryDocument,
    "\n  query Journals {\n    journals {\n      id\n      name\n      entryCount\n      createdAt\n    }\n  }\n": typeof types.JournalsDocument,
    "\n  query Journal($id: ID!) {\n    journal(id: $id) {\n      id\n      name\n      entryCount\n      createdAt\n    }\n  }\n": typeof types.JournalDocument,
    "\n  mutation CreateJournal($name: String!) {\n    createJournal(name: $name) {\n      id\n      name\n      entryCount\n      createdAt\n    }\n  }\n": typeof types.CreateJournalDocument,
    "\n  mutation DeleteJournal($id: ID!) {\n    deleteJournal(id: $id)\n  }\n": typeof types.DeleteJournalDocument,
    "\n  query MoodLogs($from: DateTime, $to: DateTime) {\n    moodLogs(from: $from, to: $to) {\n      id\n      date\n      rating\n      note\n    }\n  }\n": typeof types.MoodLogsDocument,
    "\n  mutation UpsertMoodLog($date: DateTime!, $rating: Int!, $note: String) {\n    upsertMoodLog(date: $date, rating: $rating, note: $note) {\n      id\n      date\n      rating\n      note\n    }\n  }\n": typeof types.UpsertMoodLogDocument,
    "\n  mutation UpdateThemePreference($theme: ThemeName!) {\n    updateThemePreference(theme: $theme) {\n      id\n      themePreference\n    }\n  }\n": typeof types.UpdateThemePreferenceDocument,
};
const documents: Documents = {
    "\n  mutation Signup($email: String!, $password: String!, $displayName: String) {\n    signup(email: $email, password: $password, displayName: $displayName) {\n      token\n      user {\n        id\n        email\n        displayName\n        themePreference\n        fontPreference\n      }\n    }\n  }\n": types.SignupDocument,
    "\n  mutation Login($email: String!, $password: String!) {\n    login(email: $email, password: $password) {\n      token\n      user {\n        id\n        email\n        displayName\n        themePreference\n        fontPreference\n      }\n    }\n  }\n": types.LoginDocument,
    "\n  query Me {\n    me {\n      id\n      email\n      displayName\n      themePreference\n      fontPreference\n    }\n  }\n": types.MeDocument,
    "\n  mutation UpdateFontPreference($font: FontFamily!) {\n    updateFontPreference(font: $font) {\n      id\n      fontPreference\n    }\n  }\n": types.UpdateFontPreferenceDocument,
    "\n  query JournalEntries($journalId: ID!, $limit: Int, $offset: Int) {\n    journalEntries(journalId: $journalId, limit: $limit, offset: $offset) {\n      id\n      title\n      contentText\n      moodRating\n      createdAt\n      updatedAt\n    }\n  }\n": types.JournalEntriesDocument,
    "\n  query JournalEntry($id: ID!) {\n    journalEntry(id: $id) {\n      id\n      title\n      contentJson\n      contentText\n      moodRating\n      createdAt\n      updatedAt\n    }\n  }\n": types.JournalEntryDocument,
    "\n  mutation CreateJournalEntry(\n    $journalId: ID!\n    $title: String\n    $contentJson: JSON!\n    $contentText: String!\n    $moodRating: Int\n  ) {\n    createJournalEntry(\n      journalId: $journalId\n      title: $title\n      contentJson: $contentJson\n      contentText: $contentText\n      moodRating: $moodRating\n    ) {\n      id\n      title\n      contentJson\n      contentText\n      moodRating\n      createdAt\n      updatedAt\n    }\n  }\n": types.CreateJournalEntryDocument,
    "\n  mutation UpdateJournalEntry(\n    $id: ID!\n    $title: String\n    $contentJson: JSON\n    $contentText: String\n    $moodRating: Int\n  ) {\n    updateJournalEntry(\n      id: $id\n      title: $title\n      contentJson: $contentJson\n      contentText: $contentText\n      moodRating: $moodRating\n    ) {\n      id\n      title\n      contentJson\n      contentText\n      moodRating\n      createdAt\n      updatedAt\n    }\n  }\n": types.UpdateJournalEntryDocument,
    "\n  mutation DeleteJournalEntry($id: ID!) {\n    deleteJournalEntry(id: $id)\n  }\n": types.DeleteJournalEntryDocument,
    "\n  query Journals {\n    journals {\n      id\n      name\n      entryCount\n      createdAt\n    }\n  }\n": types.JournalsDocument,
    "\n  query Journal($id: ID!) {\n    journal(id: $id) {\n      id\n      name\n      entryCount\n      createdAt\n    }\n  }\n": types.JournalDocument,
    "\n  mutation CreateJournal($name: String!) {\n    createJournal(name: $name) {\n      id\n      name\n      entryCount\n      createdAt\n    }\n  }\n": types.CreateJournalDocument,
    "\n  mutation DeleteJournal($id: ID!) {\n    deleteJournal(id: $id)\n  }\n": types.DeleteJournalDocument,
    "\n  query MoodLogs($from: DateTime, $to: DateTime) {\n    moodLogs(from: $from, to: $to) {\n      id\n      date\n      rating\n      note\n    }\n  }\n": types.MoodLogsDocument,
    "\n  mutation UpsertMoodLog($date: DateTime!, $rating: Int!, $note: String) {\n    upsertMoodLog(date: $date, rating: $rating, note: $note) {\n      id\n      date\n      rating\n      note\n    }\n  }\n": types.UpsertMoodLogDocument,
    "\n  mutation UpdateThemePreference($theme: ThemeName!) {\n    updateThemePreference(theme: $theme) {\n      id\n      themePreference\n    }\n  }\n": types.UpdateThemePreferenceDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Signup($email: String!, $password: String!, $displayName: String) {\n    signup(email: $email, password: $password, displayName: $displayName) {\n      token\n      user {\n        id\n        email\n        displayName\n        themePreference\n        fontPreference\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Signup($email: String!, $password: String!, $displayName: String) {\n    signup(email: $email, password: $password, displayName: $displayName) {\n      token\n      user {\n        id\n        email\n        displayName\n        themePreference\n        fontPreference\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Login($email: String!, $password: String!) {\n    login(email: $email, password: $password) {\n      token\n      user {\n        id\n        email\n        displayName\n        themePreference\n        fontPreference\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Login($email: String!, $password: String!) {\n    login(email: $email, password: $password) {\n      token\n      user {\n        id\n        email\n        displayName\n        themePreference\n        fontPreference\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Me {\n    me {\n      id\n      email\n      displayName\n      themePreference\n      fontPreference\n    }\n  }\n"): (typeof documents)["\n  query Me {\n    me {\n      id\n      email\n      displayName\n      themePreference\n      fontPreference\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateFontPreference($font: FontFamily!) {\n    updateFontPreference(font: $font) {\n      id\n      fontPreference\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateFontPreference($font: FontFamily!) {\n    updateFontPreference(font: $font) {\n      id\n      fontPreference\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query JournalEntries($journalId: ID!, $limit: Int, $offset: Int) {\n    journalEntries(journalId: $journalId, limit: $limit, offset: $offset) {\n      id\n      title\n      contentText\n      moodRating\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query JournalEntries($journalId: ID!, $limit: Int, $offset: Int) {\n    journalEntries(journalId: $journalId, limit: $limit, offset: $offset) {\n      id\n      title\n      contentText\n      moodRating\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query JournalEntry($id: ID!) {\n    journalEntry(id: $id) {\n      id\n      title\n      contentJson\n      contentText\n      moodRating\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query JournalEntry($id: ID!) {\n    journalEntry(id: $id) {\n      id\n      title\n      contentJson\n      contentText\n      moodRating\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateJournalEntry(\n    $journalId: ID!\n    $title: String\n    $contentJson: JSON!\n    $contentText: String!\n    $moodRating: Int\n  ) {\n    createJournalEntry(\n      journalId: $journalId\n      title: $title\n      contentJson: $contentJson\n      contentText: $contentText\n      moodRating: $moodRating\n    ) {\n      id\n      title\n      contentJson\n      contentText\n      moodRating\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation CreateJournalEntry(\n    $journalId: ID!\n    $title: String\n    $contentJson: JSON!\n    $contentText: String!\n    $moodRating: Int\n  ) {\n    createJournalEntry(\n      journalId: $journalId\n      title: $title\n      contentJson: $contentJson\n      contentText: $contentText\n      moodRating: $moodRating\n    ) {\n      id\n      title\n      contentJson\n      contentText\n      moodRating\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateJournalEntry(\n    $id: ID!\n    $title: String\n    $contentJson: JSON\n    $contentText: String\n    $moodRating: Int\n  ) {\n    updateJournalEntry(\n      id: $id\n      title: $title\n      contentJson: $contentJson\n      contentText: $contentText\n      moodRating: $moodRating\n    ) {\n      id\n      title\n      contentJson\n      contentText\n      moodRating\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateJournalEntry(\n    $id: ID!\n    $title: String\n    $contentJson: JSON\n    $contentText: String\n    $moodRating: Int\n  ) {\n    updateJournalEntry(\n      id: $id\n      title: $title\n      contentJson: $contentJson\n      contentText: $contentText\n      moodRating: $moodRating\n    ) {\n      id\n      title\n      contentJson\n      contentText\n      moodRating\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteJournalEntry($id: ID!) {\n    deleteJournalEntry(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteJournalEntry($id: ID!) {\n    deleteJournalEntry(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Journals {\n    journals {\n      id\n      name\n      entryCount\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  query Journals {\n    journals {\n      id\n      name\n      entryCount\n      createdAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Journal($id: ID!) {\n    journal(id: $id) {\n      id\n      name\n      entryCount\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  query Journal($id: ID!) {\n    journal(id: $id) {\n      id\n      name\n      entryCount\n      createdAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateJournal($name: String!) {\n    createJournal(name: $name) {\n      id\n      name\n      entryCount\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  mutation CreateJournal($name: String!) {\n    createJournal(name: $name) {\n      id\n      name\n      entryCount\n      createdAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteJournal($id: ID!) {\n    deleteJournal(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteJournal($id: ID!) {\n    deleteJournal(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MoodLogs($from: DateTime, $to: DateTime) {\n    moodLogs(from: $from, to: $to) {\n      id\n      date\n      rating\n      note\n    }\n  }\n"): (typeof documents)["\n  query MoodLogs($from: DateTime, $to: DateTime) {\n    moodLogs(from: $from, to: $to) {\n      id\n      date\n      rating\n      note\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpsertMoodLog($date: DateTime!, $rating: Int!, $note: String) {\n    upsertMoodLog(date: $date, rating: $rating, note: $note) {\n      id\n      date\n      rating\n      note\n    }\n  }\n"): (typeof documents)["\n  mutation UpsertMoodLog($date: DateTime!, $rating: Int!, $note: String) {\n    upsertMoodLog(date: $date, rating: $rating, note: $note) {\n      id\n      date\n      rating\n      note\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateThemePreference($theme: ThemeName!) {\n    updateThemePreference(theme: $theme) {\n      id\n      themePreference\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateThemePreference($theme: ThemeName!) {\n    updateThemePreference(theme: $theme) {\n      id\n      themePreference\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;