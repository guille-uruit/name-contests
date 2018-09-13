// Import type helpers from graphql-js
const {
    GraphQLID,
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
    GraphQLList,
    GraphQLInt
} = require('graphql');

// const { fromSnakeCase } = require('../../lib/util');
// const pgdb = require('../../database/pgdb');
// const mdb = require('../../database/mdb');
const ContestType = require('./contest');
const ActivityType = require('./activity');


module.exports = new GraphQLObjectType({
    name: 'User',
    fields: () => {
        return {
            id: { type: GraphQLID },
            // firstName: { type: GraphQLString, resolve: obj => obj.first_name },
            firstName: { type: GraphQLString },
            lastName: { type: GraphQLString },
            fullName: {
                type: GraphQLString,
                resolve: obj => `${obj.firstName} ${obj.lastName}`
            },
            createdAt: { type: GraphQLString },
            email: { type: new GraphQLNonNull(GraphQLString) },
            contests: {
                type: GraphQLList(ContestType),
                resolve(obj, args, { loaders }) {
                    return loaders.contestsForUserIds.load(obj.id);
                    // return pgdb(pgPool).getContests(obj);
                }
            },
            contestsCount: {
                type: GraphQLInt,
                resolve(obj, args, { loaders }, { fieldName }) {
                    return loaders.mdb.usersByIds.load(obj.id)
                        .then(res => res[fieldName]);
                }
            },
            namesCount: {
                type: GraphQLInt,
                resolve(obj, args, { loaders }, { fieldName }) {
                    return loaders.mdb.usersByIds.load(obj.id)
                        .then(res => res[fieldName]);
                }
            },
            votesCount: {
                type: GraphQLInt,
                resolve(obj, args, { loaders }, { fieldName }) {
                    return loaders.mdb.usersByIds.load(obj.id)
                        .then(res => res[fieldName]);
                }
            },
            activities: {
                type: new GraphQLList(ActivityType),
                resolve(obj, args, { loaders }) {
                    return loaders.activitiesForUserIds.load(obj.id);
                }
            }
        };
    }
});
