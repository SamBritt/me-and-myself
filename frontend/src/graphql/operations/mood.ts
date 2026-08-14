import { graphql } from '../generated'

export const MoodLogsDocument = graphql(`
  query MoodLogs($from: DateTime, $to: DateTime) {
    moodLogs(from: $from, to: $to) {
      id
      date
      rating
      note
    }
  }
`)

export const UpsertMoodLogDocument = graphql(`
  mutation UpsertMoodLog($date: DateTime!, $rating: Int!, $note: String) {
    upsertMoodLog(date: $date, rating: $rating, note: $note) {
      id
      date
      rating
      note
    }
  }
`)
