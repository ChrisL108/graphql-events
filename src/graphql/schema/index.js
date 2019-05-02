const { buildSchema } = require('graphql')
module.exports = buildSchema(`
    type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
        creator: User!
    }

    type User {
      _id: String!
      email: String!
      password: String
      createdEvents: [Event!]
    }
    
    type Booking {
      _id: String!
      event: Event!
      user: User!
      createdAt: String!
      updatedAt: String!
    }

    input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
    }

    input UserInput {
      email: String!
      password: String!
    }

    type RootQuery {
        events: [Event!]!
        bookings: [Booking!]!
    }

    type RootMutation {
        createEvent(eventInput: EventInput): Event
        createUser(userInput: UserInput): User
        createBook(eventId: ID!): Booking!
        cancelBook(bookingId: ID!): Booking!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`)
