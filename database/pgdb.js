const { orderedFor, slug } = require('../lib/util');
const humps = require('humps');

module.exports = pgPool => {   
    return {
        getUsersByIds(usersId) {
            return pgPool.query(`
                select * from users
                where id = ANY($1)
            `, [usersId])
                .then(result => {
                    return orderedFor(result.rows, usersId, 'id', true);
                    // return humps.camelizeKeys(result.rows);
                });
        },

        getUsersByApiKeys(apiKeys) {
            return pgPool.query(`
                select * from users
                where api_key = ANY($1)
            `, [apiKeys])
                .then(result => {
                    // return result.rows[0];
                    return orderedFor(result.rows, apiKeys, 'apiKey', true);
                    // return humps.camelizeKeys(result.rows[0]);
                });
        },

        getContestsForUserIds(userIds) {
            return pgPool.query(`
                select * from contests
                where created_by = ANY($1)
            `, [userIds])
                .then(result => {
                    return orderedFor(result.rows, userIds, 'createdBy', false);
                    // return humps.camelizeKeys(result.rows);
                });
        },

        getNamesForContestIds(contestIds) {
            return pgPool.query(`
                select * from names
                where contest_id = ANY($1)
            `, [contestIds])
                .then(result => {
                    return orderedFor(result.rows, contestIds, 'contestId', false);
                    // return humps.camelizeKeys(result.rows);
                });
        },

        getTotalVotesByNameIds(nameIds) {
            return pgPool.query(`
                select name_id, up, down from total_votes_by_name
                where name_id = ANY($1)
            `, [nameIds])
                .then(result => {
                    return orderedFor(result.rows, nameIds, 'nameId', true);
                    // return humps.camelizeKeys(result.rows);
                });
        },
        
        addNewContest({ apiKey, title, description }) {
            return pgPool.query(`
                insert into contests(code, title, description, created_by)
                values ($1, $2, $3, 
                    (select id from users where api_key = $4))
                    returning *
            `, [slug(title), title, description, apiKey])
            .then(result => {
                return humps.camelizeKeys(result.rows[0]);
            });
        },

        addNewName({ apiKey, contestId, label, description }) {
            return pgPool.query(`
                insert into names(contest_id, label, normalized_label, description, created_by)
                values ($1, $2, $3, $4,
                    (select id from users where api_key = $5))
                    returning *
            `, [contestId, label, slug(label), description, apiKey])
            .then(result => {
                return humps.camelizeKeys(result.rows[0]);
            });
        },

        getActivitiesForUserIds(userIds) {
            return pgPool.query(`
                select created_by, created_at, label, '' as title,
                    'name' as activity_type
                from names
                where created_by = ANY($1)
                union
                select created_by, created_at, '' as label, title,
                'contest' as activity_type
                from contests
                where created_by = ANY($1)
            `, [userIds])
            .then(result => {
                return orderedFor(result.rows, userIds, 'createdBy', false);
            });
        }
    };
};