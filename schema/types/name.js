const {
    GraphQLID,
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull
} = require('graphql');

// const pgdb = require('../../database/pgdb');

module.exports = new GraphQLObjectType({
    name: 'Name',

    fields: () => {
        const UserType = require('./user');
        const TotalVotesType = require('./total-votes');

        return {
            id: { type: GraphQLID },
            label: { type: GraphQLNonNull(GraphQLString) },
            description: { type: GraphQLString },
            createdAt: { type: GraphQLNonNull(GraphQLString) },
            createdBy: {
                type: GraphQLNonNull(UserType),
                resolve(obj, args, { loaders }) {
                    return loaders.usersByIds.load(obj.createdBy);
                    // return pgdb(pgPool).getUserById(obj.createdBy);
                }
            },
            totalVotes: {
                type: TotalVotesType,
                resolve(obj, args, { loaders }) {
                    return loaders.totalVotesByNameIds.load(obj.id);
                }
            }
        };
    }
});