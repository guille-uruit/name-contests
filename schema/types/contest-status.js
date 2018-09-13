const {
    GraphQLEnumType,
} = require('graphql');

module.exports = new GraphQLEnumType({
    name: 'ContestStatus',
    values: {
        DRAFT: { value: 'draft' },
        PUBLISHED: { value: 'published' },
        ARCHIVED: { value: 'archived' }
    }
});
