import { graphql } from '../generated'

export const JournalsDocument = graphql(`
  query Journals {
    journals {
      id
      name
      entryCount
      createdAt
    }
  }
`)

export const JournalDocument = graphql(`
  query Journal($id: ID!) {
    journal(id: $id) {
      id
      name
      entryCount
      createdAt
    }
  }
`)

export const CreateJournalDocument = graphql(`
  mutation CreateJournal($name: String!) {
    createJournal(name: $name) {
      id
      name
      entryCount
      createdAt
    }
  }
`)

export const DeleteJournalDocument = graphql(`
  mutation DeleteJournal($id: ID!) {
    deleteJournal(id: $id)
  }
`)
