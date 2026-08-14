import { graphql } from '../generated'

export const JournalEntriesDocument = graphql(`
  query JournalEntries($journalId: ID!, $limit: Int, $offset: Int) {
    journalEntries(journalId: $journalId, limit: $limit, offset: $offset) {
      id
      title
      contentText
      moodRating
      createdAt
      updatedAt
    }
  }
`)

export const JournalEntryDocument = graphql(`
  query JournalEntry($id: ID!) {
    journalEntry(id: $id) {
      id
      title
      contentJson
      contentText
      moodRating
      createdAt
      updatedAt
    }
  }
`)

export const CreateJournalEntryDocument = graphql(`
  mutation CreateJournalEntry(
    $journalId: ID!
    $title: String
    $contentJson: JSON!
    $contentText: String!
    $moodRating: Int
  ) {
    createJournalEntry(
      journalId: $journalId
      title: $title
      contentJson: $contentJson
      contentText: $contentText
      moodRating: $moodRating
    ) {
      id
      title
      contentJson
      contentText
      moodRating
      createdAt
      updatedAt
    }
  }
`)

export const UpdateJournalEntryDocument = graphql(`
  mutation UpdateJournalEntry(
    $id: ID!
    $title: String
    $contentJson: JSON
    $contentText: String
    $moodRating: Int
  ) {
    updateJournalEntry(
      id: $id
      title: $title
      contentJson: $contentJson
      contentText: $contentText
      moodRating: $moodRating
    ) {
      id
      title
      contentJson
      contentText
      moodRating
      createdAt
      updatedAt
    }
  }
`)

export const DeleteJournalEntryDocument = graphql(`
  mutation DeleteJournalEntry($id: ID!) {
    deleteJournalEntry(id: $id)
  }
`)
