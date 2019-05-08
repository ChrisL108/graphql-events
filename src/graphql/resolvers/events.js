const Event = require('../../models/event')
const User = require('../../models/user')
const { dateToString } = require('../../helpers/date')
const { user, transformEvent } = require('./merge')

module.exports = {
  events: async () => {
    try {
      const events = await Event.find()
      return events.map(event => {
        // console.log(event)
        return {
          ...event._doc,
          date: dateToString(event._doc.date),
          creator: user.bind(this, event.creator),
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
      date: dateToString(args.eventInput.date),
      creator: '5cca66ba9cefe703b89905a6', //todo replace w/ dynamic
    })
    let createdEvent
    try {
      const result = await event.save()
      createdEvent = transformEvent(result)
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
}
