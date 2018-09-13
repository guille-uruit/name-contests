const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
    GraphQLID,
    GraphQLList
} = require('graphql');

// const pgdb = require('../../database/pgdb');
const ContestStatusType = require('./contest-status');
const NameType = require('./name');

module.exports = new GraphQLObjectType({
    name: 'Contest',
    fields: () => {
        return {
            id: { type: GraphQLID },
            code: { type: new GraphQLNonNull(GraphQLString) },
            title: { type: new GraphQLNonNull(GraphQLString) },
            description: { type: GraphQLString },
            status: { type: new GraphQLNonNull(ContestStatusType) },
            createdAt: { type: new GraphQLNonNull(GraphQLString) },
            names: {
                type: new GraphQLList(NameType),
                resolve(obj, args, { loaders }) {
                    return loaders.namesForContestIds.load(obj.id);
                    // return pgdb(pgPool).getNames(obj);
                }
            }
        };
    }
});