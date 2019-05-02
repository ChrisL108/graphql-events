const mongoose = require('mongoose')

const Schema = mongoose.Schema

module.exports = mongoose.model(
  'Booking',
  new Schema(
    {
      event: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
      },

      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    {
      timestamps: true,
    },
  ),
)
