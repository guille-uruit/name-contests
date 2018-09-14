const { nodeEnv } = require('./util');
console.log(`Running in ${nodeEnv} mode...`);

const cors = require('cors');

const DataLoader = require('dataloader');
const express = require('express');
const app = express();
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

    var router = express.Router();

    // configure CORS
    const corsOptions = {
        allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "X-Access-Token"],
        credentials: true,
        methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
        // origin: "http://localhost:4200",
        preflightContinue: false
    };
    router.use(cors(corsOptions));

    router.all('/graphql', (req, res) => {
    // app.use('/graphql', (req, res) => {
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

    app.use(router);
    // enable CORS pre-flight
    router.options("*", cors(corsOptions));

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
