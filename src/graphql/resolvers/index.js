const userResolver = require('./user')
const bookingResolver = require('./bookings')
const eventsResolver = require('./events')

const rootResolver = {
  ...userResolver,
  ...eventsResolver,
  ...bookingResolver,
}

module.exports = rootResolver
