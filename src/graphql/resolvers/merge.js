const User = require('../../models/user')
const Event = require('../../models/event')
const { dateToString } = require('../../helpers/date')

async function events(eventIds) {
  try {
    const events = await Event.find({ _id: { $in: eventIds } })
    events.map(event => {
      return transformEvent(event)
    })
  } catch (err) {
    throw err
  }
}

async function singleEvent(eventId) {
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

async function user(userId) {
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

// HELPERS
const transformEvent = event => {
  return {
    ...event._doc,
    _id: event.id,
    date: dateToString(event._doc.date),
    creator: user.bind(this, event._doc.creator),
  }
}
const transformBooking = booking => {
  return {
    ...booking._doc,
    _id: booking.id,
    user: user.bind(this, booking._doc.user),
    event: singleEvent.bind(this, booking._doc.event),
    createdAt: dateToString(booking._doc.createdAt),
    updatedAt: dateToString(booking._doc.updatedAt),
  }
}

exports.user = user
exports.events = events
exports.singleEvent = singleEvent
exports.transformEvent = transformEvent
exports.transformBooking = transformBooking
