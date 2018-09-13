// Import type helpers from graphql-js
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull
} = require('graphql');

const pgdb = require('../database/pgdb');
const UserType = require('./types/user');

// The root query type is where in the data graph
// we can start asking questions
const RootQueryType = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        hello: {
            type: GraphQLString,
            description: 'The *mandatory* hello world example GraphQL style',
            resolve: () => 'world'
        },
        user: {
            type: UserType,
            description: 'The current user identified by an api key',
            args: {
                key: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve: (obj, args, { loaders }) => {
                return loaders.usersByApiKeys.load(args.key);
                // return pgdb(pgPool).getUserByApiKey(args.key);
            }
        }
    }
});

const AddContestMutation = require('./mutations/add-contest');
const AddNameMutation = require('./mutations/add-name');

const RootMutationType = new GraphQLObjectType({
    name: 'RootMutationType',

    fields: () => ({
        AddContest: AddContestMutation,
        AddName: AddNameMutation
    })
});

const ncSchema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
});

module.exports = ncSchema;