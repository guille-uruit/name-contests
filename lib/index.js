const { nodeEnv } = require('./util');
console.log(`Running in ${nodeEnv} mode...`);

const DataLoader = require('dataloader');
const app = require('express')();
const graphqlHTTP = require('express-graphql');

const pg = require('pg');
const pgConfig = require('../config/pg')[nodeEnv];
const pgPool = new pg.Pool(pgConfig);
const pgdb = require('../database/pgdb')(pgPool);

const { MongoClient, Logger } = require('mongodb');
const assert = require('assert');
const mConfig = require('../config/mongo')[nodeEnv];


// // Read the query from the command line arguments
// const query = `{${process.argv[2]}}`;
// console.log(process.argv);

const ncSchema = require('../schema/index');
// const { graphql } = require('graphql');


MongoClient.connect(mConfig.url, (err, mPool) => {
    assert.equal(err, null);
    Logger.setLevel('debug');
    Logger.filter('class', ['Server']);
    const mdb = require('../database/mdb')(mPool);

    app.use('/graphql', (req, res) => {
        const loaders = {
            usersByIds: new DataLoader(pgdb.getUsersByIds),
            usersByApiKeys: new DataLoader(pgdb.getUsersByApiKeys),
            contestsForUserIds: new DataLoader(pgdb.getContestsForUserIds),
            namesForContestIds: new DataLoader(pgdb.getNamesForContestIds),
            totalVotesByNameIds: new DataLoader(pgdb.getTotalVotesByNameIds),
            activitiesForUserIds: new DataLoader(pgdb.getActivitiesForUserIds),
            mdb: {
                usersByIds: new DataLoader(mdb.getUsersByIds)
            }
        };
        graphqlHTTP({
            schema: ncSchema,
            graphiql: true,
            context: { pgPool, mPool, loaders }
        })(req, res);
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });

});


// --------------------------------------------

// Execute the query against the define server schema
// graphql(ncSchema, query).then(
//     result => {
//         console.log(result);
//     }
// );
