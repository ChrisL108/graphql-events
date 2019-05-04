const bcrypt = require('bcryptjs')
const Event = require('../../models/event')
const User = require('../../models/user')
const Booking = require('../../models/booking')

const transformEvent = event => {
  return {
    ...event._doc,
    _id: event.id,
    date: new Date(event._doc.date).toISOString(),
    creator: user.bind(this, event._doc.creator),
  }
}

const events = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } })
    events.map(event => {
      return transformEvent(event)
    })
  } catch (err) {
    throw err
  }
}

const singleEvent = async eventId => {
  try {
    const event = await Event.findById(eventId)
    return {
      ...event._doc,
      _id: event.id,
      creator: user.bind(this, event._doc.creator),
    }
  } catch (err) {
    throw err
  }
}

const user = async userId => {
  try {
    const userInfo = await User.findById(userId)
    return {
      ...userInfo._doc,
      createdEvents: events.bind(this, userInfo._doc.createdEvents),
      // createdEvents: user._doc.createdEvents,
    }
  } catch (err) {
    throw err
  }
}

module.exports = {
  bookings: async () => {
    try {
      const bookings = await Booking.find()
      return bookings.map(booking => {
        return {
          ...booking._doc,
          _id: booking.id,
          user: user.bind(this, booking._doc.user),
          event: singleEvent.bind(this, booking._doc.event),
          createdAt: new Date(booking._doc.createdAt).toISOString(),
          updatedAt: new Date(booking._doc.updatedAt).toISOString(),
        }
      })
    } catch (err) {
      throw err
    }
  },
  events: async () => {
    try {
      const events = await Event.find()
      return events.map(event => {
        // console.log(event)
        return {
          ...event._doc,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event._doc.creator),
          // creator: user.bind(this, '5cca66ba9cefe703b89905a6'),
        }
      })
    } catch (err) {
      throw err
    }
  },
  createEvent: async args => {
    const event = new Event({
      title: args.eventInput.title,
      price: +args.eventInput.price,
      description: args.eventInput.description,
      date: new Date(args.eventInput.date),
      creator: '5cca66ba9cefe703b89905a6', //todo replace w/ dynamic
    })
    let createdEvent
    try {
      const creator = await event.save()
      createdEvent = {
        ...creator._doc,
        _id: creator.id,
        creator: user.bind(this, creator._doc.creator),
      }
      const returnedUser = await User.findById('5cca66ba9cefe703b89905a6')
      if (returnedUser.length === 0) {
        throw new Error('User not found')
      }
      returnedUser.createdEvents.push(event)
      returnedUser.save()
      return createdEvent
    } catch (err) {
      throw err
    }
  },

  createUser: async args => {
    try {
      const existingUser = await User.find({ email: args.userInput.email })
      console.log(existingUser)
      if (existingUser.length > 0) {
        throw new Error('User already exists')
      }
      const hashedPw = await bcrypt.hash(args.userInput.password, 12)

      const newUser = new User({
        email: args.userInput.email,
        password: hashedPw,
      })
      const result = await newUser.save()
      return { ...result._doc, password: `(hidden)` }
    } catch (err) {
      throw err
    }
  },

  createBook: async args => {
    const fetchedEvent = await Event.findOne({ _id: args.eventId })
    const booking = new Booking({
      user: '5cca66ba9cefe703b89905a6',
      event: fetchedEvent,
    })
    const savedBook = await booking.save()
    return {
      ...savedBook._doc,
      _id: savedBook.id,
      user: user.bind(this, booking._doc.user),
      event: singleEvent.bind(this, booking._doc.event),
      createdAt: new Date(savedBook._doc.createdAt).toISOString(),
      updatedAt: new Date(savedBook._doc.updatedAt).toISOString(),
    }
  },

  cancelBook: async args => {
    try {
      const booking = await Booking.findById({ _id: args.bookingId }).populate(
        'event',
      )
      const event = transformEvent(booking.event)
      // const event = {
      //   ...booking.event._doc,
      //   _id: booking.event.id,
      //   creator: user.bind(this, booking.event._doc.creator),
      // }
      // console.log(event)
      await Booking.deleteOne({ _id: args.bookingId })
      return event
    } catch (err) {
      throw err
    }
  },
}
