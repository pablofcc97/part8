const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const Book = require('./models/book')
const User = require('./models/user')
const Author = require('./models/author')

const mongoose = require('mongoose')

const {PubSub} = require('graphql-subscriptions')
const user = require('./models/user')
const pubsub = new PubSub()

const resolvers = {
    Author: {
      bookCount: async (root) => {
        return root.books.length
      }
    },
    Query: {
      bookCount:  async () => Book.collection.countDocuments(),
      authorCount:  async () => Author.collection.countDocuments(),
      allAuthors: async () =>  {
                                //agregado populate
          return Author.find({}).populate('books')
      },
      allBooks: async (root, args) => {
        let result = await Book.find({}).populate('author')
        if(args.author){
          result=result.filter(b => b.author.name === args.author)
        }
        if(args.genre){
          result=result.filter(b => b.genres.includes(args.genre))
        }
        return result
      },
      me: (root, args, context) => {
        return context.currentUser
      }
    },
    Mutation: {
      addBook: async (root, args, context) => {
        const currentUser = context.currentUser
  
        if (!currentUser) {
          throw new GraphQLError('not authenticated', {
            extensions: {
              code: 'BAD_USER_INPUT',
            }
          })
        }
  
        let author = await Author.findOne({ name: args.author })
  
        if(!author){
          const newAuthor = new Author({name:args.author, born:null})
          try{
            await newAuthor.save()
          } catch(error){
            throw new GraphQLError('Saving author failed', {
              extensions: {
                code: 'BAD_AUTHOR_INPUT',
                error
              }
            })
          }
          author = newAuthor
          console.log(author)
        }
  
        const book = new Book({ ...args, author: author._id })
        try{
          const savedBook = await book.save()
          author.books.push(savedBook._id)
          await author.save()
        } catch(error){
          throw new GraphQLError('Saving book failed', {
            extensions: {
              code: 'BAD_AUTHOR_INPUT',
              error
            }
          })
        }
        //const books = await book.populate('author')
        pubsub.publish('BOOK_ADDED', { bookAdded: book.populate('author') })
        return await book.populate('author')
      },
      editAuthor: async (root, args, context) => {
        const currentUser = context.currentUser
  
        if (!currentUser) {
          throw new GraphQLError('not authenticated', {
            extensions: {
              code: 'BAD_USER_INPUT',
            }
          })
        }
  
        const author = await Author.findOne({ name: args.name })
        author.born = args.setBornTo
        try{
          return author.save()
        } catch(error){
          throw new GraphQLError('Editing author failed', {
            extensions: {
              code: 'BAD_YEAR_INPUT',
              error
            }
          })
        }
      },
      createUser: async (root, args) => {
        const user = new User({username: args.username, favoriteGenre: args.favoriteGenre})
        return user.save()
          .catch(error => {
            throw new GraphQLError('Adding user failed', {
              extensions: {
                code: 'BAD_USER_INPUT',
                error
              }
            })
          })
      },
      login: async (root, args) => {
        const user = await User.findOne({username: args.username})
  
        if(!user || args.password !== 'secret'){
          throw new GraphQLError('Adding user failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              error
            }
          })
        }
  
        const userForToken = {
          userName: user.username,
          id: user._id,
        }
  
        return { value: jwt.sign(userForToken, process.env.JWT_SECRET)}
      }
    },
    Subscription: {
      bookAdded: {
        subscribe: () => {
         return pubsub.asyncIterator(['BOOK_ADDED'])
        }
      },
    },
  }

  module.exports = resolvers