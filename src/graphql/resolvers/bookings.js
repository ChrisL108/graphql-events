const Booking = require('../../models/booking')
const Event = require('../../models/event')
const { dateToString } = require('../../helpers/date')
const { transformEvent, transformBooking } = require('./merge')

module.exports = {
  bookings: async () => {
    try {
      const bookings = await Booking.find()
      return bookings.map(booking => {
        return transformBooking(booking)
      })
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
    return transformBooking(savedBook)
  },

  cancelBook: async args => {
    try {
      const booking = await Booking.findById({ _id: args.bookingId }).populate(
        'event',
      )
      const event = transformEvent(booking.event)
      event.createdAt = dateToString(new Date())
      event.updatedAt = dateToString(new Date())
      await Booking.deleteOne({ _id: args.bookingId })
      return event
    } catch (err) {
      throw err
    }
  },
}
