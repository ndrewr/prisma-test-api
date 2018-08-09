const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')

const resolvers = {
  Query: {
    events(parent, args, ctx, info) {
      return ctx.db.query.events({ }, info)
    },
    event(parent, args, ctx, info) {
      return ctx.db.query.event({ where: { id: args.id } }, info)
    },
    orgs(parent, args, ctx, info) {
      return ctx.db.query.orgs({ }, info)
    },
  },
  Mutation: {
    attendEvent: (parent, args, ctx, info) => {
      return ctx.db.mutation.updateEvent(
        {
          where: { id: args.id },
          data: { attendees: args.attendees + 1 },
        },
        info,
      )
    },
    createEvent: (parent, args, ctx, info) => {
      // TODO: can we read the logged-in org fields and fill in "cause" below
      //
      const event = {
        name: args.name,
        cause: args.cause,
        date: args.date,
        description: args.description,
        hostid: args.hostid,
        image_url: args.image_url,
        event_url: args.event_url,
        location: args.location,
      }

      return ctx.db.mutation.createEvent(
        {
          data: event
        },
        info,
      )
    }
  },
}

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    db: new Prisma({
      typeDefs: 'src/generated/prisma.graphql',
      endpoint: 'https://us1.prisma.sh/people-protest/protest-api/dev',
      secret: 'mysecret123',
      debug: true,
    }),
  }),
})

console.log('start er up...')

server.start(
    { 
      debug: true,
    },
    () => {
      console.log(`server running on http://localhost:4000`)
    }
)

