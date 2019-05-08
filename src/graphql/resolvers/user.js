const bcrypt = require('bcryptjs')
const User = require('../../models/user')

module.exports = {
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
}
