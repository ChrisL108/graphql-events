const express = require('express')
const bodyParser = require('body-parser')
const graphqlHttp = require('express-graphql')
const { buildSchema } = require('graphql')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const app = express()
app.use(bodyParser.json())

const events = eventIds => {
  Event.find({ _id: { $in: eventIds } })
    .then(events => {
      return events.map(event => {
        return { ...event._doc, creator: user.bind(this, event._doc.creator) }
      })
    })
    .catch(err => {
      throw err
    })
}

const user = userId => {
  return User.findById(userId)
    .then(user => {
      return {
        ...user._doc,
        createdEvents: events.bind(this, user._doc.createdEvents),
      }
    })
    .catch(err => {
      throw err
    })
}

const Event = require('./models/event')
const User = require('./models/user')

const uri = `mongodb+srv://submissions-58x6r.azure.mongodb.net/${
  process.env.MONGO_DB
}?retryWrites=true`

mongoose.connect(uri, {
  auth: {
    user: process.env.MONGO_USER,
    password: process.env.MONGO_PW,
  },
  useNewUrlParser: true,
})
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  console.log('*****************')
  console.log('Connected to db!')
  console.log('*****************')
})

//the server object listens on port 8080
const schema = buildSchema(`
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
    }

    type RootMutation {
        createEvent(eventInput: EventInput): Event
        createUser(userInput: UserInput): User
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`)

const root = {
  events: () => {
    return (
      Event.find()
        // .populate('creator')
        .then(events => {
          return events.map(event => {
            console.log(event)
            return {
              ...event._doc,
              _id: event.id,
              creator: user.bind(this, event._doc.creator),
              // creator: user.bind(this, '5cc7cad8957f36033b564a1f'),
            }
          })
        })
        .catch(err => {
          throw err
        })
    )
  },
  createEvent: args => {
    const event = new Event({
      title: args.eventInput.title,
      price: +args.eventInput.price,
      description: args.eventInput.description,
      date: new Date(args.eventInput.date),
      creator: '5cc7cad8957f36033b564a1f', //todo replace w/ dynamic
    })
    let createdEvent
    return event
      .save()
      .then(result => {
        createdEvent = { ...result._doc }
        return User.findById('5cc7cad8957f36033b564a1f')
      })
      .then(user => {
        if (user.length == 0) {
          throw new Error('User not found')
        }
        user.createdEvents.push(event)
        user.save()
      })
      .then(result => {
        return createdEvent
      })
      .catch(err => {
        throw err
      })
  },

  createUser: args => {
    return User.find({ email: args.userInput.email })
      .then(user => {
        console.log(user)
        if (user.length > 0) {
          throw new Error('User already exists')
        }
        return bcrypt.hash(args.userInput.password, 12)
      })

      .then(hashedPw => {
        const user = new User({
          email: args.userInput.email,
          password: hashedPw,
        })
        return user.save()
      })
      .then(result => {
        return { ...result._doc, password: `(hidden)` }
      })

      .catch(err => {
        throw err
      })
  },
}
// mongoose.Promise = global.Promise

app.get('/', (req, res) => {
  res.send('hello sir!')
})

app.use(
  '/graphql',
  graphqlHttp({
    schema: schema,
    rootValue: root,
    graphiql: true,
  }),
)

const port = process.env.PORT || 8080
app.listen(port)
