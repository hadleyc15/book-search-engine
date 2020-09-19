// import User and Book models
const { User, Book } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
         
        me: async (parent, args, context) => {
          if (context.user) {
            const userData = await User.findOne({ _id: context.user._id })
              .select('-__v -password')
              // .populate('books')        
            return userData;
          }        
          throw new AuthenticationError('Not logged in');
        },
      },

    Mutation: {

      addUser: async ( parent, args ) => {
          const user = await User.create( args );
          const token = signToken( user );    
          return { token, user };  // fixed user/token
        },

      login: async (parent, { email, password }) => {
          const user = await User.findOne({ email });
         const correctPassword = await user.isCorrectPassword(password); 
         const token = signToken(user);       
          if (!user) {
            throw new AuthenticationError('Incorrect credentials, try again!');
          }        
          if (!correctPassword) {
            throw new AuthenticationError('Incorrect credentials, try again!');
          }
          return { token, user }; // fixed user/token
      },

      //methods created after adding JWT,       
      saveBook: async (parent, { input }, context) => {
        if (context.user) {
        const savedBookUser = await User.findOneAndUpdate (
            { _id: context.user._id },
            { $push: { savedBooks: input  } },
            { new: true, runValidators: true }
          );
        return { savedBookUser };
        }
        throw new AuthenticationError('You need to be logged in!');
      },
      
      removeBook: async (parent, {bookId}, context) => {
          const savedBookUser = await User.findOneAndUpdate (
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId: bookId } } },
            { new: true }
          );
          return  savedBookUser;
      },
   }
};
  
  
  //export
  module.exports = resolvers;